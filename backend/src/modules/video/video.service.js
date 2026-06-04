const crypto = require("crypto");
const Appointment = require("../appointments/appointment.model");
const Doctor = require("../doctors/doctor.model");

/**
 * Create a video room for a confirmed appointment.
 * The roomId is persisted on the Appointment document so the Socket.io
 * join-room handler can verify that the connecting user is a legitimate
 * participant.
 *
 * If the caller supplies ?appointmentId in the query / body, we associate
 * the room with that appointment. Otherwise we create an anonymous room
 * (legacy behaviour — still accepted, but join-room auth will require admin role).
 */
async function createRoom(user, appointmentId) {
  const roomId = crypto.randomUUID();
  const token  = crypto.randomBytes(24).toString("hex");

  if (appointmentId) {
    // Resolve the doctorId for doctor callers
    let query;
    if (user.role === "doctor") {
      const doc = await Doctor.findOne({ userId: user.id }).select("_id").lean();
      query = doc
        ? { _id: appointmentId, $or: [{ patientId: user.id }, { doctorId: doc._id }] }
        : { _id: appointmentId, patientId: user.id };
    } else {
      query = { _id: appointmentId, patientId: user.id };
    }

    const appt = await Appointment.findOneAndUpdate(
      query,
      { roomId },
      { new: true }
    );

    if (!appt) {
      const err = new Error("Appointment not found or you are not a participant");
      err.status = 404;
      throw err;
    }
  }

  return { roomId, token };
}

function joinRoom(roomId) {
  if (!roomId) {
    const err = new Error("roomId required");
    err.status = 400;
    throw err;
  }
  return { roomId };
}

module.exports = { createRoom, joinRoom };
