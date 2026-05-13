/**
 * Triage tests — mocks the AI service so no Python process is needed.
 */
const request  = require("supertest");
const mongoose = require("mongoose");
const axios    = require("axios");
const app      = require("../src/app");

jest.mock("axios");

const TEST_URI = process.env.TEST_MONGO_URI || "mongodb://localhost:27017/medassist_test";

let token;

beforeAll(async () => {
  await mongoose.connect(TEST_URI);
  // Register + login a patient
  await request(app).post("/api/v1/auth/register")
    .send({ name: "Triage Patient", email: "triage@test.com", password: "pass1234", role: "patient" });
  const res = await request(app).post("/api/v1/auth/login")
    .send({ email: "triage@test.com", password: "pass1234" });
  token = res.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

// ─── POST /api/triage ────────────────────────────────────────────────────────
describe("POST /api/triage", () => {
  it("rejects request without auth with 401", async () => {
    const res = await request(app).post("/api/v1/triage")
      .send({ symptoms: "fever and headache" });
    expect(res.status).toBe(401);
  });

  it("rejects empty symptoms with 400", async () => {
    const res = await request(app).post("/api/v1/triage")
      .set("Authorization", `Bearer ${token}`)
      .send({ symptoms: "" });
    expect(res.status).toBe(400);
  });

  it("returns emergency response for emergency keywords — skips AI call", async () => {
    const res = await request(app).post("/api/v1/triage")
      .set("Authorization", `Bearer ${token}`)
      .send({ symptoms: "severe chest pain and shortness of breath" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("emergency");
    expect(res.body.isEmergency).toBe(true);
    // AI service must NOT be called for emergencies
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("forwards normal symptoms to AI service and returns result", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        status: "success",
        top_condition: "Viral Fever",
        severity: "moderate",
        predictions: [{ condition: "Viral Fever", confidence: 0.87 }],
        advice: "Rest and stay hydrated.",
      },
    });

    const res = await request(app).post("/api/v1/triage")
      .set("Authorization", `Bearer ${token}`)
      .send({ symptoms: "I have had a fever and body aches for two days", age: 28 });

    expect(res.status).toBe(200);
    expect(res.body.top_condition).toBe("Viral Fever");
    expect(axios.post).toHaveBeenCalled();
  });

  it("strips HTML tags from symptom input before processing", async () => {
    axios.post.mockResolvedValueOnce({ data: { status: "success", top_condition: "Migraine", predictions: [] } });

    const res = await request(app).post("/api/v1/triage")
      .set("Authorization", `Bearer ${token}`)
      .send({ symptoms: "<script>alert('xss')</script>I have a severe headache" });

    // Should not error out — sanitization must have handled the tags
    expect([200, 400]).toContain(res.status);
    if (res.status === 200 && axios.post.mock.calls.length > 0) {
      const sentSymptoms = axios.post.mock.calls.at(-1)[1].symptoms;
      expect(sentSymptoms).not.toContain("<script>");
    }
  });
});

// ─── GET /api/triage/history ─────────────────────────────────────────────────
describe("GET /api/triage/history", () => {
  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/v1/triage/history");
    expect(res.status).toBe(401);
  });

  it("returns an array for authenticated patient", async () => {
    const res = await request(app).get("/api/v1/triage/history")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
