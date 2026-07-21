"use strict";

const { pool, query } = require("../config/database");
const redisService = require("./redisService");

/** Mengambil daftar layanan aktif. */
async function listServices() {
  const { rows } = await query(
    "SELECT id, service_code, service_name, prefix, is_active FROM services WHERE is_active = TRUE ORDER BY id",
  );
  return rows;
}

/**
 * Membuat antrean baru.
 * Nomor antrean diperoleh dari Redis INCR (atomik antar-instance). Bila Redis
 * gagal, digunakan fallback transaksi database dengan penguncian baris.
 *
 * @param {Object} data { name, nim, studyProgram, serviceId, servedBy }
 */
async function createQueue({ name, nim, studyProgram, serviceId, servedBy }) {
  const svc = await query(
    "SELECT id, service_code, prefix FROM services WHERE id = $1 AND is_active = TRUE",
    [serviceId],
  );
  if (svc.rowCount === 0) {
    const err = new Error("Layanan tidak ditemukan atau tidak aktif");
    err.status = 404;
    throw err;
  }
  const service = svc.rows[0];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Buat data mahasiswa.
    const userResult = await client.query(
      "INSERT INTO users (name, nim, study_program) VALUES ($1, $2, $3) RETURNING id",
      [name, nim, studyProgram || null],
    );
    const userId = userResult.rows[0].id;

    // Tentukan nomor urut.
    let seq;
    try {
      seq = await redisService.nextQueueNumber(service.service_code);
    } catch (redisErr) {
      // Fallback: penomoran atomik via database ketika Redis tidak tersedia.
      const upd = await client.query(
        "UPDATE services SET last_number = last_number + 1 WHERE id = $1 RETURNING last_number",
        [serviceId],
      );
      seq = upd.rows[0].last_number;
    }

    const queueNumber = `${service.prefix}${String(seq).padStart(3, "0")}`;

    const queueResult = await client.query(
      `INSERT INTO queues (user_id, service_id, queue_number, status, served_by)
       VALUES ($1, $2, $3, 'waiting', $4)
       RETURNING id, queue_number, status, served_by, created_at`,
      [userId, serviceId, queueNumber, servedBy],
    );

    // Selaraskan kolom last_number agar fallback tetap konsisten.
    await client.query(
      "UPDATE services SET last_number = GREATEST(last_number, $1) WHERE id = $2",
      [seq, serviceId],
    );

    await client.query("COMMIT");

    const queue = queueResult.rows[0];

    // Hitung jumlah antrean di depan.
    const ahead = await countAhead(serviceId, queue.id);

    await redisService.publishEvent({
      type: "queue:created",
      serviceId,
      queueNumber: queue.queue_number,
    });

    return {
      id: queue.id,
      queueNumber: queue.queue_number,
      serviceName: service.service_code,
      status: queue.status,
      servedBy: queue.served_by,
      ahead,
      createdAt: queue.created_at,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/** Menghitung jumlah antrean menunggu di depan sebuah antrean. */
async function countAhead(serviceId, queueId) {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS ahead FROM queues
     WHERE service_id = $1 AND status = 'waiting' AND id < $2`,
    [serviceId, queueId],
  );
  return rows[0].ahead;
}

/** Mengambil status sebuah antrean berdasarkan nomornya. */
async function getQueueByNumber(queueNumber) {
  const { rows } = await query(
    `SELECT q.id, q.queue_number, q.status, q.served_by, q.created_at, q.called_at,
            s.service_name, s.id AS service_id, u.name, u.nim
     FROM queues q
     JOIN services s ON s.id = q.service_id
     LEFT JOIN users u ON u.id = q.user_id
     WHERE q.queue_number = $1
     ORDER BY q.created_at DESC
     LIMIT 1`,
    [queueNumber],
  );
  if (rows.length === 0) return null;

  const q = rows[0];
  const ahead =
    q.status === "waiting" ? await countAhead(q.service_id, q.id) : 0;
  const current = await getCurrentCalled(q.service_id);

  return {
    id: q.id,
    queueNumber: q.queue_number,
    serviceName: q.service_name,
    status: q.status,
    servedBy: q.served_by,
    name: q.name,
    ahead,
    currentCalled: current,
    createdAt: q.created_at,
    calledAt: q.called_at,
  };
}

/** Membatalkan antrean (oleh pengguna) berdasarkan nomor. */
async function cancelQueueByNumber(queueNumber) {
  const { rows } = await query(
    `UPDATE queues SET status = 'cancelled'
     WHERE queue_number = $1 AND status = 'waiting'
     RETURNING id, queue_number, service_id`,
    [queueNumber],
  );
  if (rows.length === 0) {
    const err = new Error(
      "Antrean tidak ditemukan atau tidak dapat dibatalkan",
    );
    err.status = 404;
    throw err;
  }
  await redisService.publishEvent({ type: "queue:cancelled", queueNumber });
  return rows[0];
}

/** Mengambil nomor yang terakhir dipanggil untuk sebuah layanan. */
async function getCurrentCalled(serviceId) {
  const { rows } = await query(
    `SELECT queue_number FROM queues
     WHERE service_id = $1 AND status = 'called'
     ORDER BY called_at DESC LIMIT 1`,
    [serviceId],
  );
  return rows.length ? rows[0].queue_number : null;
}

/** Nomor aktif untuk semua layanan (untuk halaman beranda). */
async function getCurrentQueues() {
  const { rows } = await query(
    `SELECT DISTINCT ON (service_id) service_id, queue_number, called_at
     FROM queues WHERE status = 'called'
     ORDER BY service_id, called_at DESC`,
  );
  return rows;
}

/** Statistik ringkas antrean. */
async function getStatistics() {
  const { rows } = await query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'waiting')   ::int AS waiting,
       COUNT(*) FILTER (WHERE status = 'called')    ::int AS called,
       COUNT(*) FILTER (WHERE status = 'completed') ::int AS completed,
       COUNT(*) FILTER (WHERE status = 'cancelled') ::int AS cancelled
     FROM queues`,
  );
  return rows[0];
}

module.exports = {
  listServices,
  createQueue,
  getQueueByNumber,
  cancelQueueByNumber,
  getCurrentQueues,
  getCurrentCalled,
  getStatistics,
  countAhead,
};
