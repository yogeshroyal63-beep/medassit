const jwt         = require("jsonwebtoken");
const { jwtSecret, jwtAccessSecret } = require("../config/env");

/**
 * Auth0 JWT Middleware
 *
 * Supports BOTH authentication flows in one middleware:
 *
 *  1. Auth0 social login  — token issued by Auth0, verified using the
 *     AUTH0_DOMAIN + AUTH0_AUDIENCE environment variables via JWKS.
 *     The sub claim (e.g. "google-oauth2|123456") is used as the user id.
 *
 *  2. Local JWT login     — token issued by our own authService.login(),
 *     verified with jwtAccessSecret. This keeps existing local accounts
 *     working unchanged while Auth0 is being onboarded.
 *
 * Both token types set the same req.user shape:
 *   { id, email, role, isApproved, provider }
 *
 * HOW TO ENABLE Auth0:
 *   Set in backend/.env:
 *     AUTH0_DOMAIN=your-tenant.us.auth0.com
 *     AUTH0_AUDIENCE=https://medassist.api
 *     AUTH0_CLIENT_ID=...
 *     AUTH0_CLIENT_SECRET=...
 *
 * As long as AUTH0_DOMAIN is not set, Auth0 verification is skipped and
 * only local JWTs are accepted — so nothing breaks in development.
 */

const { AUTH0_DOMAIN, AUTH0_AUDIENCE } = process.env;

let jwksClient;
let getKey;

if (AUTH0_DOMAIN) {
  try {
    // Lazy-load jwks-rsa — only needed when Auth0 is configured
    const jwksRsa = require("jwks-rsa");
    jwksClient = jwksRsa({
      jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
      cache:   true,
      rateLimit: true,
    });

    getKey = (header, callback) => {
      jwksClient.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        callback(null, key.getPublicKey());
      });
    };
  } catch {
    // jwks-rsa not installed — Auth0 won't be available, local JWT only
    console.warn("[Auth0] jwks-rsa not installed — Auth0 login disabled");
  }
}

/**
 * Verify an Auth0-issued JWT.
 * Returns the decoded payload or null on failure.
 */
function verifyAuth0Token(token) {
  return new Promise((resolve) => {
    if (!getKey) return resolve(null);
    jwt.verify(
      token,
      getKey,
      {
        audience:   AUTH0_AUDIENCE,
        issuer:     `https://${AUTH0_DOMAIN}/`,
        algorithms: ["RS256"],
      },
      (err, decoded) => resolve(err ? null : decoded)
    );
  });
}

/**
 * Verify a local JWT issued by our own authService.
 * Returns the decoded payload or null on failure.
 */
function verifyLocalToken(token) {
  try {
    return jwt.verify(token, jwtAccessSecret);
  } catch {
    return null;
  }
}

/**
 * Map an Auth0 payload to the standard req.user shape.
 * Auth0 puts the role in a custom namespace claim:
 *   https://medassist.api/role
 */
function auth0PayloadToUser(payload) {
  return {
    id:         payload.sub,                                   // e.g. "google-oauth2|12345"
    email:      payload.email || payload["https://medassist.api/email"] || "",
    role:       payload["https://medassist.api/role"] || "patient",
    isApproved: payload["https://medassist.api/isApproved"] !== false,
    provider:   "auth0",
  };
}

/**
 * Map a local JWT payload to the standard req.user shape.
 */
function localPayloadToUser(payload) {
  return {
    id:         payload.id,
    email:      payload.email,
    role:       payload.role,
    isApproved: payload.isApproved !== false,
    provider:   "local",
  };
}

/**
 * The actual Express middleware.
 * Try Auth0 first (if configured), then fall back to local JWT.
 */
async function auth0Middleware(req, _res, next) {
  const header = req.headers.authorization || "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    const err  = new Error("Unauthorized");
    err.status = 401;
    return next(err);
  }

  // 1. Try Auth0 if configured
  if (AUTH0_DOMAIN) {
    const auth0Payload = await verifyAuth0Token(token);
    if (auth0Payload) {
      req.user = auth0PayloadToUser(auth0Payload);
      return next();
    }
  }

  // 2. Fall back to local JWT
  const localPayload = verifyLocalToken(token);
  if (localPayload) {
    req.user = localPayloadToUser(localPayload);
    return next();
  }

  // 3. Neither matched — reject
  const err  = new Error("Unauthorized");
  err.status = 401;
  return next(err);
}

module.exports = auth0Middleware;
