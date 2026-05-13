const Appointment = require("./appointment.model");
const Doctor      = require("../doctors/doctor.model");

async function book(user, body) {
  // Bug #7 fixed: Prevent double-booking — check for existing active appointment
  const parsedDate = new Date(body.date);
  if (isNaN(parsedDate.getTime())) {
    const err = new Error("Invalid date format");
    err.status = 400;
    throw err;
  }

  const conflict = await Appointment.findOne({
    doctorId: body.doctorId,
    date:     parsedDate,
    time:     body.time,
    status:   { $nin: ["cancelled"] },
  });

  if (conflict) {
    const err = new Error("This time slot is already booked. Please choose another slot.");
    err.status = 409;
    throw err;
  }

  const appointment = await Appointment.create({
    patientId: user.id,
    doctorId:  body.doctorId,
    date:      parsedDate,   // Bug #11 fixed: stored as proper Date object
    time:      body.time,
    type:      body.type || "in-person",
    status:    "pending",
    reason:    body.reason || "",
    notes:     body.notes  || "",
  });

  return Appointment.findById(appointment._id)
    .populate("patientId", "name email")
    .populate({ path: "doctorId", populate: { path: "userId", select: "name email" } });
}

async function myAppointments(user, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const role = user.role;

  if (role === "patient") {
    return Appointment.find({ patientId: user.id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "doctorId", populate: { path: "userId", select: "name email" } });
  }
  if (role === "doctor") {
    const doctor = await Doctor.findOne({ userId: user.id });
    if (!doctor) {
      const err = new Error("Doctor profile not found");
      err.status = 404;
      throw err;
    }
    return Appointment.find({ doctorId: doctor._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate("patientId", "name email");
  }
  return Appointment.find({})
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .populate("patientId", "name email");
}

/**
 * Bug fix: doctors may only update appointments assigned to them.
 * Admins bypass the ownership check.
 */
async function updateStatus(id, newStatus, user) {
  let appt;

  if (user.role === "admin") {
    appt = await Appointment.findById(id);
  } else {
    // Resolve doctorId for the calling doctor
    const doctor = await Doctor.findOne({ userId: user.id });
    if (!doctor) {
      const err = new Error("Doctor profile not found");
      err.status = 404;
      throw err;
    }
    appt = await Appointment.findOne({ _id: id, doctorId: doctor._id });
  }

  if (!appt) {
    const err = new Error("Appointment not found");
    err.status = 404;
    throw err;
  }

  appt.status = newStatus;
  await appt.save();

  return Appointment.findById(appt._id)
    .populate("patientId", "name email")
    .populate({ path: "doctorId", populate: { path: "userId", select: "name email" } });
}

async function cancel(user, id) {
  const appt = await Appointment.findOne({ _id: id, patientId: user.id });
  if (!appt) {
    const err = new Error("Appointment not found");
    err.status = 404;
    throw err;
  }
  appt.status = "cancelled";
  await appt.save();
  return appt;
}

module.exports = { book, myAppointments, updateStatus, cancel };
