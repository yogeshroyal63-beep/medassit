const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../src/app");

const TEST_URI = process.env.TEST_MONGO_URI || "mongodb://localhost:27017/medassist_test";

let tokenA; // sender
let tokenB; // receiver
let userBId;

beforeAll(async () => {
  await mongoose.connect(TEST_URI);

  // Register two users
  await request(app).post("/api/v1/auth/register")
    .send({ name: "Alice Msg", email: "alice_msg@test.com", password: "pass1234", role: "patient" });
  const resB = await request(app).post("/api/v1/auth/register")
    .send({ name: "Bob Msg", email: "bob_msg@test.com", password: "pass1234", role: "patient" });
  userBId = resB.body.user.id;

  const resA = await request(app).post("/api/v1/auth/login")
    .send({ email: "alice_msg@test.com", password: "pass1234" });
  tokenA = resA.body.accessToken;

  const loginB = await request(app).post("/api/v1/auth/login")
    .send({ email: "bob_msg@test.com", password: "pass1234" });
  tokenB = loginB.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe("Messaging — /api/messages", () => {
  it("rejects unauthenticated send with 401", async () => {
    const res = await request(app).post("/api/v1/messages")
      .send({ receiverId: userBId, content: "Hello" });
    expect(res.status).toBe(401);
  });

  it("rejects message without content with 400", async () => {
    const res = await request(app).post("/api/v1/messages")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ receiverId: userBId, content: "" });
    expect(res.status).toBe(400);
  });

  it("rejects message to invalid receiverId with 400", async () => {
    const res = await request(app).post("/api/v1/messages")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ receiverId: "not-an-id", content: "Hello" });
    expect(res.status).toBe(400);
  });

  it("sends a message successfully (201)", async () => {
    const res = await request(app).post("/api/v1/messages")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ receiverId: userBId, content: "Hello Bob!" });
    expect(res.status).toBe(201);
    expect(res.body.content).toBe("Hello Bob!");
  });

  it("lists conversations for sender", async () => {
    const res = await request(app).get("/api/v1/messages")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("fetches the conversation thread between Alice and Bob", async () => {
    const res = await request(app).get(`/api/messages/${userBId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].content).toBe("Hello Bob!");
  });
});
