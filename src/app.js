"use strict";

const path = require("path");
const express = require("express");
const session = require("express-session");
const RedisStore = require("connect-redis").default;

const { redis } = require("./config/redis");
const { servedBy } = require("./middleware/servedBy");
const { requestLogger } = require("./middleware/requestLogger");

const queueRoutes = require("./routes/queueRoutes");
const adminRoutes = require("./routes/adminRoutes");
const systemRoutes = require("./routes/systemRoutes");

/**
 * Membangun aplikasi Express. Dipisah dari server.js agar mudah diuji.
 */
function createApp() {
  const app = express();

  app.set("trust proxy", 1); // berada di belakang Nginx.
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Tandai instance yang melayani + catat request.
  app.use(servedBy);
  app.use(requestLogger);

  // Session disimpan di Redis sehingga dibagikan antar-instance.
  app.use(
    session({
      store: new RedisStore({ client: redis, prefix: "sess:" }),
      secret: process.env.SESSION_SECRET || "ganti-rahasia-ini",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 8, // 8 jam
      },
    }),
  );

  // API.
  app.use("/api", queueRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api", systemRoutes);

  // Frontend statis.
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Handler 404 untuk rute API.
  app.use("/api", (req, res) => {
    res.status(404).json({ error: "Endpoint tidak ditemukan" });
  });

  // Handler error terpusat.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    if (status >= 500) console.error("[error]", err.message);
    res
      .status(status)
      .json({ error: err.message || "Kesalahan server internal" });
  });

  return app;
}

module.exports = { createApp };
