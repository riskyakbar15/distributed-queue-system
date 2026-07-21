"use strict";

const os = require("os");
const { query } = require("../config/database");
const { redis } = require("../config/redis");
const { recentLogs } = require("../middleware/requestLogger");

const INSTANCE_NAME = process.env.INSTANCE_NAME || "app1";

/** GET /api/health — memeriksa koneksi database dan Redis. */
async function health(req, res) {
  const result = { status: "online", instance: INSTANCE_NAME, checks: {} };

  try {
    await query("SELECT 1");
    result.checks.database = "ok";
  } catch (err) {
    result.checks.database = "error";
    result.status = "degraded";
  }

  try {
    await redis.ping();
    result.checks.redis = "ok";
  } catch (err) {
    result.checks.redis = "error";
    result.status = "degraded";
  }

  const httpStatus = result.status === "online" ? 200 : 503;
  res.status(httpStatus).json(result);
}

/** GET /api/server-info — identitas instance yang memproses request ini. */
function serverInfo(req, res) {
  res.json({
    status: "online",
    instance: INSTANCE_NAME,
    port: Number(process.env.PORT) || 3001,
    hostname: os.hostname(),
    pid: process.pid,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}

/** GET /api/logs — log request terbaru pada instance ini. */
function logs(req, res) {
  res.json({ instance: INSTANCE_NAME, data: recentLogs });
}

module.exports = { health, serverInfo, logs };
