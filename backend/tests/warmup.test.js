/**
 * Warm-up, cold-start resilience and model-card tests.
 * No MongoDB or Python process needed: axios is mocked, so the AI service is simulated.
 * Delays are scaled down so retry loops finish in milliseconds.
 */
process.env.NODE_ENV = "test";
process.env.AI_RETRY_DELAY_SCALE = "0.001";
process.env.AI_WARM_DEADLINE_MS = "400";

const request = require("supertest");
const axios   = require("axios");

jest.mock("axios");

const app    = require("../src/app");
const warmup = require("../src/modules/warmup/warmup.service");

const flush = () => new Promise((r) => setImmediate(r));
const until = async (fn, ms = 1500) => {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (fn()) return true; await new Promise((r) => setTimeout(r, 5)); }
  return fn();
};
const err = (props) => Object.assign(new Error(props.message || "upstream"), props);
const asleep429 = () => err({ response: { status: 429, headers: { "x-render-routing": "hibernate-rate-limited" } } });

beforeEach(() => {
  jest.resetAllMocks();
  warmup._resetForTests();
});

describe("GET /api/v1/warmup", () => {
  it("responds immediately and wakes the AI service in the background", async () => {
    let release;
    axios.get.mockImplementation(() => new Promise((r) => { release = r; })); // AI still booting

    const res = await request(app).get("/api/v1/warmup");
    expect(res.status).toBe(200);
    expect(res.body.backend).toBe("ok");
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get.mock.calls[0][0]).toMatch(/\/warmup$/);
    expect(axios.get.mock.calls[0][1].headers).toHaveProperty("x-internal-secret");

    release({ data: { phase: "ready", inference_mode: "bert", model_id: "x/y", load_seconds: 12.5 } });
    await flush(); await flush();

    const again = await request(app).get("/api/v1/warmup");
    expect(again.body.ai.state).toBe("ready");
    expect(again.body.ai.mode).toBe("bert");
    expect(again.body.ai.loadSeconds).toBe(12.5);
  });

  it("does not hammer the AI service: a ready service is not re-pinged", async () => {
    axios.get.mockResolvedValue({ data: { phase: "ready", inference_mode: "bert" } });
    await request(app).get("/api/v1/warmup");
    await flush(); await flush();
    await request(app).get("/api/v1/warmup");
    await request(app).get("/api/v1/warmup");
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("polls /status until the model has loaded", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { phase: "warming" } })
      .mockResolvedValue({ data: { phase: "ready", inference_mode: "bert" } });
    warmup.warmAi();
    expect(await until(() => warmup.getState().state === "ready")).toBe(true);
    expect(axios.get.mock.calls[1][0]).toMatch(/\/status$/);
  });

  it("reports degraded when the AI service runs the rule-based fallback", async () => {
    axios.get.mockResolvedValue({ data: { phase: "ready_fallback", inference_mode: "rule-based-fallback" } });
    warmup.warmAi();
    expect(await until(() => warmup.getState().state === "degraded")).toBe(true);
  });

  it("keeps retrying while Render answers 429 hibernate-rate-limited, then reaches ready", async () => {
    axios.get
      .mockRejectedValueOnce(asleep429())
      .mockRejectedValueOnce(asleep429())
      .mockRejectedValueOnce(err({ code: "ECONNREFUSED" }))
      .mockResolvedValue({ data: { phase: "ready", inference_mode: "bert" } });
    warmup.warmAi();
    expect(await until(() => warmup.getState().state === "ready")).toBe(true);
    expect(axios.get.mock.calls.length).toBeGreaterThanOrEqual(4);
    expect(axios.get.mock.calls[3][0]).toMatch(/\/warmup$/); // re-wakes after a failure
  });

  it("gives up at once on a non-transient error (for example a wrong secret)", async () => {
    axios.get.mockRejectedValue(err({ response: { status: 401, headers: {} } }));
    warmup.warmAi();
    expect(await until(() => warmup.getState().state === "unreachable")).toBe(true);
    expect(warmup.getState().error).toBe("HTTP 401");
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("treats a malformed response as unreachable instead of waiting on it", async () => {
    axios.get.mockResolvedValue({ data: "<html>proxy page</html>" });
    warmup.warmAi();
    expect(await until(() => warmup.getState().state === "unreachable")).toBe(true);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("gives up after the deadline if the AI service never wakes", async () => {
    axios.get.mockRejectedValue(asleep429());
    warmup.warmAi();
    expect(await until(() => warmup.getState().state === "unreachable", 3000)).toBe(true);
    expect(warmup.getState().error).toMatch(/did not become ready/);
  });
});

describe("waitUntilReady / noteAiFailure", () => {
  it("waits for an in-flight warm-up and returns true", async () => {
    axios.get
      .mockRejectedValueOnce(asleep429())
      .mockResolvedValue({ data: { phase: "ready", inference_mode: "bert" } });
    expect(await warmup.waitUntilReady(30_000)).toBe(true);
  });

  it("returns false (and never throws) when the AI service stays down", async () => {
    axios.get.mockRejectedValue(err({ response: { status: 401, headers: {} } }));
    await expect(warmup.waitUntilReady(30_000)).resolves.toBe(false);
  });

  it("a transient failure flips a ready service back to waking and restarts the warm-up", async () => {
    axios.get.mockResolvedValue({ data: { phase: "ready", inference_mode: "bert" } });
    warmup.warmAi();
    expect(await until(() => warmup.getState().state === "ready")).toBe(true);
    const callsBefore = axios.get.mock.calls.length;
    warmup.noteAiFailure();
    expect(warmup.getState().state).toBe("waking");
    expect(await until(() => axios.get.mock.calls.length > callsBefore)).toBe(true);
  });
});

describe("login hook", () => {
  it("login triggers a background warm-up and still returns the login result", async () => {
    jest.resetModules();
    jest.doMock("../src/modules/auth/auth.service", () => ({ login: jest.fn().mockResolvedValue({ accessToken: "t" }) }));
    const warm = jest.fn();
    jest.doMock("../src/modules/warmup/warmup.service", () => ({ warmAi: warm }));
    const controller = require("../src/modules/auth/auth.controller");

    const res = { setHeader: jest.fn(), json: jest.fn() };
    await controller.login({ body: { email: "a@b.c", password: "x" } }, res, jest.fn());

    expect(warm).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ accessToken: "t" });
    jest.dontMock("../src/modules/auth/auth.service");
    jest.dontMock("../src/modules/warmup/warmup.service");
  });
});

