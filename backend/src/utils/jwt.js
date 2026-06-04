const jwt = require("jsonwebtoken");
const {
  jwtAccessSecret,
  jwtRefreshSecret,
  accessTokenTtl,
  refreshTokenTtl,
} = require("../config/env");

/**
 * Short-lived access token (default 15 m).
 * Used in Authorization: Bearer headers for every API call.
 */
function signAccessToken(payload) {
  return jwt.sign(payload, jwtAccessSecret, { expiresIn: accessTokenTtl });
}

/**
 * Long-lived refresh token (default 7 d).
 * Sent only to POST /auth/refresh — never exposed to other routes.
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, jwtRefreshSecret, { expiresIn: refreshTokenTtl });
}

function verifyAccessToken(token) {
  return jwt.verify(token, jwtAccessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, jwtRefreshSecret);
}

// Legacy aliases — keeps auth.middleware.js and any other callers working
const signToken    = signAccessToken;
const verifyToken  = verifyAccessToken;

module.exports = {
  signToken,
  verifyToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
