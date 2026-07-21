-- ============================================================
-- Skema Database: Sistem Antrean Layanan Kampus Terdistribusi
-- PostgreSQL
-- ============================================================

-- Hapus tabel lama (urutan diperhatikan karena foreign key)
DROP TABLE IF EXISTS queues CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- ------------------------------------------------------------
-- Tabel Users (mahasiswa)
-- ------------------------------------------------------------
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    nim           VARCHAR(30)  NOT NULL,
    study_program VARCHAR(100),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Tabel Services (jenis layanan)
-- Kolom last_number sebagai cadangan penomoran bila Redis mati (fallback).
-- ------------------------------------------------------------
CREATE TABLE services (
    id           SERIAL PRIMARY KEY,
    service_code VARCHAR(20)  NOT NULL UNIQUE,
    service_name VARCHAR(100) NOT NULL,
    prefix       VARCHAR(5)   NOT NULL,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    last_number  INTEGER      NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- Tabel Queues (antrean)
-- served_by: instance backend yang memproses pembuatan antrean ini.
-- Unique constraint (service_id, queue_number) sebagai jaring pengaman
-- terhadap race condition penomoran antar-instance.
-- ------------------------------------------------------------
CREATE TABLE queues (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
    service_id   INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    queue_number VARCHAR(20)  NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'waiting',
    served_by    VARCHAR(50),
    called_at    TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_service_queue_number UNIQUE (service_id, queue_number),
    CONSTRAINT chk_status CHECK (status IN ('waiting', 'called', 'completed', 'cancelled'))
);

CREATE INDEX idx_queues_status     ON queues(status);
CREATE INDEX idx_queues_service_id ON queues(service_id);
CREATE INDEX idx_queues_number     ON queues(queue_number);

-- ------------------------------------------------------------
-- Tabel Admins (petugas)
-- ------------------------------------------------------------
CREATE TABLE admins (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'admin'
);

-- ------------------------------------------------------------
-- Data awal (seed) layanan
-- ------------------------------------------------------------
INSERT INTO services (service_code, service_name, prefix, is_active) VALUES
    ('ADM', 'Administrasi',        'A', TRUE),
    ('AKD', 'Akademik',            'B', TRUE),
    ('DOK', 'Pengambilan Dokumen', 'C', TRUE);

-- Catatan: akun admin di-seed melalui scripts/initDb.js agar password di-hash
-- dengan bcrypt (default username: admin, password: admin123).
