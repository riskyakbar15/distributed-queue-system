"use strict";

/**
 * Middleware yang menandai setiap response dengan nama instance yang memprosesnya.
 * Ini adalah bukti utama load balancing: header `X-Served-By` dan field JSON
 * `servedBy` memperlihatkan bahwa request dilayani oleh instance berbeda.
 */
const INSTANCE_NAME = process.env.INSTANCE_NAME || "app1";

function servedBy(req, res, next) {
  req.instanceName = INSTANCE_NAME;
  res.set("X-Served-By", INSTANCE_NAME);

  // Bungkus res.json agar otomatis menambahkan field servedBy pada objek respons.
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (body && typeof body === "object" && !Array.isArray(body)) {
      body.servedBy = INSTANCE_NAME;
    }
    return originalJson(body);
  };

  next();
}

module.exports = { servedBy, INSTANCE_NAME };
