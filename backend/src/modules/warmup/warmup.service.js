/**
 * AI-service warm-up orchestration.
 *
 * Free-tier hosts put idle services to sleep. Waking the backend and the AI
 * service (container boot + BERT load) takes 30-60 s. The frontend pings
 * GET /api/v1/warmup as soon as the login page opens, and the backend also
 * calls warmAi() on a successful login. Triage requests then wait for this
 * warm-up instead of racing it.
 *
 * A sleeping Render service can answer 429 (header x-render-routing:
 * hibernate-rate-limited) or 502/503/504 while it wakes. All of those are
 * treated as "still waking": retry with backoff, never as a hard failure.
 *
 * Exposed state (what the UI sees):
 *   unknown      no ping yet
 *   waking       request sent, AI container is still booting
 *   loading      container is up, model is loading
 *   ready        BERT model loaded
 *   degraded     AI service is up but running the rule-based fallback
 *   unreachable  gave up (not transient, or deadline passed)
 */
const axios = require("axios");
const { aiServiceUrl, aiServiceSecret } = require("../../config/env");

// Tests shrink these; production leaves them at 1 / 150000.
const SCALE        = Number(process.env.AI_RETRY_DELAY_SCALE || 1);
const DEADLINE_MS  = Number(process.env.AI_WARM_DEADLINE_MS || 150_000);

const MIN_REPING_MS   = 15_000;     // never ping more often than this
const READY_TTL_MS    = 8 * 60_000; // re-verify a "ready" AI service after this
const WAKE_TIMEOUT_MS = 90_000;     // cold container boot can be slow
const POLL_EVERY_MS   = 2_500;

const state = {
  ai: "unknown",
  mode: null,          // "bert" | "rule-based-fallback" | null
  modelId: null,
  lastPingAt: 0,
  lastReadyAt: 0,
  wakingSince: null,
  readyAt: null,
  loadSeconds: null,
  error: null,
};
let inFlight = false;

const headers = () => ({ "x-internal-secret": aiServiceSecret });
const sleep = (ms) => new Promise((r) => { const t = setTimeout(r, Math.max(1, ms * SCALE)); if (t.unref) t.unref(); });

const TRANSIENT_CODES  = new Set(["ECONNREFUSED", "ECONNABORTED", "ETIMEDOUT", "ENOTFOUND", "ECONNRESET", "EAI_AGAIN"]);
const TRANSIENT_STATUS = new Set([429, 502, 503, 504]);

/** True when the failure just means "the AI service is still waking up". */
function isTransient(err) {
  if (!err) return false;
  if (TRANSIENT_CODES.has(err.code)) return true;
  return !!(err.response && TRANSIENT_STATUS.has(err.response.status));
}

function describeError(err) {
  return err.code || (err.response && `HTTP ${err.response.status}`) || err.message || "error";
}

function applyAiStatus(s) {
  state.mode        = s.inference_mode || null;
  state.modelId     = s.model_id || null;
  state.loadSeconds = s.load_seconds ?? null;
  state.error       = s.error || null;
  if (s.phase === "ready") {
    state.ai = "ready"; state.lastReadyAt = Date.now(); state.readyAt = state.readyAt || Date.now();
    return true;
  }
  if (s.phase === "ready_fallback") {
    state.ai = "degraded"; state.lastReadyAt = Date.now(); state.readyAt = state.readyAt || Date.now();
    return true;
  }
  state.ai = "loading";
  return false;
}

