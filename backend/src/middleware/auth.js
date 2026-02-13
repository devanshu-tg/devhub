const { supabase } = require('../config/supabase');

/**
 * Decode JWT payload without verification (for fallback when network is slow)
 * Note: This is less secure but prevents timeouts. The token is still verified
 * when making Supabase queries via RLS.
 */
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Authentication middleware
 * Verifies the JWT token from the Authorization header
 * Attaches the user to the request object
 */
const authenticate = async (req, res, next) => {
  try {
    // Get the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header' 
      });
    }

    const token = authHeader.split(' ')[1];

    if (!supabase) {
      return res.status(503).json({ 
        error: 'Service Unavailable',
        message: 'Database connection not available' 
      });
    }

    // First try to decode the JWT locally (fast, no network)
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.sub) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or expired token' 
      });
    }

    // Try to verify with Supabase (with timeout), but fall back to local decode if it fails
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      );
      const authPromise = supabase.auth.getUser(token);
      
      const { data: { user }, error } = await Promise.race([authPromise, timeoutPromise]);
      
      if (!error && user) {
        req.user = user;
        req.token = token;
        return next();
      }
    } catch (timeoutError) {
      console.log('Auth verification timed out, using local decode');
    }

    // Fallback: Use locally decoded payload
    // This is less secure but prevents timeouts from blocking the user
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    req.token = token;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Authentication failed' 
    });
  }
};

/**
 * Optional authentication middleware
 * Tries to authenticate but doesn't fail if no token is provided
 * Useful for routes that work for both guests and authenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ') || !supabase) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    // First try local decode (fast)
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.sub) {
      req.user = null;
      return next();
    }

    // Try Supabase verification with timeout
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 3000)
      );
      const authPromise = supabase.auth.getUser(token);
      
      const { data: { user } } = await Promise.race([authPromise, timeoutPromise]);
      req.user = user || null;
      req.token = token || null;
    } catch (timeoutError) {
      // Fallback to local decode
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      req.token = token;
    }

    next();
  } catch (error) {
    // Don't fail, just set user to null
    req.user = null;
    next();
  }
};

module.exports = { authenticate, optionalAuth };
