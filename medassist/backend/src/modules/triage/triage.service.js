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
    const emergencyResult = {
      status: "emergency",
      top_condition: "Possible Emergency",
      severity: "critical",
      predictions: [],
      advice: "This sounds like a medical emergency. Please call emergency services (108/112) or go to the nearest emergency room immediately.",
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

  const aiResp = await axios.post(
    `${aiServiceUrl}/triage`,
    { symptoms, age: body.age ?? null },
    { timeout: 15000, headers: { "x-internal-secret": aiServiceSecret, "x-request-id": requestId || "" } }
  );
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
