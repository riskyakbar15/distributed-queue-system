"use strict";

const bcrypt = require("bcryptjs");
const { query } = require("../config/database");
const redisService = require("../services/redisService");

/** POST /api/admin/login */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username dan password wajib diisi" });
    }

    const { rows } = await query(
      "SELECT id, username, password_hash, role FROM admins WHERE username = $1",
      [username],
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Username atau password salah" });
    }

    const admin = rows[0];
    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Username atau password salah" });
    }

    // Simpan session (tersimpan di Redis melalui connect-redis).
    req.session.admin = {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    };

    res.json({
      data: { username: admin.username, role: admin.role },
      message: "Login berhasil",
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/admin/logout */
function logout(req, res) {
  req.session.destroy(() => {
    res.json({ message: "Logout berhasil" });
  });
}

/** GET /api/admin/me */
function me(req, res) {
  res.json({ data: req.session.admin });
}

/** GET /api/admin/queues */
async function listQueues(req, res, next) {
  try {
    const status = req.query.status;
    const params = [];
    let where = "";
    if (status) {
      params.push(status);
      where = "WHERE q.status = $1";
    }
    const { rows } = await query(
      `SELECT q.id, q.queue_number, q.status, q.served_by, q.created_at, q.called_at, q.completed_at,
              s.service_name, u.name, u.nim
       FROM queues q
       JOIN services s ON s.id = q.service_id
       LEFT JOIN users u ON u.id = q.user_id
       ${where}
       ORDER BY q.created_at DESC
       LIMIT 200`,
      params,
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

/** Helper: mengubah status antrean dan mempublikasikan event. */
async function updateStatus(id, status, timestampColumn, servedBy) {
  const setParts = ["status = $2"];
  if (timestampColumn) setParts.push(`${timestampColumn} = NOW()`);
  if (servedBy) setParts.push("served_by = $3");

  const params = [id, status];
  if (servedBy) params.push(servedBy);

  const { rows } = await query(
    `UPDATE queues SET ${setParts.join(", ")} WHERE id = $1
     RETURNING id, queue_number, status, service_id, served_by`,
    params,
  );
  if (rows.length === 0) {
    const err = new Error("Antrean tidak ditemukan");
    err.status = 404;
    throw err;
  }
  return rows[0];
}

/** PATCH /api/admin/queues/:id/call */
async function callQueue(req, res, next) {
  try {
    const q = await updateStatus(
      Number(req.params.id),
      "called",
      "called_at",
      req.instanceName,
    );
    await redisService.setCurrentQueue(String(q.service_id), q.queue_number);
    await redisService.publishEvent({
      type: "queue:called",
      serviceId: q.service_id,
      queueNumber: q.queue_number,
      servedBy: q.served_by,
    });
    res.json({ data: q, message: `Memanggil ${q.queue_number}` });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/admin/queues/:id/finish */
async function finishQueue(req, res, next) {
  try {
    const q = await updateStatus(
      Number(req.params.id),
      "completed",
      "completed_at",
    );
    await redisService.publishEvent({
      type: "queue:completed",
      queueNumber: q.queue_number,
    });
    res.json({ data: q, message: `Menyelesaikan ${q.queue_number}` });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/admin/queues/:id/cancel */
async function cancelQueue(req, res, next) {
  try {
    const q = await updateStatus(Number(req.params.id), "cancelled");
    await redisService.publishEvent({
      type: "queue:cancelled",
      queueNumber: q.queue_number,
    });
    res.json({ data: q, message: `Membatalkan ${q.queue_number}` });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  logout,
  me,
  listQueues,
  callQueue,
  finishQueue,
  cancelQueue,
};
