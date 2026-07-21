"use strict";

const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { pubClient, subClient } = require("../config/redis");
const redisService = require("../services/redisService");

const INSTANCE_NAME = process.env.INSTANCE_NAME || "app1";

/**
 * Menginisialisasi Socket.IO dengan Redis adapter.
 *
 * Redis adapter membuat pesan yang di-emit dari satu instance otomatis
 * disiarkan (broadcast) ke klien yang terhubung pada instance lain. Dengan
 * begitu, pembaruan antrean bersifat realtime lintas seluruh instance backend
 * di belakang load balancer.
 *
 * @param {import('http').Server} httpServer server HTTP milik instance ini.
 */
function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  // Broadcast lintas instance melalui Redis Pub/Sub.
  io.adapter(createAdapter(pubClient, subClient));

  io.on("connection", (socket) => {
    socket.emit("hello", { instance: INSTANCE_NAME });
  });

  // Berlangganan channel event antrean. Ketika instance lain mempublikasikan
  // perubahan (mis. antrean dipanggil), instance ini meneruskannya ke kliennya.
  const localSub = subClient.duplicate();
  localSub.on("error", (err) => console.error("[socket:sub]", err.message));
  localSub.subscribe(redisService.CHANNEL, (err) => {
    if (err) console.error("[socket] Gagal subscribe channel:", err.message);
  });
  localSub.on("message", (channel, message) => {
    if (channel !== redisService.CHANNEL) return;
    try {
      const event = JSON.parse(message);
      io.emit("queue:update", event);
    } catch (e) {
      // Abaikan pesan yang tidak valid.
    }
  });

  return io;
}

module.exports = { initSocket };
