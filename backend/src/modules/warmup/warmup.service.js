/**
 * AI-service warm-up orchestration.
 *
 * Free-tier hosts put idle services to sleep. Waking the backend and the AI
 * service (container boot + BERT load) takes 30-60 s. Instead of letting the
 * first triage request pay for it, the frontend pings GET /api/v1/warmup as
 * soon as the login page opens, and the backend also calls warmAi() on a
 * successful login. Both only wake the AI service in the background; nothing
 * here blocks a request.
 *
 * Exposed state (what the UI sees):
 *   unknown      no ping yet
 *   waking       request sent, AI container is still booting
 *   loading      container is up, model is loading
 *   ready        BERT model loaded
 *   degraded     AI service is up but running the rule-based fallback
 *   unreachable  could not reach the AI service
 */
const axios = require("axios");
const { aiServiceUrl, aiServiceSecret } = require("../../config/env");

const MIN_REPING_MS   = 15_000;    // never ping more often than this
const READY_TTL_MS    = 8 * 60_000; // re-verify a "ready" AI service after this
const WAKE_TIMEOUT_MS = 90_000;    // cold container boot can be slow
const POLL_EVERY_MS   = 2_500;
const POLL_DEADLINE_MS = 150_000;

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
const sleep = (ms) => new Promise((r) => { const t = setTimeout(r, ms); if (t.unref) t.unref(); });

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
  try {
    // The first request wakes the sleeping container; it may take a while to answer.
    const first = await axios.get(`${aiServiceUrl}/warmup`, { timeout: WAKE_TIMEOUT_MS, headers: headers() });
    let done = applyAiStatus(first.data || {});
    const deadline = Date.now() + POLL_DEADLINE_MS;
    while (!done && Date.now() < deadline) {
      await sleep(POLL_EVERY_MS);
      const res = await axios.get(`${aiServiceUrl}/status`, { timeout: 10_000, headers: headers() });
      done = applyAiStatus(res.data || {});
    }
    if (!done) { state.ai = "unreachable"; state.error = "Model did not finish loading in time"; }
  } catch (err) {
    state.ai = "unreachable";
    state.error = err.code || (err.response && `HTTP ${err.response.status}`) || err.message || "error";
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

/**
 * Call the AI service with escalating timeouts (cold-start friendly).
 * Same strategy as the triage service.
 */
const TRANSIENT_CODES  = new Set(["ECONNREFUSED", "ECONNABORTED", "ETIMEDOUT", "ENOTFOUND", "ECONNRESET"]);
const TRANSIENT_STATUS = new Set([502, 503, 504]);
const TIMEOUTS = [8_000, 20_000, 40_000];
const DELAYS   = [0, 1_500, 3_000];

async function aiRequest(method, path, data) {
  let last;
  for (let i = 0; i < TIMEOUTS.length; i++) {
    if (DELAYS[i]) await sleep(DELAYS[i]);
    try {
      return await axios({ method, url: `${aiServiceUrl}${path}`, data, timeout: TIMEOUTS[i], headers: headers() });
    } catch (err) {
      last = err;
      const transient = TRANSIENT_CODES.has(err.code) || (err.response && TRANSIENT_STATUS.has(err.response.status));
      if (i === TIMEOUTS.length - 1 || !transient) throw err;
      warmAi();
    }
  }
  throw last;
}

function _resetForTests() {
  Object.assign(state, { ai: "unknown", mode: null, modelId: null, lastPingAt: 0, lastReadyAt: 0,
    wakingSince: null, readyAt: null, loadSeconds: null, error: null });
  inFlight = false;
}

module.exports = { warmAi, getState, aiRequest, _resetForTests };
