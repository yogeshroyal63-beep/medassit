const express   = require("express");
const rateLimit = require("express-rate-limit");

const card = require("../../data/model-card.json");
const { warmAi, getState, aiRequest } = require("../warmup/warmup.service");

const router = express.Router();

// The explain demo is public (recruiters should not need an account), so it has
// its own tight limit on top of the global API limiter.
const explainLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many explain requests. Please try again in a few minutes." },
});

const MAX_LEN = 300;

function sanitize(raw) {
  return String(raw || "")
    .replace(/<[^>]*>/g, "")
    .replace(/[^\x20-\x7E\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** GET /api/v1/model/info - model card + live runtime state. Also warms the AI service. */
router.get("/info", (_req, res) => {
  const runtime = warmAi();
  res.setHeader("Cache-Control", "no-store");
  res.json({ card, runtime });
});

/** POST /api/v1/model/explain - word-level explanation of a prediction. Nothing is stored. */
router.post("/explain", explainLimiter, async (req, res, next) => {
  try {
    const raw = String((req.body && req.body.symptoms) || "");
    if (raw.length > MAX_LEN) return res.status(400).json({ message: `Please keep it under ${MAX_LEN} characters.` });

    const symptoms = sanitize(raw);
    if (symptoms.length < 5) return res.status(400).json({ message: "Please describe the symptoms in a little more detail." });

    let age = req.body && req.body.age;
    age = age === undefined || age === null || age === "" ? null : Number(age);
    if (age !== null && (!Number.isInteger(age) || age < 0 || age > 120)) {
      return res.status(400).json({ message: "Age must be a whole number between 0 and 120." });
    }

    try {
      const ai = await aiRequest("post", "/explain", { symptoms, age });
      return res.json({ ...ai.data, runtime: getState() });
    } catch (err) {
      const transient = err.code || (err.response && [502, 503, 504].includes(err.response.status));
      if (transient) {
        warmAi({ force: true });
        return res.status(503).json({
          message: "The AI service is waking up. Try again in a few seconds.",
          runtime: getState(),
        });
      }
      throw err;
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
