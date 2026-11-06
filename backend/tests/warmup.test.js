/**
 * Warm-up + model-card tests. No MongoDB or Python process needed:
 * axios is mocked, so the AI service is simulated.
 */
const request = require("supertest");
const axios   = require("axios");

jest.mock("axios");

process.env.NODE_ENV = "test";

const app     = require("../src/app");
const warmup  = require("../src/modules/warmup/warmup.service");

const flush = () => new Promise((r) => setImmediate(r));

beforeEach(() => {
  jest.clearAllMocks();
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

    // AI finishes booting and reports ready
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
      .mockResolvedValueOnce({ data: { phase: "ready", inference_mode: "bert" } });
    jest.useFakeTimers();
    try {
      warmup.warmAi();
      await Promise.resolve(); await Promise.resolve();
      await jest.advanceTimersByTimeAsync(3000);
      await Promise.resolve();
    } finally {
      jest.useRealTimers();
    }
    expect(axios.get.mock.calls[1][0]).toMatch(/\/status$/);
    expect(warmup.getState().state).toBe("ready");
  });

  it("reports degraded when the AI service runs the rule-based fallback", async () => {
    axios.get.mockResolvedValue({ data: { phase: "ready_fallback", inference_mode: "rule-based-fallback" } });
    warmup.warmAi();
    await flush(); await flush();
    expect(warmup.getState().state).toBe("degraded");
  });

  it("reports unreachable without throwing when the AI service is down", async () => {
    axios.get.mockRejectedValue(Object.assign(new Error("refused"), { code: "ECONNREFUSED" }));
    const res = await request(app).get("/api/v1/warmup");
    expect(res.status).toBe(200);
    await flush(); await flush();
    const s = warmup.getState();
    expect(s.state).toBe("unreachable");
    expect(s.error).toBe("ECONNREFUSED");
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
    expect(res.body.runtime).toHaveProperty("state");
    const sent = axios.mock.calls[0][0];
    expect(sent.data.symptoms).toBe("fever and cough for 2 days");
    expect(sent.data.age).toBe(30);
    expect(sent.headers).toHaveProperty("x-internal-secret");
  });

  it("returns 503 with a friendly message while the AI service is waking up", async () => {
    // Real timers on purpose: supertest does real socket I/O. The service retries
    // with 1.5 s and 3 s delays, so this takes about 5 s.
    axios.mockRejectedValue(Object.assign(new Error("refused"), { code: "ECONNREFUSED" }));
    axios.get.mockResolvedValue({ data: { phase: "warming" } });
    const res = await post({ symptoms: "fever and cough for 2 days" });
    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/waking up/i);
    expect(axios).toHaveBeenCalledTimes(3);
  }, 20000);
});
