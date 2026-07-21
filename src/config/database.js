"use strict";

const { Pool } = require("pg");

/**
 * Pool koneksi PostgreSQL yang dibagikan oleh semua request pada instance ini.
 * Database bersifat terpusat sehingga seluruh instance (app1/app2/app3)
 * membaca dan menulis ke sumber data yang sama.
 */
const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "queue_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("[database] Kesalahan pool PostgreSQL:", err.message);
});

/**
 * Menjalankan query sederhana.
 * @param {string} text SQL query.
 * @param {Array} [params] Parameter query.
 */
function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
