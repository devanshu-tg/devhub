const crypto = require('crypto');
const { supabase } = require('../config/supabase');

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || '';

/**
 * Constant-time, signature-verified JWT decode for Supabase HS256 tokens.
 * Returns the payload on success, or null on any failure.
 * REQUIRES SUPABASE_JWT_SECRET in env to actually verify the signature.
 */
function verifyJwt(token) {
  if (!SUPABASE_JWT_SECRET) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
    if (header.alg !== 'HS256') return null; // refuse `none` and asymmetric variants

    const expected = crypto
      .createHmac('sha256', SUPABASE_JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest();
    const provided = Buffer.from(signatureB64, 'base64url');
    if (provided.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(provided, expected)) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    if (payload.nbf && payload.nbf * 1000 > Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

async function verifyWithSupabase(token) {
  if (!supabase) return null;
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), 8000)
    );
    const { data: { user }, error } = await Promise.race([
      supabase.auth.getUser(token),
      timeoutPromise,
    ]);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Authentication middleware. Fails closed on every error path.
 *
 *   Path A (preferred): SUPABASE_JWT_SECRET is set → verify HS256 signature locally.
 *   Path B (fallback) : call supabase.auth.getUser(). If that fails or times out → 401.
 *
 * The previous implementation accepted an UNSIGNED base64 decode on timeout, which
 * meant any forged token would have been honoured. That path has been removed.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Path A: local signature verification
    const localPayload = verifyJwt(token);
    if (localPayload && localPayload.sub) {
      req.user = { id: localPayload.sub, email: localPayload.email, role: localPayload.role };
      req.token = token;
      return next();
    }

    // Path B: ask Supabase (when JWT secret isn't configured, or when local verify rejects).
    if (!supabase) {
      return res.status(503).json({ error: 'Service Unavailable' });
    }
    const user = await verifyWithSupabase(token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }
    req.user = user;
    req.token = token;
    return next();
  } catch (error) {
    console.error('Auth middleware error');
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

/**
 * Optional auth — like `authenticate` but doesn't reject anonymous requests.
 * A bad / forged token still results in req.user = null (no silent acceptance).
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      req.user = null;
      return next();
    }

    const localPayload = verifyJwt(token);
    if (localPayload && localPayload.sub) {
      req.user = { id: localPayload.sub, email: localPayload.email, role: localPayload.role };
      req.token = token;
      return next();
    }

    if (supabase) {
      const user = await verifyWithSupabase(token);
      req.user = user || null;
      req.token = user ? token : null;
    } else {
      req.user = null;
    }
    return next();
  } catch {
    req.user = null;
    return next();
  }
};

module.exports = { authenticate, optionalAuth };
