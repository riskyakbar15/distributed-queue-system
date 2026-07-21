"use strict";

const fs = require("fs");
const path = require("path");

const INSTANCE_NAME = process.env.INSTANCE_NAME || "app1";
const logsDir = path.join(__dirname, "..", "..", "logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Buffer log sederhana di memori untuk endpoint /api/logs.
const recentLogs = [];
const MAX_RECENT = 50;

/**
 * Middleware pencatat request. Setiap request dicatat beserta instance
 * yang memprosesnya, sehingga terlihat distribusi beban antar-instance.
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const line = `${INSTANCE_NAME} | ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`;

    // Cetak ke stdout (ditangkap oleh `pm2 logs`).
    console.log(line);

    // Simpan ke buffer untuk endpoint /api/logs.
    recentLogs.push({
      instance: INSTANCE_NAME,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs,
      timestamp: new Date().toISOString(),
    });
    if (recentLogs.length > MAX_RECENT) {
      recentLogs.shift();
    }
  });

  next();
}

module.exports = { requestLogger, recentLogs };
