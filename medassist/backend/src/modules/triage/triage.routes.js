const express = require("express");

const auth = require("../../middleware/auth.middleware");
const controller = require("./triage.controller");

const router = express.Router();

router.post("/", auth, controller.triage);
router.get("/history", auth, controller.history);

module.exports = router;

