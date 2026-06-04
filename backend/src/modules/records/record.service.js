const Record = require("./record.model");

// Fields a patient is allowed to set when creating a medical record.
// patientId is always injected server-side — never from the request body.
const ALLOWED_FIELDS = [
  "title",
  "type",
  "description",
  "date",
  "doctorName",
  "fileUrl",
  "tags",
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
  return Record.create({ ...safe, patientId: user.id });
}

async function list(user, type) {
  const filter = { patientId: user.id };
  if (type) filter.type = type;
  return Record.find(filter).sort({ createdAt: -1 });
}

async function getOne(user, id) {
  const rec = await Record.findOne({ _id: id, patientId: user.id });
  if (!rec) {
    const err = new Error("Record not found");
    err.status = 404;
    throw err;
  }
  return rec;
}

async function remove(user, id) {
  const rec = await Record.findOneAndDelete({ _id: id, patientId: user.id });
  if (!rec) {
    const err = new Error("Record not found");
    err.status = 404;
    throw err;
  }
  return { message: "Deleted" };
}

module.exports = { add, list, getOne, remove };
