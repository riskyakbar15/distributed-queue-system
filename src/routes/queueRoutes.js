"use strict";

const express = require("express");
const ctrl = require("../controllers/queueController");

const router = express.Router();

router.get("/services", ctrl.getServices);
router.post("/queues", ctrl.postQueue);
router.get("/queues/:number", ctrl.getQueue);
router.delete("/queues/:number", ctrl.deleteQueue);
router.get("/current-queue", ctrl.getCurrentQueue);
router.get("/statistics", ctrl.getStatistics);

module.exports = router;