async function runWarm() {
  inFlight = true;
  state.lastPingAt = Date.now();
  if (state.ai !== "ready" && state.ai !== "degraded") {
    state.ai = "waking";
    state.wakingSince = state.wakingSince || Date.now();
  }
  const deadline = Date.now() + DEADLINE_MS;
  let backoff = 3_000;
  let awake = false;
  try {
    while (Date.now() < deadline) {
      try {
        // The first call wakes the sleeping container; afterwards poll /status.
        const res = awake
          ? await axios.get(`${aiServiceUrl}/status`, { timeout: 10_000, headers: headers() })
          : await axios.get(`${aiServiceUrl}/warmup`, { timeout: WAKE_TIMEOUT_MS, headers: headers() });
        // A real AI service always reports a phase. Anything else is not a warm-up
        // we can wait on (wrong URL, proxy page, test double): stop instead of looping.
        if (!res || !res.data || typeof res.data.phase !== "string") {
          throw Object.assign(new Error("Unexpected response from the AI service"), { code: "BAD_AI_RESPONSE" });
        }
        awake = true;
        backoff = 3_000;
        if (applyAiStatus(res.data)) return;
        await sleep(POLL_EVERY_MS);
      } catch (err) {
        if (!isTransient(err)) throw err;
        awake = false;                 // container may have gone back to sleep
        state.error = describeError(err);
        await sleep(backoff);
        backoff = Math.min(Math.round(backoff * 1.5), 12_000);
      }
    }
    state.ai = "unreachable";
    state.error = "AI service did not become ready in time";
  } catch (err) {
    state.ai = "unreachable";
    state.error = describeError(err);
  } finally {
    inFlight = false;
  }
}

/** Fire-and-forget. Safe to call from anywhere; never throws, never blocks. */
function warmAi({ force = false } = {}) {
  try {
    const now = Date.now();
    if (inFlight) return getState();
    const freshReady = (state.ai === "ready" || state.ai === "degraded") && now - state.lastReadyAt < READY_TTL_MS;
    if (!force && freshReady) return getState();
    if (!force && now - state.lastPingAt < MIN_REPING_MS) return getState();
    runWarm().catch(() => {});
  } catch (_) { /* warm-up must never break a request */ }
  return getState();
}

/** Call after a real request to the AI service failed transiently: the service is asleep again. */
function noteAiFailure() {
  try {
    if (state.ai === "ready" || state.ai === "degraded") {
      state.ai = "waking";
      state.wakingSince = Date.now();
    }
    warmAi({ force: true });
  } catch (_) { /* never throws */ }
}

/**
 * Wait (up to maxMs) for the AI service to be ready, starting a warm-up if none
 * is running. Never throws. Returns true if ready or degraded.
 */
async function waitUntilReady(maxMs = 45_000) {
  try {
    const end = Date.now() + maxMs * SCALE;
    if (state.ai === "unknown" || (state.ai === "unreachable" && !inFlight)) warmAi({ force: true });
    while (Date.now() < end) {
      if (state.ai === "ready" || state.ai === "degraded") return true;
      if (state.ai === "unreachable" && !inFlight) return false;
      await sleep(1_000);
    }
  } catch (_) { /* never throws */ }
  return state.ai === "ready" || state.ai === "degraded";
}

function getState() {
  return {
    state: state.ai,
    mode: state.mode,
    modelId: state.modelId,
    loadSeconds: state.loadSeconds,
    wakingForMs: state.ai === "waking" || state.ai === "loading"
      ? Date.now() - (state.wakingSince || Date.now()) : 0,
    error: state.ai === "unreachable" ? state.error : null,
  };
}

/** Call the AI service with escalating timeouts and cold-start-friendly retries. */
const TIMEOUTS = [8_000, 20_000, 30_000, 30_000];
const DELAYS   = [0, 3_000, 6_000, 10_000];

async function aiRequest(method, path, data) {
  let last;
  for (let i = 0; i < TIMEOUTS.length; i++) {
    if (DELAYS[i]) await sleep(DELAYS[i]);
    try {
      return await axios({ method, url: `${aiServiceUrl}${path}`, data, timeout: TIMEOUTS[i], headers: headers() });
    } catch (err) {
      last = err;
      if (i === TIMEOUTS.length - 1 || !isTransient(err)) throw err;
      noteAiFailure();
    }
  }
  throw last;
}

function _resetForTests() {
  Object.assign(state, { ai: "unknown", mode: null, modelId: null, lastPingAt: 0, lastReadyAt: 0,
    wakingSince: null, readyAt: null, loadSeconds: null, error: null });
  inFlight = false;
}

module.exports = { warmAi, getState, aiRequest, waitUntilReady, noteAiFailure, isTransient, _resetForTests };
