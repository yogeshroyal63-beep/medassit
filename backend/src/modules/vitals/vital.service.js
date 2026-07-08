const mongoose = require("mongoose");
const Vital = require("./vital.model");

const ALLOWED_FIELDS = ["systolic", "diastolic", "heartRate", "bloodSugar", "spo2", "temperature", "recordedAt"];

function allowlist(body) {
  const safe = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined && body[key] !== "" && body[key] !== null) safe[key] = body[key];
  }
  return safe;
}

async function log(user, body) {
  const safe = allowlist(body);
  const hasAnyReading = ["systolic", "diastolic", "heartRate", "bloodSugar", "spo2", "temperature"].some((k) => safe[k] !== undefined);
  if (!hasAnyReading) {
    const err = new Error("Please provide at least one vital reading");
    err.status = 400;
    throw err;
  }
  return Vital.create({ ...safe, patientId: user.id });
}

async function getLatest(user) {
  if (!mongoose.Types.ObjectId.isValid(user.id)) return null;
  return Vital.findOne({ patientId: user.id }).sort({ recordedAt: -1 });
}

/**
 * Monthly averages of systolic BP and heart rate for the last `months` months.
 * Only returns months that actually have at least one logged entry — we never
 * fabricate points for months with no real data, unlike a design mockup would.
 */
async function getTrend(user, months = 6) {
  if (!mongoose.Types.ObjectId.isValid(user.id)) return [];
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1); since.setHours(0, 0, 0, 0);

  const rows = await Vital.aggregate([
    { $match: { patientId: new mongoose.Types.ObjectId(user.id), recordedAt: { $gte: since } } },
    {
      $group: {
        _id: { year: { $year: "$recordedAt" }, month: { $month: "$recordedAt" } },
        avgSystolic:  { $avg: "$systolic" },
        avgHeartRate: { $avg: "$heartRate" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return rows.map((r) => ({
    label: new Date(r._id.year, r._id.month - 1, 1).toLocaleDateString(undefined, { month: "short" }),
    systolic:  r.avgSystolic  != null ? Math.round(r.avgSystolic)  : null,
    heartRate: r.avgHeartRate != null ? Math.round(r.avgHeartRate) : null,
  }));
}

module.exports = { log, getLatest, getTrend };
