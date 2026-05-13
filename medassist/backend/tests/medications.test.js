const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../src/app");

const TEST_URI = process.env.TEST_MONGO_URI || "mongodb://localhost:27017/medassist_test";

let token;
let medId;

const sampleMed = {
  name: "Paracetamol",
  dosage: "500mg",
  frequency: "twice daily",
  times: ["08:00", "20:00"],
  startDate: "2027-01-01",
};

beforeAll(async () => {
  await mongoose.connect(TEST_URI);
  await request(app).post("/api/v1/auth/register")
    .send({ name: "Med Patient", email: "med@test.com", password: "pass1234", role: "patient" });
  const res = await request(app).post("/api/v1/auth/login")
    .send({ email: "med@test.com", password: "pass1234" });
  token = res.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe("Medications CRUD — /api/medications", () => {
  it("rejects unauthenticated access with 401", async () => {
    const res = await request(app).get("/api/v1/medications");
    expect(res.status).toBe(401);
  });

  it("adds a medication (201)", async () => {
    const res = await request(app).post("/api/v1/medications")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleMed);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Paracetamol");
    medId = res.body._id;
  });

  it("lists medications — includes the one just added", async () => {
    const res = await request(app).get("/api/v1/medications")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((m) => m._id === medId)).toBe(true);
  });

  it("updates medication dosage (200)", async () => {
    const res = await request(app).put(`/api/medications/${medId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ dosage: "1000mg" });
    expect(res.status).toBe(200);
    expect(res.body.dosage).toBe("1000mg");
  });

  it("marks medication as taken (200)", async () => {
    const res = await request(app).patch(`/api/medications/${medId}/taken`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.takenToday).toBe(true);
  });

  it("returns 404 for a non-existent medication", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/api/medications/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ dosage: "250mg" });
    expect(res.status).toBe(404);
  });

  it("deletes the medication (200)", async () => {
    const res = await request(app).delete(`/api/medications/${medId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Deleted");
  });

  it("returns 404 after deletion", async () => {
    const res = await request(app).put(`/api/medications/${medId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ dosage: "250mg" });
    expect(res.status).toBe(404);
  });
});
