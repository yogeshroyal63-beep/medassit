const mongoose = require("mongoose");
const { hashPassword, comparePassword } = require("../../utils/bcrypt");

const userSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true },
    email:      { type: String, required: true, unique: true, lowercase: true },
    password:   { type: String, required: true, select: false },
    role:       { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
    phone:      { type: String, default: "" },
    // isApproved: false by default — patients set to true at registration,
    // doctors stay false until admin approves
    isApproved: { type: Boolean, default: false },
    avatar:     { type: String, default: "" },
    // Auth0 social login support — stores the Auth0 sub claim (e.g. "google-oauth2|123")
    auth0Sub:   { type: String, default: null, sparse: true },
    // Timestamp set when password is changed — used to invalidate old tokens
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function preSave(next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  return next();
});

userSchema.methods.comparePassword = async function compare(pw) {
  return comparePassword(pw, this.password);
};

module.exports = mongoose.model("User", userSchema);
