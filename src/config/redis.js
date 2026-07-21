"use strict";

const Redis = require("ioredis");

const baseOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  // Jangan menghentikan aplikasi bila Redis belum siap; coba lagi otomatis.
  retryStrategy(times) {
    return Math.min(times * 200, 2000);
  },
};

/**
 * Koneksi utama Redis untuk operasi biasa (INCR, GET/SET, session store).
 * maxRetriesPerRequest kecil -> command gagal cepat saat Redis mati sehingga
 * jalur pembuatan antrean segera beralih ke fallback database dan health check
 * tidak menggantung lama.
 */
const redis = new Redis({ ...baseOptions, maxRetriesPerRequest: 3 });

/**
 * Koneksi terpisah untuk Pub/Sub. Redis mewajibkan koneksi khusus untuk
 * subscribe, sehingga publisher dan subscriber tidak boleh berbagi koneksi
 * dengan operasi command biasa.
 *
 * maxRetriesPerRequest: null -> command (mis. SUBSCRIBE) menunggu koneksi
 * pulih alih-alih melempar error yang dapat mematikan proses saat Redis mati.
 */
const pubSubOptions = { ...baseOptions, maxRetriesPerRequest: null };
const pubClient = new Redis(pubSubOptions);
const subClient = new Redis(pubSubOptions);

redis.on("connect", () => console.log("[redis] Terhubung ke Redis"));

// Semua klien wajib memiliki error handler agar gangguan koneksi Redis
// tidak memunculkan unhandled error yang mematikan proses instance.
for (const [name, client] of [
  ["redis", redis],
  ["pub", pubClient],
  ["sub", subClient],
]) {
  client.on("error", (err) => console.error(`[redis:${name}] ${err.message}`));
}

module.exports = { redis, pubClient, subClient };
