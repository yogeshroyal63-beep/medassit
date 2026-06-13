const rateLimit = require("express-rate-limit");

function makeStore(prefix) {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return undefined;

  try {
    const { RedisStore } = require("rate-limit-redis");
    const Redis = require("ioredis");
    const client = new Redis(redisUrl, { enableOfflineQueue: false, lazyConnect: true });
    client.connect().catch(() => {});

    return new RedisStore({
      prefix,
      sendCommand: (...args) => client.call(...args),
    });
  } catch {
    console.warn("[rateLimit] rate-limit-redis unavailable; using in-memory store.");
    return undefined;
  }
}

const authLimiter = rateLimit({
  windowMs:        5 * 60 * 1000,
  limit:           10,
  standardHeaders: true,
  legacyHeaders:   false,
  store:           makeStore("rl:auth:"),
  message: { message: "Too many login attempts. Please try again after 5 minutes." },
});

const apiLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  limit:           200,
  standardHeaders: true,
  legacyHeaders:   false,
  store:           makeStore("rl:api:"),
});

module.exports = { apiLimiter, authLimiter };