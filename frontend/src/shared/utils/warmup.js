/**
 * Wake the backend and the AI model in the background.
 *
 * Free-tier hosting puts idle services to sleep, and the first request after
 * that can take 30-60 s. Calling this when the login page opens (and while the
 * user types their credentials) starts that boot early, so by the time they
 * sign in and run a symptom check everything is already warm.
 *
 * - Fire-and-forget: never throws, never blocks rendering, no UI.
 * - Throttled: at most one request per `minIntervalMs`.
 * - Plain fetch (not the axios instance) so it can never trigger the 401
 *   refresh/redirect logic.
 */
const BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// Optional: public URL of the AI service (for example your Render URL). When set,
// the AI container is woken in parallel with the backend instead of after it.
// Only its unauthenticated /health endpoint is requested, as an opaque no-cors
// ping; the model starts loading as soon as the container boots.
const AI_WAKE_URL = (import.meta.env.VITE_AI_WAKE_URL || "").replace(/\/$/, "");

let lastCallAt = 0;

export function warmUpServices({ minIntervalMs = 15000 } = {}) {
  try {
    const now = Date.now();
    if (now - lastCallAt < minIntervalMs) return false;
    lastCallAt = now;
    fetch(`${BASE}/warmup`, { method: "GET", cache: "no-store", keepalive: true }).catch(() => {});
    if (AI_WAKE_URL) {
      fetch(`${AI_WAKE_URL}/health`, { method: "GET", mode: "no-cors", cache: "no-store", keepalive: true }).catch(() => {});
    }
    return true;
  } catch {
    return false;
  }
}

/** Test helper. */
export function _resetWarmupThrottle() {
  lastCallAt = 0;
}
