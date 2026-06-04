const mongoose = require("mongoose");

const User = require("../auth/auth.model");
const Doctor = require("../doctors/doctor.model");
const Appointment = require("../appointments/appointment.model");
const Triage = require("../triage/triage.model");

async function stats() {
  const [patients, doctors, appointments, triages] = await Promise.all([
    User.countDocuments({ role: "patient" }),
    Doctor.countDocuments({}),
    Appointment.countDocuments({}),
    Triage.countDocuments({}),
  ]);
  return { totalPatients: patients, totalDoctors: doctors, totalAppointments: appointments, totalTriageSessions: triages };
}

async function pendingDoctors() {
  return Doctor.find({ isApproved: false, isRejected: false }).populate("userId", "name email isApproved role");
}

async function approveDoctor(id) {
  const doc = await Doctor.findById(id);
  if (!doc) {
    const err = new Error("Doctor not found");
    err.status = 404;
    throw err;
  }
  doc.isApproved = true;
  doc.isRejected = false;
  doc.rejectionReason = "";
  await doc.save();
  await User.findByIdAndUpdate(doc.userId, { isApproved: true });
  return doc;
}

async function rejectDoctor(id, reason) {
  const doc = await Doctor.findById(id);
  if (!doc) {
    const err = new Error("Doctor not found");
    err.status = 404;
    throw err;
  }
  doc.isApproved = false;
  doc.isRejected = true;
  doc.rejectionReason = reason || "";
  await doc.save();
  await User.findByIdAndUpdate(doc.userId, { isApproved: false });
  return doc;
}

async function users({ page = 1, limit = 50 } = {}) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    User.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments({ role: { $ne: "admin" } }),
  ]);
  return { data, total, page, limit };
}

async function auditLogs() {
  const [triages, appointments] = await Promise.all([
    Triage.find({}).sort({ createdAt: -1 }).limit(50).lean(),
    Appointment.find({}).sort({ createdAt: -1 }).limit(50).lean(),
  ]);
  return { triages, appointments };
}

module.exports = { stats, pendingDoctors, approveDoctor, rejectDoctor, users, auditLogs };

