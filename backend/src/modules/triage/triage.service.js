const axios    = require("axios");
const mongoose = require("mongoose");

const { aiServiceUrl, aiServiceSecret } = require("../../config/env");
const Triage = require("./triage.model");
const { emergencyKeywords } = require("./emergency_rules");

const MAX_SYMPTOM_LENGTH = 2000; // hard cap — prevents oversized payloads hitting the AI service

/**
 * Sanitize symptom input before forwarding to AI service.
 * Strips HTML tags, control characters, normalizes whitespace.
 */
function sanitizeSymptoms(raw) {
  return raw
    .replace(/<[^>]*>/g, "")           // strip HTML/XML tags
    .replace(/[^\x20-\x7E\s]/g, "")   // remove non-printable ASCII
    .replace(/\s+/g, " ")             // normalize whitespace
    .trim();
}

/**
 * Render's free tier spins down the AI service after ~15 min idle. While it
 * wakes it can answer ECONNREFUSED, 502/503/504, or 429 (Render's edge sends
 * "x-render-routing: hibernate-rate-limited"). None of those mean the request
 * is bad: wait for the warm-up (started at login), then retry with backoff.
 * If it still fails, return a friendly 503, never the upstream 429.
 */
const warmup = require("../warmup/warmup.service");

const SCALE = Number(process.env.AI_RETRY_DELAY_SCALE || 1);
const RETRY_TIMEOUTS_MS = [8000, 20000, 30000, 30000, 30000, 30000]; // escalating per attempt
const RETRY_DELAYS_MS   = [0, 3000, 5000, 8000, 12000, 15000];
const MAX_WARM_WAIT_MS  = 45000;

async function callAiService(symptoms, age, requestId) {
  // Join the warm-up that started at login instead of racing it. Never throws.
  await warmup.waitUntilReady(MAX_WARM_WAIT_MS);

  let lastErr;
  for (let attempt = 0; attempt < RETRY_TIMEOUTS_MS.length; attempt++) {
    if (RETRY_DELAYS_MS[attempt]) {
      await new Promise((r) => setTimeout(r, Math.max(1, RETRY_DELAYS_MS[attempt] * SCALE)));
    }
    try {
      return await axios.post(
        `${aiServiceUrl}/triage`,
        { symptoms, age: age ?? null },
        { timeout: RETRY_TIMEOUTS_MS[attempt], headers: { "x-internal-secret": aiServiceSecret, "x-request-id": requestId || "" } }
      );
    } catch (err) {
      lastErr = err;
      if (!warmup.isTransient(err)) throw err;
      warmup.noteAiFailure(); // the service is asleep again: restart the warm-up
    }
  }
  const friendly = new Error("The AI service is waking up. Please try again in a few seconds.");
  friendly.status = 503;
  friendly.cause = lastErr;
  throw friendly;
}

async function runTriage(user, body, requestId) {
  const rawSymptoms = String(body.symptoms || "").trim();
  if (!rawSymptoms) {
    const err = new Error("Symptoms are required");
    err.status = 400;
    throw err;
  }

  // Enforce length cap before sanitization to avoid processing huge strings
  if (rawSymptoms.length > MAX_SYMPTOM_LENGTH) {
    const err = new Error(`Symptoms must be under ${MAX_SYMPTOM_LENGTH} characters`);
    err.status = 400;
    throw err;
  }

  const symptoms = sanitizeSymptoms(rawSymptoms);

  if (symptoms.length < 5) {
    const err = new Error("Please describe your symptoms in more detail");
    err.status = 400;
    throw err;
  }

  // Pre-flight emergency check using local keyword rules (emergency_rules.js)
  const lowerSymptoms = symptoms.toLowerCase();
  const detectedEmergency = emergencyKeywords.some((kw) => lowerSymptoms.includes(kw));
  if (detectedEmergency) {
    const emergencyMessage = "This sounds like a medical emergency. Please call emergency services (108/112) or go to the nearest emergency room immediately.";
    const emergencyResult = {
      status: "emergency",
      top_condition: "Possible Emergency",
      severity: "critical",
      predictions: [],
      advice: {
        action: "Call emergency services or go to the nearest ER NOW",
        urgency: "Immediate - do not wait",
        home_care: emergencyMessage,
      },
      message: emergencyMessage,
      isEmergency: true,
    };
    if (mongoose.Types.ObjectId.isValid(user.id)) {
      Triage.create({
        userId: user.id, symptoms, age: body.age ?? undefined,
        status: emergencyResult.status, topCondition: emergencyResult.top_condition,
        severity: emergencyResult.severity, predictions: [],
        advice: emergencyResult.advice, isEmergency: true, rawResponse: emergencyResult,
      }).catch(() => {});
    }
    return emergencyResult;
  }

  const aiResp = await callAiService(symptoms, body.age, requestId);
  const ai = aiResp.data || {};

  // Validate the AI response shape so we never silently save empty records
  // if the Python contract changes.
  const top_condition = typeof ai.top_condition === "string" ? ai.top_condition : "";
  const severity      = typeof ai.severity === "string" ? ai.severity : "";
  const predictions   = Array.isArray(ai.predictions) ? ai.predictions : [];
  const status        = typeof ai.status === "string" ? ai.status : "";

  const userId = user.id;
  const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);

  if (isValidObjectId) {
    try {
      await Triage.create({
        userId,
        symptoms,
        age:          body.age ?? undefined,
        status,
        topCondition: top_condition,
        severity,
        predictions,
        specialty:    ai.specialty  || undefined,
        advice:       ai.advice     || undefined,
        isEmergency:  status === "emergency",
        rawResponse:  ai,
      });
    } catch {
      // Saving triage history must never block the response
    }
  }

  return ai;
}

async function history(user, { page = 1, limit = 20 } = {}) {
  if (!mongoose.Types.ObjectId.isValid(user.id)) return [];
  const skip = (page - 1) * limit;
  return Triage.find({ userId: user.id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

module.exports = { runTriage, history };