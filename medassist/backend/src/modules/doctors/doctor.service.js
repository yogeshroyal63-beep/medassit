const Doctor = require("./doctor.model");
const User = require("../auth/auth.model");

async function listApproved({ specialization }) {
  const filter = { isApproved: true, isRejected: false };
  if (specialization) filter.specialization = new RegExp(String(specialization), "i");
  return Doctor.find(filter).populate("userId", "name email");
}

async function getMe(user) {
  const doc = await Doctor.findOne({ userId: user.id }).populate("userId", "name email role isApproved");
  if (!doc) {
    const err = new Error("Doctor profile not found");
    err.status = 404;
    throw err;
  }
  return doc;
}

async function getById(id) {
  const doc = await Doctor.findById(id).populate("userId", "name email");
  if (!doc) {
    const err = new Error("Doctor not found");
    err.status = 404;
    throw err;
  }
  return doc;
}

async function registerDoctor(user, body, files) {
  const exists = await Doctor.findOne({ userId: user.id });
  if (exists) {
    const err = new Error("Doctor registration already submitted");
    err.status = 409;
    throw err;
  }

  const licenseFile = files?.license?.[0];
  const idFile = files?.governmentId?.[0];
  if (!licenseFile || !idFile) {
    const err = new Error("License document and Government ID are required");
    err.status = 400;
    throw err;
  }

  const doc = await Doctor.create({
    userId: user.id,
    licenseNumber: body.licenseNumber,
    specialization: body.specialization,
    experience: Number(body.experience),
    hospital: body.hospital,
    bio: body.bio || "",
    licenseFileUrl: `/uploads/${licenseFile.filename}`,
    idFileUrl: `/uploads/${idFile.filename}`,
    isApproved: false,
    isRejected: false,
  });

  await User.findByIdAndUpdate(user.id, { role: "doctor", isApproved: false });
  return doc;
}

async function updateAvailability(user, body) {
  const update = {};
  if (Array.isArray(body.availableDays)) update.availableDays = body.availableDays;
  if (body.availableHours && typeof body.availableHours === "object") update.availableHours = body.availableHours;

  const doc = await Doctor.findOneAndUpdate({ userId: user.id }, update, { new: true });
  if (!doc) {
    const err = new Error("Doctor profile not found");
    err.status = 404;
    throw err;
  }
  return doc;
}

module.exports = { listApproved, getMe, getById, registerDoctor, updateAvailability };

