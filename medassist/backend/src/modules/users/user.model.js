const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    bloodGroup: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    allergies: [{ type: String }],
    chronicConds: [{ type: String }],
    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      relation: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProfile", userProfileSchema);

