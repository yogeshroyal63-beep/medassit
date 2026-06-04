const express = require("express");

const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");
const controller = require("./admin.controller");

const router = express.Router();

router.use(auth, role("admin"));

router.get("/stats", controller.stats);
router.get("/doctors/pending", controller.pending);
router.patch("/doctors/:id/approve", controller.approve);
router.patch("/doctors/:id/reject", controller.reject);
router.get("/users", controller.users);
router.get("/audit-logs", controller.audit);

module.exports = router;

