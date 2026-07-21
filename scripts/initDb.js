"use strict";

/**
 * Script inisialisasi database:
 * 1. Menjalankan schema.sql (membuat tabel + seed layanan).
 * 2. Membuat akun admin default dengan password ter-hash bcrypt.
 *
 * Jalankan sekali setelah database PostgreSQL siap:
 *   node scripts/initDb.js
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { pool } = require("../src/config/database");

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "admin123";

async function main() {
  const schemaPath = path.join(__dirname, "..", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  console.log("[initDb] Menjalankan schema.sql ...");
  await pool.query(schemaSql);

  console.log("[initDb] Membuat akun admin default ...");
  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  await pool.query(
    `INSERT INTO admins (username, password_hash, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [DEFAULT_ADMIN_USERNAME, passwordHash],
  );

  console.log("[initDb] Selesai.");
  console.log(
    `[initDb] Login admin -> username: ${DEFAULT_ADMIN_USERNAME}, password: ${DEFAULT_ADMIN_PASSWORD}`,
  );
  await pool.end();
}

main().catch((err) => {
  console.error("[initDb] Gagal:", err.message);
  process.exit(1);
});
