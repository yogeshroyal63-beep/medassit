const authService = require("./auth.service");
const { warmAi } = require("../warmup/warmup.service");

function noStore(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
}

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (e) { next(e); }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    warmAi(); // wake the AI service in the background; never blocks the login response
    noStore(res);
    res.json(result);
  } catch (e) { next(e); }
}

async function me(req, res, next) {
  try {
    const result = await authService.me(req.user.id);
    res.json(result);
  } catch (e) { next(e); }
}

/**
 * POST /auth/refresh
 * Body: { refreshToken: "..." }
 * Returns a new access token + rotated refresh token.
 */
async function refresh(req, res, next) {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    noStore(res);
    res.json(result);
  } catch (e) { next(e); }
}

/**
 * POST /auth/logout
 * Body: { refreshToken: "..." }
 * Blacklists the refresh token so it cannot be reused.
 */
async function logout(req, res, next) {
  try {
    await authService.logout(req.body?.refreshToken);
    res.json({ message: "Logged out successfully" });
  } catch (e) { next(e); }
}

module.exports = { register, login, me, refresh, logout };
