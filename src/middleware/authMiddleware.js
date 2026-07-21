"use strict";

/**
 * Middleware autentikasi admin berbasis session.
 * Session disimpan di Redis (connect-redis) sehingga login tetap valid
 * meskipun request berikutnya diproses oleh instance yang berbeda
 * (shared session antar-instance).
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  return res
    .status(401)
    .json({ error: "Tidak terautentikasi. Silakan login sebagai admin." });
}

module.exports = { requireAdmin };
