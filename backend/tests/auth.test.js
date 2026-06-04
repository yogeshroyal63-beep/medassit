const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../src/app");

const TEST_URI = process.env.TEST_MONGO_URI || "mongodb://localhost:27017/medassist_test";

beforeAll(async () => { await mongoose.connect(TEST_URI); });
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

// ─── Register ────────────────────────────────────────────────────────────────
describe("POST /api/auth/register", () => {
  it("registers a patient and returns accessToken + refreshToken", async () => {
    const res = await request(app).post("/api/v1/auth/register")
      .send({ name: "Alice", email: "alice@test.com", password: "pass1234", role: "patient" });
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    expect(res.body.user.role).toBe("patient");
    expect(res.body.user.isApproved).toBe(true);
  });

  it("registers a doctor with isApproved: false", async () => {
    const res = await request(app).post("/api/v1/auth/register")
      .send({ name: "Dr. Bob", email: "dr.bob@test.com", password: "pass1234", role: "doctor" });
    expect(res.status).toBe(201);
    expect(res.body.user.isApproved).toBe(false);
  });

  it("rejects duplicate email with 409", async () => {
    const res = await request(app).post("/api/v1/auth/register")
      .send({ name: "Alice2", email: "alice@test.com", password: "pass1234", role: "patient" });
    expect(res.status).toBe(409);
  });
});

// ─── Login ───────────────────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  it("returns accessToken + refreshToken on valid credentials", async () => {
    const res = await request(app).post("/api/v1/auth/login")
      .send({ email: "alice@test.com", password: "pass1234" });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
  });

  it("rejects wrong password with 401", async () => {
    const res = await request(app).post("/api/v1/auth/login")
      .send({ email: "alice@test.com", password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  it("rejects unknown email with 401", async () => {
    const res = await request(app).post("/api/v1/auth/login")
      .send({ email: "ghost@test.com", password: "pass1234" });
    expect(res.status).toBe(401);
  });
});

// ─── Token refresh ───────────────────────────────────────────────────────────
describe("POST /api/auth/refresh", () => {
  let refreshToken;

  beforeAll(async () => {
    const res = await request(app).post("/api/v1/auth/login")
      .send({ email: "alice@test.com", password: "pass1234" });
    refreshToken = res.body.refreshToken;
  });

  it("issues a new access token + rotated refresh token", async () => {
    const res = await request(app).post("/api/v1/auth/refresh")
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    // The rotated token must differ from the original
    expect(res.body.refreshToken).not.toBe(refreshToken);
  });

  it("rejects a reused (rotated-out) refresh token with 401", async () => {
    // refreshToken was already rotated in the previous test
    const res = await request(app).post("/api/v1/auth/refresh")
      .send({ refreshToken });
    expect(res.status).toBe(401);
  });

  it("rejects a garbage token with 401", async () => {
    const res = await request(app).post("/api/v1/auth/refresh")
      .send({ refreshToken: "not.a.real.token" });
    expect(res.status).toBe(401);
  });
});

// ─── /me ─────────────────────────────────────────────────────────────────────
describe("GET /api/auth/me", () => {
  let token;
  beforeAll(async () => {
    const res = await request(app).post("/api/v1/auth/login")
      .send({ email: "alice@test.com", password: "pass1234" });
    token = res.body.accessToken;
  });

  it("returns current user when authenticated", async () => {
    const res = await request(app).get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("alice@test.com");
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });
});

// ─── Logout ──────────────────────────────────────────────────────────────────
describe("POST /api/auth/logout", () => {
  it("invalidates the refresh token — subsequent refresh is rejected", async () => {
    const loginRes = await request(app).post("/api/v1/auth/login")
      .send({ email: "alice@test.com", password: "pass1234" });
    const { refreshToken } = loginRes.body;

    const logoutRes = await request(app).post("/api/v1/auth/logout")
      .send({ refreshToken });
    expect(logoutRes.status).toBe(200);

    // Attempt to reuse the blacklisted token
    const refreshRes = await request(app).post("/api/v1/auth/refresh")
      .send({ refreshToken });
    expect(refreshRes.status).toBe(401);
  });
});
