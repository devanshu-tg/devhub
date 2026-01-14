const { supabase } = require('../config/supabase');

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

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or expired token' 
      });
    }

    // Attach user to request
    req.user = user;
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
    const { data: { user } } = await supabase.auth.getUser(token);

    req.user = user || null;
    req.token = token || null;

    next();
  } catch (error) {
    // Don't fail, just set user to null
    req.user = null;
    next();
  }
};

module.exports = { authenticate, optionalAuth };
