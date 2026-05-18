const express = require("express");

const auth       = require("../../middleware/auth.middleware");
const role       = require("../../middleware/role.middleware");
const validate   = require("../../middleware/validate.middleware");
const validator  = require("./record.validation");
const controller = require("./record.controller");

const router = express.Router();

router.post("/",    auth, role("patient"), validate(validator.add), controller.add);
router.get("/",     auth, role("patient"),                          controller.list);
router.get("/:id",  auth, role("patient"),                          controller.getOne);
router.delete("/:id", auth, role("patient"),                        controller.remove);

module.exports = router;