const express = require("express");

const auth = require("../../middleware/auth.middleware");
const userController = require("./user.controller");

const router = express.Router();

router.get("/me", auth, userController.me);
router.put("/me", auth, userController.updateMe);
router.put("/me/password", auth, userController.changePassword);

module.exports = router;
