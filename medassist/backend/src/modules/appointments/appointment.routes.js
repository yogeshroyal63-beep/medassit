const express = require("express");

const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");
const validate = require("../../middleware/validate.middleware");
const validator = require("./appointment.validator");
const controller = require("./appointment.controller");

const router = express.Router();

router.post("/", auth, role("patient"), validate(validator.book), controller.book);
router.get("/my", auth, role("patient", "doctor", "admin"), controller.my);
router.patch("/:id/status", auth, role("doctor", "admin"), validate(validator.status), controller.status);
router.patch("/:id/cancel", auth, role("patient"), controller.cancel);

module.exports = router;

