/**
 * Tiny in-memory sliding-window rate limiter. Good enough for single-instance
 * deployments. For multi-instance setups, swap the backing Map for Redis.
 *
 * Usage:
 *   const { rateLimit } = require('./middleware/rateLimit');
 *   router.post('/expensive', rateLimit({ windowMs: 60_000, max: 20, name: 'chat' }), handler);
 */

function clientKey(req, name) {
  const fwd = req.headers['x-forwarded-for'];
  const ip = (typeof fwd === 'string' ? fwd.split(',')[0].trim() : null) || req.ip || 'unknown';
  // If the user is authenticated, key on user id too — prevents one logged-in
  // user from exhausting another user's quota via shared NAT.
  const uid = req.user && req.user.id ? `u:${req.user.id}` : '';
  return `${name}|${ip}|${uid}`;
}

function rateLimit({ windowMs = 60_000, max = 30, name = 'global' } = {}) {
  const buckets = new Map();

  return function rateLimitMiddleware(req, res, next) {
    const key = clientKey(req, name);
    const now = Date.now();
    const list = (buckets.get(key) || []).filter((t) => now - t < windowMs);
    if (list.length >= max) {
      buckets.set(key, list);
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({ error: 'Too many requests' });
    }
    list.push(now);
    buckets.set(key, list);

    // Cheap GC so the Map can't grow without bound.
    if (buckets.size > 10_000) {
      for (const [k, v] of buckets) {
        const fresh = v.filter((t) => now - t < windowMs);
        if (fresh.length === 0) buckets.delete(k);
        else buckets.set(k, fresh);
      }
    }
    return next();
  };
}

module.exports = { rateLimit };
