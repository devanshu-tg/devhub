/**
 * Admin gate. Reads a comma-separated allowlist from the ADMIN_EMAILS env var
 * (e.g. ADMIN_EMAILS="alice@tigergraph.com,bob@tigergraph.com").
 *
 * If ADMIN_EMAILS is unset, EVERY admin-only route is locked down — preferring
 * fail-closed so misconfiguration can't accidentally expose mutation endpoints
 * (which is exactly the bug we just fixed).
 *
 * Must be mounted AFTER `authenticate` so req.user is populated.
 */
function getAllowlist() {
  const raw = process.env.ADMIN_EMAILS || '';
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

function requireAdmin(req, res, next) {
  const allowlist = getAllowlist();
  const email = req.user && req.user.email ? String(req.user.email).toLowerCase() : '';
  if (!email || allowlist.size === 0 || !allowlist.has(email)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

module.exports = { requireAdmin };
