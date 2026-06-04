const express = require("express");

const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");
const controller = require("./medication.controller");

const router = express.Router();

router.post("/", auth, role("patient"), controller.add);
router.get("/", auth, role("patient"), controller.list);
router.put("/:id", auth, role("patient"), controller.update);
router.delete("/:id", auth, role("patient"), controller.remove);
router.patch("/:id/taken", auth, role("patient"), controller.taken);

module.exports = router;

