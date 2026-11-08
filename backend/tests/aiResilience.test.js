/**
 * Regression tests for the cold-start failure seen in production logs:
 * Render answered 429 (x-render-routing: hibernate-rate-limited) for the sleeping
 * AI service, the backend did not retry it, passed the 429 to the user, and the
 * logger printed the x-internal-secret header. No MongoDB needed.
 */
process.env.NODE_ENV = "test";
process.env.AI_RETRY_DELAY_SCALE = "0.001";
process.env.AI_WARM_DEADLINE_MS = "400";

const axios = require("axios");
jest.mock("axios");
jest.mock("../src/utils/logger", () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() }));

const logger     = require("../src/utils/logger");
const warmup     = require("../src/modules/warmup/warmup.service");
const triage     = require("../src/modules/triage/triage.service");
const errorMw    = require("../src/middleware/error.middleware");

const err = (props) => Object.assign(new Error(props.message || "upstream"), props);
const asleep429 = () => err({ isAxiosError: true, response: { status: 429, headers: { "x-render-routing": "hibernate-rate-limited" } } });
const aiOk = { data: { status: "success", top_condition: "Migraine", severity: "low", predictions: [{ condition: "Migraine", confidence: 0.8 }] } };
const user = { id: "not-an-object-id" }; // skips the database write
const body = { symptoms: "mild headache and nausea since this morning" };

beforeEach(() => {
  jest.resetAllMocks();
  warmup._resetForTests();
  axios.get.mockResolvedValue({ data: { phase: "ready", inference_mode: "bert" } });
});

describe("triage against a sleeping AI service", () => {
  it("retries 429 until the AI service wakes, then returns the result", async () => {
    axios.post.mockRejectedValueOnce(asleep429()).mockRejectedValueOnce(asleep429()).mockResolvedValue(aiOk);
    const result = await triage.runTriage(user, body, "rid-1");
    expect(result.top_condition).toBe("Migraine");
    expect(axios.post).toHaveBeenCalledTimes(3);
  });

  it("returns a friendly 503, never the upstream 429, if it never wakes", async () => {
    axios.post.mockRejectedValue(asleep429());
    await expect(triage.runTriage(user, body, "rid-2")).rejects.toMatchObject({
      status: 503,
      message: expect.stringMatching(/waking up/i),
    });
    expect(axios.post).toHaveBeenCalledTimes(6);
  });

  it("does not retry a real client error", async () => {
    axios.post.mockRejectedValue(err({ isAxiosError: true, response: { status: 422, headers: {} } }));
    await expect(triage.runTriage(user, body, "rid-3")).rejects.toMatchObject({ response: { status: 422 } });
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it("waits for the warm-up before calling /triage", async () => {
    const order = [];
    axios.get.mockImplementation(async () => { order.push("warmup"); return { data: { phase: "ready", inference_mode: "bert" } }; });
    axios.post.mockImplementation(async () => { order.push("triage"); return aiOk; });
    await triage.runTriage(user, body, "rid-4");
    expect(order).toEqual(["warmup", "triage"]);
  });
});

describe("error middleware", () => {
  const makeRes = () => { const r = {}; r.status = jest.fn(() => r); r.json = jest.fn(() => r); return r; };

  it("never logs the internal secret from an axios error", () => {
    const e = asleep429();
    e.config = { url: "https://ai.example.com/triage", method: "post", headers: { "x-internal-secret": "SUPERSECRET123" } };
    e.request = { _header: "x-internal-secret: SUPERSECRET123" };
    errorMw(e, {}, makeRes(), jest.fn());
    const logged = JSON.stringify(logger.error.mock.calls);
    expect(logged).not.toContain("SUPERSECRET123");
    expect(logged).toContain("hibernate-rate-limited");
    expect(logged).toContain("429");
  });

  it("turns an upstream 429 into a 503 for the user", () => {
    const res = makeRes();
    errorMw(asleep429(), {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json.mock.calls[0][0].message).toMatch(/waking up/i);
  });

  it("keeps the normal behaviour for other errors", () => {
    const res = makeRes();
    errorMw(Object.assign(new Error("Bad input"), { status: 400 }), {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Bad input" });
    const res2 = makeRes();
    errorMw(new Error("boom"), {}, res2, jest.fn());
    expect(res2.status).toHaveBeenCalledWith(500);
    expect(res2.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});

describe("proxy setting", () => {
  it("trusts one proxy hop, so rate limits are per user and the X-Forwarded-For warning is gone", async () => {
    const request = require("supertest");
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const app = require("../src/app");
    expect(app.get("trust proxy")).toBe(1);
    await request(app).get("/api/v1/warmup").set("X-Forwarded-For", "203.0.113.7");
    const text = spy.mock.calls.map((c) => String(c[0])).join(" ");
    expect(text).not.toContain("ERR_ERL_UNEXPECTED_X_FORWARDED_FOR");
    spy.mockRestore();
  });
});
