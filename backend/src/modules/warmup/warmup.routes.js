const express = require("express");
const { warmAi } = require("./warmup.service");

const router = express.Router();

/**
 * GET /api/v1/warmup  (public, no auth, no data)
 *
 * Called by the frontend when the login page opens. Responds immediately and
 * wakes the AI service in the background.
 */
router.get("/", (_req, res) => {
  const ai = warmAi();
  res.setHeader("Cache-Control", "no-store");
  res.json({ backend: "ok", ai, timestamp: new Date().toISOString() });
});

module.exports = router;
