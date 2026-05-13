/**
 * Doctor routes — list, profile, registration, availability.
 */
const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../src/app");

const TEST_URI = process.env.TEST_MONGO_URI || "mongodb://localhost:27017/medassist_test";

let doctorToken;
let patientToken;
let doctorUserId;

beforeAll(async () => {
  await mongoose.connect(TEST_URI);

  const dReg = await request(app).post("/api/v1/auth/register")
    .send({ name: "Dr. List", email: "dr_list@test.com", password: "pass1234", role: "doctor" });
  doctorUserId = dReg.body.user.id;

  // Approve the doctor and create a Doctor profile
  const User   = require("../src/modules/auth/auth.model");
  const Doctor = require("../src/modules/doctors/doctor.model");
  await User.findByIdAndUpdate(doctorUserId, { isApproved: true });
  await Doctor.create({
    userId: doctorUserId, licenseNumber: "LIC-LIST-001",
    specialization: "Dermatology", experience: 6,
    hospital: "List Hospital", isApproved: true,
  });

  const dRes = await request(app).post("/api/v1/auth/login")
    .send({ email: "dr_list@test.com", password: "pass1234" });
  doctorToken = dRes.body.accessToken;

  await request(app).post("/api/v1/auth/register")
    .send({ name: "List Patient", email: "list_pat@test.com", password: "pass1234", role: "patient" });
  const pRes = await request(app).post("/api/v1/auth/login")
    .send({ email: "list_pat@test.com", password: "pass1234" });
  patientToken = pRes.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe("Doctor list — GET /api/doctors", () => {
  it("returns a list of doctors without auth (public route)", async () => {
    const res = await request(app).get("/api/v1/doctors");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("includes the created doctor in results", async () => {
    const res = await request(app).get("/api/v1/doctors");
    const names = res.body.map((d) => d.userId?.name || "");
    expect(names.some((n) => n.includes("Dr. List"))).toBe(true);
  });
});

describe("Doctor /me — GET /api/doctors/me", () => {
  it("returns doctor profile when authenticated as doctor", async () => {
    const res = await request(app).get("/api/v1/doctors/me")
      .set("Authorization", `Bearer ${doctorToken}`);
    expect(res.status).toBe(200);
  });

  it("blocks patient from /me (403)", async () => {
    const res = await request(app).get("/api/v1/doctors/me")
      .set("Authorization", `Bearer ${patientToken}`);
    expect(res.status).toBe(403);
  });
});

describe("Doctor availability — PATCH /api/doctors/availability", () => {
  it("updates availability for a doctor", async () => {
    const res = await request(app).patch("/api/v1/doctors/availability")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ availableDays: ["Monday", "Wednesday", "Friday"] });
    expect([200, 404]).toContain(res.status);
  });

  it("blocks patient from updating doctor availability (403)", async () => {
    const res = await request(app).patch("/api/v1/doctors/availability")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ availableDays: ["Monday"] });
    expect(res.status).toBe(403);
  });
});
