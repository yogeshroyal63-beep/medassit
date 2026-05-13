/**
 * User profile tests — GET /me, PUT /me, input validation.
 */
const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../src/app");

const TEST_URI = process.env.TEST_MONGO_URI || "mongodb://localhost:27017/medassist_test";

let token;

beforeAll(async () => {
  await mongoose.connect(TEST_URI);
  await request(app).post("/api/v1/auth/register")
    .send({ name: "User Profile Test", email: "user_prof@test.com", password: "pass1234", role: "patient" });
  const res = await request(app).post("/api/v1/auth/login")
    .send({ email: "user_prof@test.com", password: "pass1234" });
  token = res.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe("User profile — /api/users/me", () => {
  it("GET /me returns current user", async () => {
    const res = await request(app).get("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("user_prof@test.com");
  });

  it("GET /me returns 401 without token", async () => {
    const res = await request(app).get("/api/v1/users/me");
    expect(res.status).toBe(401);
  });

  it("PUT /me updates name and phone", async () => {
    const res = await request(app).put("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Name", phone: "+91 9876543210" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Name");
  });

  it("PUT /me rejects invalid age (>130)", async () => {
    const res = await request(app).put("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ age: 999 });
    expect(res.status).toBe(400);
  });

  it("PUT /me does not allow role escalation to admin", async () => {
    const res = await request(app).put("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "admin" });
    // Should either 400 (validation blocks it) or succeed but role stays patient
    if (res.status === 200) {
      expect(res.body.role).not.toBe("admin");
    } else {
      expect(res.status).toBe(400);
    }
  });
});
