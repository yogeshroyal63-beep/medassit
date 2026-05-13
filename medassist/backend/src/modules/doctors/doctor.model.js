const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    licenseNumber: { type: String, required: true, unique: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    hospital: { type: String, required: true },
    bio: { type: String, default: "" },
    isApproved: { type: Boolean, default: false },
    isRejected: { type: Boolean, default: false },
    rejectionReason: { type: String, default: "" },
    licenseFileUrl: { type: String, default: "" },
    idFileUrl: { type: String, default: "" },
    availableDays: [{ type: String }],
    availableHours: { start: { type: String, default: "" }, end: { type: String, default: "" } },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);

