const express = require("express");

const auth = require("../../middleware/auth.middleware");
const controller = require("./message.controller");

const router = express.Router();

router.post("/", auth, controller.send);
router.get("/", auth, controller.list);
router.get("/:userId", auth, controller.conversation);

module.exports = router;

