const dotenv = require("dotenv");
dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";

function requiredEnv(name, fallback = null) {
  const val = process.env[name];
  if (val) return val;
  if (nodeEnv === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  if (fallback && fallback.includes("change_in_production")) {
    console.warn(`[ENV] WARNING: Using insecure default for ${name}. Set a strong secret in .env`);
  }
  return fallback;
}

module.exports = {
  nodeEnv,
  port:             Number(process.env.PORT || 5001),
  mongoUri:         requiredEnv("MONGO_URI", "mongodb://localhost:27017/medassist"),
  jwtSecret:        requiredEnv("JWT_SECRET", "medassist_jwt_secret_CHANGE_IN_PRODUCTION_min32chars"),
  jwtExpiresIn:     process.env.JWT_EXPIRES_IN || "7d",
  aiServiceUrl:     requiredEnv("AI_SERVICE_URL", "http://localhost:8000"),
  adminEmail:       process.env.ADMIN_EMAIL || null,
  adminPassword:    process.env.ADMIN_PASSWORD || null,
  jwtAccessSecret:  requiredEnv("JWT_ACCESS_SECRET",  "medassist_access_CHANGE_IN_PRODUCTION_min32chars"),
  jwtRefreshSecret: requiredEnv("JWT_REFRESH_SECRET", "medassist_refresh_CHANGE_IN_PRODUCTION_min32chars"),
  accessTokenTtl:   process.env.ACCESS_TOKEN_TTL  || "15m",
  refreshTokenTtl:  process.env.REFRESH_TOKEN_TTL || "7d",
  frontendUrl:      process.env.FRONTEND_URL || "http://localhost:5173",
  // Auth0 — optional, only required when social login is enabled
  auth0Domain:       process.env.AUTH0_DOMAIN       || null,
  auth0Audience:     process.env.AUTH0_AUDIENCE      || null,
  auth0ClientId:     process.env.AUTH0_CLIENT_ID     || null,
  auth0ClientSecret: process.env.AUTH0_CLIENT_SECRET || null,
  // Shared secret for Node → AI service calls (inter-service auth)
  aiServiceSecret: requiredEnv("AI_SERVICE_SECRET", "medassist_internal_CHANGE_IN_PRODUCTION"),
};

// Internal service-to-service secret — used to authenticate Node → Python calls.
// Must match AI_SERVICE_SECRET in the AI service's environment.
// Intentionally not required in dev (defaults to a placeholder), required in production.
