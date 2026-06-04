const Medication = require("./medication.model");

// Fields a patient is allowed to set when creating or updating a medication.
// patientId is injected server-side and must never come from the request body.
const ALLOWED_FIELDS = [
  "name",
  "dosage",
  "frequency",
  "times",
  "startDate",
  "endDate",
  "instructions",
  "prescribedBy",
  "isActive",
];

/** Pick only allowed fields from a request body. */
function allowlist(body) {
  const safe = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) safe[key] = body[key];
  }
  return safe;
}

async function add(user, body) {
  const safe = allowlist(body);
  const med = await Medication.create({ ...safe, patientId: user.id });
  return med;
}

async function getAll(user) {
  // Daily takenToday reset is handled by the post("find") hook in medication.model.js
  return Medication.find({ patientId: user.id }).sort({ createdAt: -1 });
}

async function update(user, id, body) {
  const safe = allowlist(body);
  const med = await Medication.findOneAndUpdate(
    { _id: id, patientId: user.id },
    safe,
    { new: true }
  );
  if (!med) {
    const err = new Error("Medication not found");
    err.status = 404;
    throw err;
  }
  return med;
}

async function remove(user, id) {
  const med = await Medication.findOneAndDelete({ _id: id, patientId: user.id });
  if (!med) {
    const err = new Error("Medication not found");
    err.status = 404;
    throw err;
  }
  return { message: "Deleted" };
}

async function markTaken(user, id) {
  const med = await Medication.findOneAndUpdate(
    { _id: id, patientId: user.id },
    { takenToday: true, lastTakenDate: new Date() },
    { new: true }
  );
  if (!med) {
    const err = new Error("Medication not found");
    err.status = 404;
    throw err;
  }
  return med;
}

module.exports = { add, getAll, update, remove, markTaken };