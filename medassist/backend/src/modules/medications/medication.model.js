const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    patientId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:         { type: String, required: true },
    dosage:       { type: String, required: true },
    frequency:    { type: String, required: true },
    times:        [{ type: String }],
    startDate:    { type: Date,    required: true },
    endDate:      { type: Date,    default: null },
    instructions: { type: String, default: "" },
    prescribedBy: { type: String, default: "" },
    isActive:     { type: Boolean, default: true },
    takenToday:   { type: Boolean, default: false },
    lastTakenDate:{ type: Date,    default: null },
  },
  { timestamps: true }
);

/**
 * Reset takenToday when lastTakenDate is from a previous day.
 * Persists the change to the database instead of just mutating memory.
 */
async function resetTakenTodayIfStale(docs) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const stale = docs.filter((doc) => {
    if (!doc.takenToday) return false;
    if (!doc.lastTakenDate) return true;
    // lastTakenDate is now a Date — compare ISO date string prefix
    return doc.lastTakenDate.toISOString().slice(0, 10) !== todayStr;
  });
  if (stale.length === 0) return;

  const ids = stale.map((doc) => doc._id);
  // Bulk-write instead of N individual saves — efficient and atomic
  await mongoose.model("Medication").updateMany(
    { _id: { $in: ids } },
    { $set: { takenToday: false } }
  );
  // Reflect the change in the in-memory documents so the caller sees correct data
  stale.forEach((doc) => { doc.takenToday = false; });
}

medicationSchema.post("find", async function (docs) {
  if (!docs || docs.length === 0) return;
  await resetTakenTodayIfStale(docs);
});

medicationSchema.post("findOne", async function (doc) {
  if (!doc) return;
  await resetTakenTodayIfStale([doc]);
});

module.exports = mongoose.model("Medication", medicationSchema);
