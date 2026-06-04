const express = require("express");

const auth = require("../../middleware/auth.middleware");
const controller = require("./video.controller");

const router = express.Router();

router.post("/create-room", auth, controller.createRoom);
router.get("/join/:roomId", auth, controller.join);

module.exports = router;

