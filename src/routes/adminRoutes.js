"use strict";

const express = require("express");
const ctrl = require("../controllers/adminController");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", ctrl.login);
router.post("/logout", ctrl.logout);
router.get("/me", requireAdmin, ctrl.me);

router.get("/queues", requireAdmin, ctrl.listQueues);
router.patch("/queues/:id/call", requireAdmin, ctrl.callQueue);
router.patch("/queues/:id/finish", requireAdmin, ctrl.finishQueue);
router.patch("/queues/:id/cancel", requireAdmin, ctrl.cancelQueue);

module.exports = router;
