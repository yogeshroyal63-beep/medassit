const rateLimit = require("express-rate-limit");

/**
 * Rate-limiting middleware.
 *
 * Store selection (based on REDIS_URL env var):
 *
 *   REDIS_URL set   → rate-limit-redis (shared store, safe for multi-instance).
 *   REDIS_URL unset → express-rate-limit default in-memory store (single-instance
 *                     local dev only — effective limit is limit × N instances
 *                     when behind a load balancer).
 *
 * To enable Redis:
 *   1. npm install rate-limit-redis ioredis   (already listed in package.json)
 *   2. Set REDIS_URL=redis://... in your .env
 */

function makeStore() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return undefined; // default in-memory store

  try {
    const { RedisStore } = require("rate-limit-redis");
    const Redis           = require("ioredis");
    const client          = new Redis(redisUrl, { enableOfflineQueue: false, lazyConnect: true });
    client.connect().catch(() => {}); // non-fatal — limiter falls back gracefully

    return new RedisStore({
      sendCommand: (...args) => client.call(...args),
    });
  } catch {
    // rate-limit-redis or ioredis not installed — fall back to in-memory
    console.warn("[rateLimit] rate-limit-redis unavailable; using in-memory store.");
    return undefined;
  }
}

const sharedStore = makeStore();

// Tight limit for auth endpoints — prevents brute-force attacks
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  limit:           10,
  standardHeaders: true,
  legacyHeaders:   false,
  store:           sharedStore,
  message: { message: "Too many login attempts. Please try again after 15 minutes." },
});

// General API limit — reasonable for authenticated feature calls
const apiLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  limit:           200,
  standardHeaders: true,
  legacyHeaders:   false,
  store:           sharedStore,
});

module.exports = { apiLimiter, authLimiter };
