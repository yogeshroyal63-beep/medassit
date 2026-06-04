const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["lab", "prescription", "imaging", "diagnosis", "vaccination", "other"],
      required: true,
    },
    description: { type: String, default: "" },
    date: { type: Date, required: true },
    doctorName: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Records are always queried by patient
recordSchema.index({ patientId: 1, date: -1 });

module.exports = mongoose.model("Record", recordSchema);
