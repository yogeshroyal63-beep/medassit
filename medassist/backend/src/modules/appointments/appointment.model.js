const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
    doctorId:  { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date:      { type: Date,   required: true },   // Bug #11 fixed: Date type, not String
    time:      { type: String, required: true },
    type:      { type: String, enum: ["in-person", "video"], default: "in-person" },
    status:    { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
    reason:    { type: String, default: "" },
    notes:     { type: String, default: "" },
  },
  { timestamps: true }
);

// Indexes for common query patterns
appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: 1, time: 1, status: 1 }); // double-booking check

module.exports = mongoose.model("Appointment", appointmentSchema);
