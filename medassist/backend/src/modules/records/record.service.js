const Record = require("./record.model");

async function add(user, body) {
  return Record.create({ ...body, patientId: user.id });
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

