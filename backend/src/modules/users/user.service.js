const mongoose = require("mongoose");
const User = require("../auth/auth.model");
const UserProfile = require("./user.model");

async function getMe(user) {
  if (user?.id === "admin") {
    return { user: { id: "admin", name: "Admin", email: user.email, role: "admin", isApproved: true }, profile: null };
  }

  const dbUser = await User.findById(user.id);
  if (!dbUser) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  const profile = await UserProfile.findOne({ userId: dbUser._id });
  return {
    user: { id: dbUser._id.toString(), name: dbUser.name, email: dbUser.email, role: dbUser.role, isApproved: dbUser.isApproved },
    profile,
  };
}

async function updateMe(user, body) {
  if (user?.id === "admin") {
    const err = new Error("Admin profile updates are not supported");
    err.status = 400;
    throw err;
  }

  const allowed = {};
  if (typeof body.name === "string") allowed.name = body.name;
  if (typeof body.phone === "string") allowed.phone = body.phone;

  // Role changes are not allowed via this endpoint — roles are set at
  // registration and changed only via the admin approval flow.
  if (typeof body.role === "string") {
    const err = new Error("Role cannot be changed via profile update");
    err.status = 400;
    throw err;
  }

  const updatedUser = await User.findByIdAndUpdate(user.id, allowed, { new: true });
  if (!updatedUser) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  const profileAllowed = {};
  for (const k of ["age", "gender", "bloodGroup", "address"]) {
    if (body[k] !== undefined) profileAllowed[k] = body[k];
  }
  if (body.allergies !== undefined) {
    if (!Array.isArray(body.allergies)) {
      const err = new Error("allergies must be an array");
      err.status = 400;
      throw err;
    }
    profileAllowed.allergies = body.allergies;
  }
  if (body.chronicConds !== undefined) {
    if (!Array.isArray(body.chronicConds)) {
      const err = new Error("chronicConds must be an array");
      err.status = 400;
      throw err;
    }
    profileAllowed.chronicConds = body.chronicConds;
  }
  if (body.emergencyContact !== undefined) {
    profileAllowed.emergencyContact = body.emergencyContact;
  }
  if (body.phone !== undefined) {
    profileAllowed.phone = body.phone;
  }

  const profile = await UserProfile.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(user.id) },
    { $set: profileAllowed, $setOnInsert: { userId: new mongoose.Types.ObjectId(user.id) } },
    { upsert: true, new: true }
  );

  return {
    user: {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isApproved: updatedUser.isApproved,
    },
    profile,
  };
}


/**
 * changePassword — SECURITY NOTE:
 * When implementing password change, you MUST revoke all existing refresh tokens
 * for the user. Since tokenBlacklist is in-memory, the recommended approach is
 * to store a `passwordChangedAt` timestamp on the User model and reject any
 * refresh tokens issued before that timestamp in the JWT verification middleware.
 *
 * Example flow:
 *   1. Hash new password and save to User.
 *   2. Set User.passwordChangedAt = new Date().
 *   3. In auth.middleware, reject tokens where iat < passwordChangedAt.
 */
async function changePassword(user, body) {
  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) {
    const err = new Error("currentPassword and newPassword are required");
    err.status = 400;
    throw err;
  }
  const dbUser = await User.findById(user.id).select("+password");
  if (!dbUser) {
    const err = new Error("User not found"); err.status = 404; throw err;
  }
  const { comparePassword, hashPassword } = require("../../utils/bcrypt");
  const valid = await comparePassword(currentPassword, dbUser.password);
  if (!valid) {
    const err = new Error("Current password is incorrect"); err.status = 401; throw err;
  }
  dbUser.password = await hashPassword(newPassword);
  // Set passwordChangedAt so existing refresh tokens are invalidated
  dbUser.passwordChangedAt = new Date();
  await dbUser.save();
  return { message: "Password updated successfully" };
}

module.exports = { getMe, updateMe, changePassword };

