const helmet        = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const logger        = require("../utils/logger");

/**
 * Security middleware stack — applied once in app.js before all routes.
 *
 * helmet        : sets 14 HTTP security headers (CSP, HSTS, X-Frame, etc.)
 * mongoSanitize : strips $ and . from req.body / req.query to prevent
 *                 MongoDB operator injection attacks
 */
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", "data:", "https:"],
      connectSrc:  ["'self'"],
      fontSrc:     ["'self'"],
      objectSrc:   ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Relax for API-only usage
});

const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: "_",   // replace illegal chars instead of silently stripping
  onSanitize: ({ req, key }) => {
    // Log with structured logger so injection attempts appear in production logs
    logger.warn("Mongo injection attempt blocked", { key, ip: req.ip });
  },
});

module.exports = { helmetMiddleware, mongoSanitizeMiddleware };
