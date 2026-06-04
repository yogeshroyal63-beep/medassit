/**
 * Admin route tests — doctor approval, stats, user list, audit logs.
 */
const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../src/app");
const User     = require("../src/modules/auth/auth.model");
const Doctor   = require("../src/modules/doctors/doctor.model");

const TEST_URI = process.env.TEST_MONGO_URI || "mongodb://localhost:27017/medassist_test";

let adminToken;
let patientToken;
let doctorProfileId;

beforeAll(async () => {
  await mongoose.connect(TEST_URI);

  // Create admin user directly in DB (cannot register via API)
  const bcrypt = require("bcryptjs");
  const hash   = await bcrypt.hash("adminpass", 10);
  await User.create({
    name: "Admin User", email: "admin_test@medassist.com",
    password: hash, role: "admin", isApproved: true,
  });

  // Login as admin using the env-based admin path
  process.env.ADMIN_EMAIL    = "admin_test@medassist.com";
  process.env.ADMIN_PASSWORD = hash;

  const adminRes = await request(app).post("/api/v1/auth/login")
    .send({ email: "admin_test@medassist.com", password: "adminpass" });
  adminToken = adminRes.body.accessToken;

  // Create a patient
  await request(app).post("/api/v1/auth/register")
    .send({ name: "Admin Test Patient", email: "admin_pat@test.com", password: "pass1234", role: "patient" });
  const pRes = await request(app).post("/api/v1/auth/login")
    .send({ email: "admin_pat@test.com", password: "pass1234" });
  patientToken = pRes.body.accessToken;

  // Create a pending doctor
  const dReg = await request(app).post("/api/v1/auth/register")
    .send({ name: "Dr. Pending", email: "dr_pending@test.com", password: "pass1234", role: "doctor" });
  const doc = await Doctor.create({
    userId: dReg.body.user.id, licenseNumber: "LIC-PEND-001",
    specialization: "Cardiology", experience: 8,
    hospital: "Test Hospital", isApproved: false,
  });
  doctorProfileId = doc._id.toString();
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe("Admin — access control", () => {
  it("blocks patient from admin stats (403)", async () => {
    const res = await request(app).get("/api/v1/admin/stats")
      .set("Authorization", `Bearer ${patientToken}`);
    expect(res.status).toBe(403);
  });

  it("blocks unauthenticated request (401)", async () => {
    const res = await request(app).get("/api/v1/admin/stats");
    expect(res.status).toBe(401);
  });
});

describe("Admin — stats", () => {
  it("returns platform stats for admin", async () => {
    const res = await request(app).get("/api/v1/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.totalPatients).toBe("number");
    expect(typeof res.body.totalDoctors).toBe("number");
  });
});

describe("Admin — pending doctors", () => {
  it("lists pending doctor approvals", async () => {
    const res = await request(app).get("/api/v1/admin/doctors/pending")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((d) => d._id === doctorProfileId)).toBe(true);
  });

  it("approves a doctor", async () => {
    const res = await request(app).patch(`/api/admin/doctors/${doctorProfileId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const doctor = await Doctor.findById(doctorProfileId);
    expect(doctor.isApproved).toBe(true);
  });
});

describe("Admin — users list", () => {
  it("returns all non-admin users", async () => {
    const res = await request(app).get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Admin users must not appear in this list
    res.body.forEach((u) => expect(u.role).not.toBe("admin"));
  });
});

describe("Admin — audit logs", () => {
  it("returns audit log data", async () => {
    const res = await request(app).get("/api/v1/admin/audit-logs")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
