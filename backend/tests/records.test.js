const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../src/app");

const TEST_URI = process.env.TEST_MONGO_URI || "mongodb://localhost:27017/medassist_test";

let token;
let recordId;

beforeAll(async () => {
  await mongoose.connect(TEST_URI);
  await request(app).post("/api/v1/auth/register")
    .send({ name: "Record Patient", email: "record@test.com", password: "pass1234", role: "patient" });
  const res = await request(app).post("/api/v1/auth/login")
    .send({ email: "record@test.com", password: "pass1234" });
  token = res.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe("Medical Records — /api/records", () => {
  it("rejects unauthenticated list with 401", async () => {
    const res = await request(app).get("/api/v1/records");
    expect(res.status).toBe(401);
  });

  it("creates a record (201)", async () => {
    const res = await request(app).post("/api/v1/records")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Blood test",
        type: "lab",
        date: "2027-03-10",
        description: "Full CBC panel",
        doctorName: "Dr. Smith",
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Blood test");
    recordId = res.body._id;
  });

  it("lists records — includes the created one", async () => {
    const res = await request(app).get("/api/v1/records")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((r) => r._id === recordId)).toBe(true);
  });

  it("filters records by type", async () => {
    const res = await request(app).get("/api/v1/records?type=lab")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    res.body.forEach((r) => expect(r.type).toBe("lab"));
  });

  it("gets a single record by id", async () => {
    const res = await request(app).get(`/api/records/${recordId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(recordId);
  });

  it("returns 404 for another user's record id", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/records/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("deletes the record (200)", async () => {
    const res = await request(app).delete(`/api/records/${recordId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Deleted");
  });
});
