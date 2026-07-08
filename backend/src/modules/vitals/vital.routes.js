const express = require("express");

const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");
const controller = require("./vital.controller");

const router = express.Router();

router.post("/",      auth, role("patient"), controller.log);
router.get("/latest", auth, role("patient"), controller.latest);
router.get("/trend",  auth, role("patient"), controller.trend);

module.exports = router;
