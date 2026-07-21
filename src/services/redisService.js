"use strict";

const { redis, pubClient } = require("../config/redis");

const CHANNEL = "queue:events";

/**
 * Menghasilkan nomor urut atomik untuk sebuah layanan menggunakan Redis INCR.
 * INCR bersifat atomik di sisi Redis, sehingga meskipun beberapa instance
 * memanggilnya secara bersamaan, setiap pemanggil memperoleh nilai unik.
 * Inilah kunci pencegahan race condition penomoran antrean antar-instance.
 *
 * @param {string} serviceCode kode layanan (mis. 'ADM').
 * @returns {Promise<number>} nomor urut berikutnya.
 */
async function nextQueueNumber(serviceCode) {
  return redis.incr(`queue:counter:${serviceCode}`);
}

/**
 * Menyelaraskan counter Redis dengan nilai terakhir di database.
 * Dipanggil saat startup agar penomoran tidak mundur bila Redis di-reset.
 */
async function syncCounter(serviceCode, lastNumber) {
  const key = `queue:counter:${serviceCode}`;
  const current = await redis.get(key);
  if (current === null || Number(current) < lastNumber) {
    await redis.set(key, lastNumber);
  }
}

/** Cache sederhana untuk nomor antrean aktif per layanan. */
async function setCurrentQueue(serviceCode, queueNumber) {
  await redis.set(`queue:current:${serviceCode}`, queueNumber, "EX", 3600);
}

async function getCurrentQueue(serviceCode) {
  return redis.get(`queue:current:${serviceCode}`);
}

/**
 * Mempublikasikan event antrean ke channel Redis Pub/Sub.
 * Semua instance yang berlangganan akan menerima event ini dan meneruskannya
 * ke klien melalui Socket.IO (sinkronisasi realtime antar-instance).
 */
async function publishEvent(event) {
  await pubClient.publish(CHANNEL, JSON.stringify(event));
}

module.exports = {
  CHANNEL,
  nextQueueNumber,
  syncCounter,
  setCurrentQueue,
  getCurrentQueue,
  publishEvent,
};
