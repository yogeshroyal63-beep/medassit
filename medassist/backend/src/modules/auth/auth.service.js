const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const User = require("./auth.model");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../../utils/jwt");
const blacklist = require("../../utils/tokenBlacklist");
const { adminEmail, adminPassword } = require("../../config/env");

/** Build the public user object returned in every auth response. */
function publicUser(user) {
  return {
    id:         user._id ? user._id.toString() : user.id,
    name:       user.name,
    email:      user.email,
    role:       user.role,
    isApproved: user.isApproved,
  };
}

/** Issue a matched access + refresh token pair. */
function issueTokens(payload) {
  const jti          = uuidv4();
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken({ ...payload, jti });
  return { accessToken, refreshToken };
}

async function register({ name, email, password, role, phone }) {
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    const err = new Error("Email already in use");
    err.status = 409;
    throw err;
  }

  const isDoctor = role === "doctor";
  const user = await User.create({
    name,
    email:      email.toLowerCase(),
    password,
    role,
    phone:      phone || "",
    isApproved: isDoctor ? false : true,
  });

  const payload = { id: user._id.toString(), role: user.role, email: user.email };
  const { accessToken, refreshToken } = issueTokens(payload);

  return { accessToken, refreshToken, token: accessToken, user: publicUser(user) };
}

async function login({ email, password }) {
  // Admin fast-path
  if (adminEmail && adminPassword && email === adminEmail) {
    const ok = await bcrypt.compare(password, adminPassword);
    if (!ok) { const e = new Error("Invalid credentials"); e.status = 401; throw e; }

    const payload = { id: "admin", role: "admin", email: adminEmail };
    const { accessToken, refreshToken } = issueTokens(payload);
    const user = { id: "admin", name: "Admin", email: adminEmail, role: "admin", isApproved: true };
    return { accessToken, refreshToken, token: accessToken, user };
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) { const e = new Error("Invalid credentials"); e.status = 401; throw e; }

  const ok = await user.comparePassword(password);
  if (!ok)  { const e = new Error("Invalid credentials"); e.status = 401; throw e; }

  // Block unapproved doctors from logging in
  if (user.role === "doctor" && !user.isApproved) {
    const e = new Error("Your account is pending admin approval. You will be notified once approved.");
    e.status = 403;
    throw e;
  }

  const payload = { id: user._id.toString(), role: user.role, email: user.email };
  const { accessToken, refreshToken } = issueTokens(payload);

  return { accessToken, refreshToken, token: accessToken, user: publicUser(user) };
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    const e = new Error("Refresh token required"); e.status = 400; throw e;
  }
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    const e = new Error("Invalid or expired refresh token"); e.status = 401; throw e;
  }

  if (await blacklist.has(payload.jti)) {
    const e = new Error("Refresh token has been revoked"); e.status = 401; throw e;
  }

  // Blacklist the old refresh token (rotation — one-time use)
  await blacklist.add(payload.jti);

  const { jti: _jti, iat: _iat, exp: _exp, ...clean } = payload;
  const { accessToken, refreshToken: newRefreshToken } = issueTokens(clean);
  return { accessToken, refreshToken: newRefreshToken, token: accessToken };
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  try {
    const payload = verifyRefreshToken(refreshToken);
    if (payload.jti) await blacklist.add(payload.jti);
  } catch {
    // Token already expired — nothing to do
  }
}

async function me(userId) {
  if (userId === "admin") {
    return { id: "admin", name: "Admin", email: adminEmail, role: "admin", isApproved: true };
  }
  const user = await User.findById(userId);
  if (!user) { const e = new Error("User not found"); e.status = 404; throw e; }
  return publicUser(user);
}

module.exports = { register, login, refresh, logout, me };