describe("GET /api/v1/model/info", () => {
  it("returns the model card and runtime state, and warms the AI service", async () => {
    axios.get.mockResolvedValue({ data: { phase: "ready", inference_mode: "bert" } });
    const res = await request(app).get("/api/v1/model/info");
    expect(res.status).toBe(200);
    expect(res.body.card.name).toMatch(/MedAssist/);
    expect(Array.isArray(res.body.card.limitations)).toBe(true);
    expect(res.body.runtime).toHaveProperty("state");
    expect(axios.get).toHaveBeenCalled();
  });
});

describe("POST /api/v1/model/explain", () => {
  const post = (body) => request(app).post("/api/v1/model/explain").send(body);

  it("rejects too-short, too-long and bad-age input", async () => {
    expect((await post({ symptoms: "hi" })).status).toBe(400);
    expect((await post({ symptoms: "x".repeat(301) })).status).toBe(400);
    expect((await post({ symptoms: "fever and cough", age: 200 })).status).toBe(400);
    expect((await post({ symptoms: "fever and cough", age: "abc" })).status).toBe(400);
  });

  it("sanitises input and passes the AI result through", async () => {
    axios.mockResolvedValue({ data: { status: "success", top_condition: "Flu", tokens: [] } });
    const res = await post({ symptoms: "<b>fever</b> and   cough for 2 days", age: 30 });
    expect(res.status).toBe(200);
    expect(res.body.top_condition).toBe("Flu");
    const sent = axios.mock.calls[0][0];
    expect(sent.data.symptoms).toBe("fever and cough for 2 days");
    expect(sent.data.age).toBe(30);
    expect(sent.headers).toHaveProperty("x-internal-secret");
  });

  it("retries a 429 from the sleeping AI service, then returns 503 with a friendly message", async () => {
    axios.mockRejectedValue(asleep429());
    axios.get.mockRejectedValue(asleep429());
    const res = await post({ symptoms: "fever and cough for 2 days" });
    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/waking up/i);
    expect(axios).toHaveBeenCalledTimes(4);
  });
});
