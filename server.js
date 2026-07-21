"use strict";

require("dotenv").config();

const http = require("http");
const { createApp } = require("./src/app");
const { initSocket } = require("./src/realtime/socket");
const { query } = require("./src/config/database");
const redisService = require("./src/services/redisService");

const PORT = Number(process.env.PORT) || 3001;
const INSTANCE_NAME = process.env.INSTANCE_NAME || "app1";

const app = createApp();
const server = http.createServer(app);

// Inisialisasi Socket.IO (realtime lintas instance via Redis adapter).
initSocket(server);

/**
 * Menyelaraskan counter Redis dengan nilai terakhir di database saat startup,
 * agar penomoran antrean tidak mundur bila Redis baru saja di-reset.
 */
async function syncCounters() {
  try {
    const { rows } = await query(
      "SELECT service_code, last_number FROM services",
    );
    await Promise.all(
      rows.map((s) => redisService.syncCounter(s.service_code, s.last_number)),
    );
  } catch (err) {
    console.warn("[startup] Lewati sinkronisasi counter:", err.message);
  }
}

server.listen(PORT, async () => {
  await syncCounters();
  console.log(
    `[${INSTANCE_NAME}] Server berjalan di port ${PORT} (pid ${process.pid})`,
  );
});

// Penanganan shutdown yang rapi.
function shutdown(signal) {
  console.log(`[${INSTANCE_NAME}] Menerima ${signal}, menutup server ...`);
  server.close(() => process.exit(0));
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
