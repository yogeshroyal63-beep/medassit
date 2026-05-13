const express  = require("express");
const jwt      = require("jsonwebtoken");
const jwksRsa  = require("jwks-rsa");
const User     = require("./auth.model");
const { jwtAccessSecret, jwtRefreshSecret, accessTokenTtl, refreshTokenTtl } = require("../../config/env");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

const { AUTH0_DOMAIN, AUTH0_AUDIENCE, AUTH0_CLIENT_ID } = process.env;

/**
 * POST /api/auth/auth0/exchange
 *
 * Called by the frontend after a successful Auth0 login.
 * The frontend passes the Auth0 access token; we:
 *   1. Verify it with Auth0's JWKS
 *   2. Find or create the local User record (social login upsert)
 *   3. Issue our own access + refresh tokens so the rest of the app
 *      continues to work with the existing auth middleware unchanged.
 *
 * This pattern is called "token exchange" — the Auth0 token is a
 * one-time voucher; the returned tokens are what the frontend stores.
 */
router.post("/exchange", async (req, res, next) => {
  if (!AUTH0_DOMAIN) {
    const err = new Error("Auth0 is not configured on this server");
    err.status = 501;
    return next(err);
  }

  const { auth0Token } = req.body;
  if (!auth0Token) {
    const err = new Error("auth0Token is required");
    err.status = 400;
    return next(err);
  }

  try {
    // Verify the incoming Auth0 token via JWKS
    const jwksClient = jwksRsa({
      jwksUri:   `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
      cache:     true,
      rateLimit: true,
    });

    const decoded = await new Promise((resolve, reject) => {
      const getKey = (header, cb) => {
        jwksClient.getSigningKey(header.kid, (err, key) => {
          if (err) return cb(err);
          cb(null, key.getPublicKey());
        });
      };
      jwt.verify(
        auth0Token,
        getKey,
        { audience: AUTH0_AUDIENCE, issuer: `https://${AUTH0_DOMAIN}/`, algorithms: ["RS256"] },
        (err, dec) => err ? reject(err) : resolve(dec)
      );
    });

    const email = decoded.email || decoded["https://medassist.api/email"];
    const name  = decoded.name  || decoded["https://medassist.api/name"] || email?.split("@")[0] || "User";
    const sub   = decoded.sub;  // Auth0 user ID e.g. "google-oauth2|123456"

    if (!email) {
      const err = new Error("Auth0 token does not contain an email claim");
      err.status = 400;
      return next(err);
    }

    // Upsert — find by email or create new patient account
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name,
        email:      email.toLowerCase(),
        password:   uuidv4(), // random unusable password — Auth0 users log in via social only
        role:       "patient",
        isApproved: true,
        auth0Sub:   sub,
      });
    } else if (!user.auth0Sub) {
      // Link existing local account to Auth0
      user.auth0Sub = sub;
      await user.save();
    }

    // Issue our own tokens
    const payload     = { id: user._id.toString(), role: user.role, email: user.email };
    const jti         = uuidv4();
    const accessToken  = jwt.sign(payload, jwtAccessSecret, { expiresIn: accessTokenTtl });
    const refreshToken = jwt.sign({ ...payload, jti }, jwtRefreshSecret, { expiresIn: refreshTokenTtl });

    return res.json({
      accessToken,
      refreshToken,
      token: accessToken,
      user: {
        id:         user._id.toString(),
        name:       user.name,
        email:      user.email,
        role:       user.role,
        isApproved: user.isApproved,
        provider:   "auth0",
      },
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      const e = new Error("Invalid or expired Auth0 token");
      e.status = 401;
      return next(e);
    }
    return next(err);
  }
});

/**
 * GET /api/auth/auth0/config
 *
 * Returns the Auth0 client config the frontend needs to initialise the
 * Auth0 SDK. Never exposes secrets — only public values.
 */
router.get("/config", (_req, res) => {
  if (!AUTH0_DOMAIN) {
    return res.json({ enabled: false });
  }
  return res.json({
    enabled:   true,
    domain:    AUTH0_DOMAIN,
    clientId:  AUTH0_CLIENT_ID || "",
    audience:  AUTH0_AUDIENCE  || "",
  });
});

module.exports = router;
