-- ============================================================
-- Seed akun admin default untuk lingkungan Docker.
-- Dijalankan otomatis oleh entrypoint PostgreSQL setelah schema.sql.
-- Password 'admin123' sudah di-hash dengan bcrypt (bcryptjs, cost 10).
-- ============================================================

INSERT INTO admins (username, password_hash, role)
VALUES ('admin', '$2a$10$9pqK.Ivp5e/4C2S.bbjovO6J.phFCj3ITpVmvrwCBAYf/KdgLJDYu', 'admin')
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;
