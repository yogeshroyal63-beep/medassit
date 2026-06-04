/**
 * Security tests — rate limiting, helmet headers, mongo sanitization,
 * role guards, input validation, token edge cases.
 */
const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../src/app");

const TEST_URI = process.env.TEST_MONGO_URI || "mongodb://localhost:27017/medassist_test";

let patientToken;
let doctorToken;

beforeAll(async () => {
  await mongoose.connect(TEST_URI);

  await request(app).post("/api/v1/auth/register")
    .send({ name: "Sec Patient", email: "sec_pat@test.com", password: "pass1234", role: "patient" });
  const pRes = await request(app).post("/api/v1/auth/login")
    .send({ email: "sec_pat@test.com", password: "pass1234" });
  patientToken = pRes.body.accessToken;

  const dReg = await request(app).post("/api/v1/auth/register")
    .send({ name: "Sec Doctor", email: "sec_doc@test.com", password: "pass1234", role: "doctor" });
  const Doctor = require("../src/modules/doctors/doctor.model");
  const User   = require("../src/modules/auth/auth.model");
  await User.findByIdAndUpdate(dReg.body.user.id, { isApproved: true });
  await Doctor.create({
    userId: dReg.body.user.id, licenseNumber: "LIC-SEC-001",
    specialization: "General", experience: 3,
    hospital: "Sec Hospital", isApproved: true,
  });
  const dRes = await request(app).post("/api/v1/auth/login")
    .send({ email: "sec_doc@test.com", password: "pass1234" });
  doctorToken = dRes.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

// ─── HTTP Security Headers (helmet) ────────────────────────────────────────
describe("Security headers — helmet", () => {
  it("sets X-Content-Type-Options: nosniff", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("sets X-Frame-Options to deny clickjacking", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-frame-options"]).toMatch(/DENY|SAMEORIGIN/i);
  });

  it("sets X-XSS-Protection or Content-Security-Policy", async () => {
    const res = await request(app).get("/api/health");
    const hasCSP = !!res.headers["content-security-policy"];
    const hasXSS = !!res.headers["x-xss-protection"];
    expect(hasCSP || hasXSS).toBe(true);
  });

  it("does not expose X-Powered-By", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

// ─── Role Guards ────────────────────────────────────────────────────────────
describe("Role guards", () => {
  it("blocks patient from doctor-only route (403)", async () => {
    const res = await request(app).get("/api/v1/doctors/me")
      .set("Authorization", `Bearer ${patientToken}`);
    expect(res.status).toBe(403);
  });

  it("blocks doctor from admin route (403)", async () => {
    const res = await request(app).get("/api/v1/admin/stats")
      .set("Authorization", `Bearer ${doctorToken}`);
    expect(res.status).toBe(403);
  });

  it("blocks unauthenticated user from protected route (401)", async () => {
    const res = await request(app).get("/api/v1/medications");
    expect(res.status).toBe(401);
  });
});

// ─── JWT edge cases ─────────────────────────────────────────────────────────
describe("JWT security", () => {
  it("rejects a tampered token (401)", async () => {
    const [header, payload] = patientToken.split(".");
    const badToken = `${header}.${payload}.badsignature`;
    const res = await request(app).get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${badToken}`);
    expect(res.status).toBe(401);
  });

  it("rejects a completely invalid token (401)", async () => {
    const res = await request(app).get("/api/v1/auth/me")
      .set("Authorization", "Bearer not.a.token");
    expect(res.status).toBe(401);
  });

  it("rejects missing Bearer prefix (401)", async () => {
    const res = await request(app).get("/api/v1/auth/me")
      .set("Authorization", patientToken);
    expect(res.status).toBe(401);
  });
});

// ─── MongoDB Injection Prevention ────────────────────────────────────────────
describe("MongoDB operator injection — sanitisation", () => {
  it("rejects login attempt with $gt operator injection", async () => {
    const res = await request(app).post("/api/v1/auth/login")
      .send({ email: { $gt: "" }, password: "anything" });
    // Should be 400 (Joi validation catches the non-string) not 200 or 500
    expect(res.status).toBe(400);
  });

  it("rejects nested $where injection", async () => {
    const res = await request(app).post("/api/v1/auth/login")
      .send({ email: "test@test.com", password: { $where: "function(){return true}" } });
    expect(res.status).toBe(400);
  });
});

// ─── Input Validation (Joi) ─────────────────────────────────────────────────
describe("Input validation", () => {
  it("rejects registration with password < 8 chars (400)", async () => {
    const res = await request(app).post("/api/v1/auth/register")
      .send({ name: "Test", email: "shortpw@test.com", password: "123", role: "patient" });
    expect(res.status).toBe(400);
  });

  it("rejects registration with invalid email format (400)", async () => {
    const res = await request(app).post("/api/v1/auth/register")
      .send({ name: "Test", email: "not-an-email", password: "pass1234", role: "patient" });
    expect(res.status).toBe(400);
  });

  it("rejects registration with invalid role (400)", async () => {
    const res = await request(app).post("/api/v1/auth/register")
      .send({ name: "Test", email: "val@test.com", password: "pass1234", role: "superuser" });
    expect(res.status).toBe(400);
  });

  it("rejects appointment booking with missing doctorId (400)", async () => {
    const res = await request(app).post("/api/v1/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ date: "2027-06-15", time: "10:00" });
    expect(res.status).toBe(400);
  });

  it("rejects medication creation without required fields (400)", async () => {
    const res = await request(app).post("/api/v1/medications")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ name: "Aspirin" }); // missing dosage, frequency, startDate
    expect(res.status).toBe(400);
  });
});

// ─── Auth0 config endpoint ───────────────────────────────────────────────────
describe("Auth0 config endpoint", () => {
  it("returns enabled: false when AUTH0_DOMAIN is not set", async () => {
    const savedDomain = process.env.AUTH0_DOMAIN;
    delete process.env.AUTH0_DOMAIN;

    const res = await request(app).get("/api/v1/auth/auth0/config");
    expect(res.status).toBe(200);
    expect(res.body.enabled).toBe(false);

    if (savedDomain) process.env.AUTH0_DOMAIN = savedDomain;
  });
});
