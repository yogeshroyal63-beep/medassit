const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../src/app");

const TEST_URI = process.env.TEST_MONGO_URI || "mongodb://localhost:27017/medassist_test";

let patientToken;
let doctorToken;
let appointmentId;
// A real doctor ObjectId we'll create in the Doctor collection
let doctorProfileId;

beforeAll(async () => {
  await mongoose.connect(TEST_URI);

  // Register patient
  await request(app).post("/api/v1/auth/register")
    .send({ name: "Appt Patient", email: "appt_patient@test.com", password: "pass1234", role: "patient" });
  const pRes = await request(app).post("/api/v1/auth/login")
    .send({ email: "appt_patient@test.com", password: "pass1234" });
  patientToken = pRes.body.accessToken;

  // Register doctor (approved manually via DB so they can login)
  const dRegRes = await request(app).post("/api/v1/auth/register")
    .send({ name: "Dr. Appt", email: "dr_appt@test.com", password: "pass1234", role: "doctor" });
  const doctorUserId = dRegRes.body.user.id;

  // Manually approve the doctor + create a Doctor profile
  const User   = require("../src/modules/auth/auth.model");
  const Doctor = require("../src/modules/doctors/doctor.model");
  await User.findByIdAndUpdate(doctorUserId, { isApproved: true });
  const doctorDoc = await Doctor.create({
    userId:        doctorUserId,
    licenseNumber: "LIC-TEST-001",
    specialization: "General Physician",
    experience:    5,
    hospital:      "Test Hospital",
    isApproved:    true,
  });
  doctorProfileId = doctorDoc._id.toString();

  const dRes = await request(app).post("/api/v1/auth/login")
    .send({ email: "dr_appt@test.com", password: "pass1234" });
  doctorToken = dRes.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe("Appointments — /api/appointments", () => {
  it("rejects booking without auth (401)", async () => {
    const res = await request(app).post("/api/v1/appointments")
      .send({ doctorId: doctorProfileId, date: "2027-06-15", time: "10:00", type: "in-person" });
    expect(res.status).toBe(401);
  });

  it("rejects booking by a doctor (role guard, 403)", async () => {
    const res = await request(app).post("/api/v1/appointments")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ doctorId: doctorProfileId, date: "2027-06-15", time: "10:00", type: "in-person" });
    expect(res.status).toBe(403);
  });

  it("books a slot successfully (201)", async () => {
    const res = await request(app).post("/api/v1/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ doctorId: doctorProfileId, date: "2027-06-15", time: "10:00", type: "in-person" });
    expect(res.status).toBe(201);
    appointmentId = res.body._id;
  });

  it("prevents double-booking the same slot (409)", async () => {
    const res = await request(app).post("/api/v1/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ doctorId: doctorProfileId, date: "2027-06-15", time: "10:00", type: "in-person" });
    expect(res.status).toBe(409);
  });

  it("patient can list own appointments", async () => {
    const res = await request(app).get("/api/v1/appointments/my")
      .set("Authorization", `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((a) => a._id === appointmentId)).toBe(true);
  });

  it("doctor can update appointment status to confirmed", async () => {
    const res = await request(app).patch(`/api/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ status: "confirmed" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("confirmed");
  });

  it("patient can cancel their appointment", async () => {
    const res = await request(app).patch(`/api/appointments/${appointmentId}/cancel`)
      .set("Authorization", `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("cancelled");
  });

  it("rejects invalid date format with 400", async () => {
    const res = await request(app).post("/api/v1/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ doctorId: doctorProfileId, date: "not-a-date", time: "10:00", type: "in-person" });
    expect(res.status).toBe(400);
  });
});
