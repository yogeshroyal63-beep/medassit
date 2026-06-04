const fs = require("fs");
const Doctor = require("./doctor.model");
const User = require("../auth/auth.model");

// Magic-byte signatures for allowed document types
const MAGIC_SIGNATURES = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff], offset: 0 },
  { mime: "image/png",  bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF header
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 }, // %PDF
];

/**
 * Read the first 8 bytes of a file and verify the magic signature matches
 * one of the allowed MIME types. Returns true if valid, false otherwise.
 */
function validateMagicBytes(filePath) {
  let fd;
  try {
    const buf = Buffer.alloc(8);
    fd = fs.openSync(filePath, "r");
    const bytesRead = fs.readSync(fd, buf, 0, 8, 0);
    if (bytesRead < 4) return false;

    return MAGIC_SIGNATURES.some(({ bytes, offset }) =>
      bytes.every((b, i) => buf[offset + i] === b)
    );
  } catch {
    return false;
  } finally {
    if (fd !== undefined) {
      try { fs.closeSync(fd); } catch {}
    }
  }
}

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

  // Validate magic bytes — reject files whose content doesn't match their declared type
  if (!validateMagicBytes(licenseFile.path)) {
    // Clean up the rejected file
    try { fs.unlinkSync(licenseFile.path); } catch {}
    try { fs.unlinkSync(idFile.path); } catch {}
    const err = new Error("License file content is not a valid JPEG, PNG, WebP, or PDF");
    err.status = 400;
    throw err;
  }
  if (!validateMagicBytes(idFile.path)) {
    try { fs.unlinkSync(licenseFile.path); } catch {}
    try { fs.unlinkSync(idFile.path); } catch {}
    const err = new Error("Government ID file content is not a valid JPEG, PNG, WebP, or PDF");
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
