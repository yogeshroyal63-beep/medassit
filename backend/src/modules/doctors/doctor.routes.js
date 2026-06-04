const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const auth = require("../../middleware/auth.middleware");
const role = require("../../middleware/role.middleware");
const doctorController = require("./doctor.controller");

const uploadDir = path.join(process.cwd(), "uploads");

// Auto-create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, and PDF are allowed.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

const router = express.Router();

router.get("/", doctorController.list); // public list approved doctors

router.get("/me", auth, role("doctor"), doctorController.me);
router.get("/:id", doctorController.getOne); // public doctor profile

router.post(
  "/register",
  auth,
  role("doctor"),
  upload.fields([
    { name: "license", maxCount: 1 },
    { name: "governmentId", maxCount: 1 },
  ]),
  doctorController.register
);

router.patch("/availability", auth, role("doctor"), doctorController.availability);

module.exports = router;
