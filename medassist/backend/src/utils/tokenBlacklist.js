const logger = require("./logger");

/**
 * TTL-aware refresh-token blacklist.
 *
 * Storage backend is chosen at startup based on the REDIS_URL env var:
 *
 *   REDIS_URL set   → Redis (ioredis) via SETEX — survives restarts,
 *                     works correctly across multiple Node instances.
 *   REDIS_URL unset → In-memory Map with a 30-minute sweep — fine for
 *                     single-instance local dev; state is lost on restart.
 *
 * Both backends expose the same { add, has } interface so the rest of
 * the codebase is unaffected by which backend is active.
 */

// ── Redis backend ─────────────────────────────────────────────────────────────
function makeRedisBackend(redisUrl) {
  let Redis;
  try {
    Redis = require("ioredis");
  } catch {
    return null; // ioredis not installed — fall through to in-memory
  }

  const client = new Redis(redisUrl, {
    enableOfflineQueue: false,
    lazyConnect:        true,
    maxRetriesPerRequest: 1,
  });

  client.on("connect", () => logger.info("[tokenBlacklist] Redis connected."));
  client.on("error",   (err) => logger.error("[tokenBlacklist] Redis error:", err.message));

  client.connect().catch((err) =>
    logger.warn("[tokenBlacklist] Redis initial connect failed:", err.message)
  );

  const PREFIX = "bl:jti:";

  return {
    async add(jti, ttlSeconds = 7 * 24 * 60 * 60) {
      try {
        await client.setex(`${PREFIX}${jti}`, ttlSeconds, "1");
      } catch (err) {
        logger.error("[tokenBlacklist] Redis add error:", err.message);
      }
    },
    async has(jti) {
      try {
        return (await client.exists(`${PREFIX}${jti}`)) === 1;
      } catch (err) {
        logger.error("[tokenBlacklist] Redis has error:", err.message);
        return false; // fail-open: treat as not blacklisted on Redis error
      }
    },
  };
}

// ── In-memory backend ─────────────────────────────────────────────────────────
function makeMemoryBackend() {
  if (process.env.NODE_ENV === "production") {
    logger.warn(
      "[tokenBlacklist] Using in-memory store (set REDIS_URL for production). " +
      "Blacklisted tokens are lost on restart."
    );
  }

  const store = new Map(); // jti → expiresAtMs

  function sweep() {
    const now = Date.now();
    for (const [jti, exp] of store) {
      if (now > exp) store.delete(jti);
    }
  }
  setInterval(sweep, 30 * 60 * 1000).unref();

  return {
    async add(jti, ttlSeconds = 7 * 24 * 60 * 60) {
      store.set(jti, Date.now() + ttlSeconds * 1000);
    },
    async has(jti) {
      const exp = store.get(jti);
      if (exp === undefined) return false;
      if (Date.now() > exp) { store.delete(jti); return false; }
      return true;
    },
  };
}

// ── Select backend ────────────────────────────────────────────────────────────
const redisUrl = process.env.REDIS_URL;
const backend  = (redisUrl && makeRedisBackend(redisUrl)) || makeMemoryBackend();

if (redisUrl) {
  logger.info("[tokenBlacklist] Redis backend active.");
} else {
  logger.info("[tokenBlacklist] In-memory backend active (single-instance only).");
}

module.exports = {
  /** Add a jti to the blacklist with a TTL (seconds). */
  add: (jti, ttlSeconds) => backend.add(jti, ttlSeconds),
  /** Return true if the jti is blacklisted and not expired. */
  has: (jti)             => backend.has(jti),
};
