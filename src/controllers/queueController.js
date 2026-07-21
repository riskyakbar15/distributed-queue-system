"use strict";

const queueService = require("../services/queueService");

/** GET /api/services */
async function getServices(req, res, next) {
  try {
    const services = await queueService.listServices();
    res.json({ data: services });
  } catch (err) {
    next(err);
  }
}

/** POST /api/queues */
async function postQueue(req, res, next) {
  try {
    const { name, nim, studyProgram, serviceId } = req.body;

    if (!name || !nim || !serviceId) {
      return res
        .status(400)
        .json({ error: "name, nim, dan serviceId wajib diisi" });
    }

    const queue = await queueService.createQueue({
      name: String(name).trim(),
      nim: String(nim).trim(),
      studyProgram: studyProgram ? String(studyProgram).trim() : null,
      serviceId: Number(serviceId),
      servedBy: req.instanceName,
    });

    res.status(201).json({ data: queue });
  } catch (err) {
    next(err);
  }
}

/** GET /api/queues/:number */
async function getQueue(req, res, next) {
  try {
    const queue = await queueService.getQueueByNumber(req.params.number);
    if (!queue) {
      return res.status(404).json({ error: "Antrean tidak ditemukan" });
    }
    res.json({ data: queue });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/queues/:number */
async function deleteQueue(req, res, next) {
  try {
    const result = await queueService.cancelQueueByNumber(req.params.number);
    res.json({ data: result, message: "Antrean dibatalkan" });
  } catch (err) {
    next(err);
  }
}

/** GET /api/current-queue */
async function getCurrentQueue(req, res, next) {
  try {
    const current = await queueService.getCurrentQueues();
    res.json({ data: current });
  } catch (err) {
    next(err);
  }
}

/** GET /api/statistics */
async function getStatistics(req, res, next) {
  try {
    const stats = await queueService.getStatistics();
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getServices,
  postQueue,
  getQueue,
  deleteQueue,
  getCurrentQueue,
  getStatistics,
};
