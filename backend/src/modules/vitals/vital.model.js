const mongoose = require("mongoose");

// All fields optional — a patient can log just the readings they have on
// hand (e.g. only heart rate from a smartwatch) without needing every value.
const vitalSchema = new mongoose.Schema(
  {
    patientId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    systolic:    { type: Number, default: null }, // mmHg
    diastolic:   { type: Number, default: null }, // mmHg
    heartRate:   { type: Number, default: null }, // bpm
    bloodSugar:  { type: Number, default: null }, // mg/dL
    spo2:        { type: Number, default: null }, // %
    temperature: { type: Number, default: null }, // °C
    recordedAt:  { type: Date, default: Date.now },
  },
  { timestamps: true }
);

vitalSchema.index({ patientId: 1, recordedAt: -1 });

module.exports = mongoose.model("Vital", vitalSchema);
