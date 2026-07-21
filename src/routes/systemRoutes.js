"use strict";

const express = require("express");
const ctrl = require("../controllers/systemController");

const router = express.Router();

router.get("/health", ctrl.health);
router.get("/server-info", ctrl.serverInfo);
router.get("/logs", ctrl.logs);

module.exports = router;
