const mongoose = require("mongoose");

const triageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symptoms: { type: String, required: true },
    age: { type: Number },
    status: { type: String, default: "" },
    topCondition: { type: String, default: "" },
    severity: { type: String, default: "" },
    predictions: [{ condition: String, confidence: Number }],
    specialty: { primary: String, secondary: String },
    advice: { action: String, urgency: String, home_care: String },
    isEmergency: { type: Boolean, default: false },
    rawResponse: { type: Object },
  },
  { timestamps: true }
);

// Triage history is always queried by userId, sorted by date
triageSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Triage", triageSchema);
