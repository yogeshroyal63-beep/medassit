import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { warmUpServices, _resetWarmupThrottle } from "../warmup";

describe("warmUpServices", () => {
  beforeEach(() => {
    _resetWarmupThrottle();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("pings /warmup once", () => {
    expect(warmUpServices()).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toMatch(/\/warmup$/);
    expect(fetch.mock.calls[0][1]).toMatchObject({ method: "GET", cache: "no-store" });
  });

  it("is throttled so typing does not spam the server", () => {
    warmUpServices();
    warmUpServices();
    warmUpServices();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("never throws when the network fails", async () => {
    fetch.mockRejectedValue(new Error("offline"));
    expect(() => warmUpServices()).not.toThrow();
    await Promise.resolve();
  });

  it("never throws when fetch itself throws synchronously", () => {
    fetch.mockImplementation(() => { throw new Error("boom"); });
    expect(() => warmUpServices()).not.toThrow();
  });

  it("also wakes the AI service in parallel when VITE_AI_WAKE_URL is set", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_AI_WAKE_URL", "https://ai.example.com/");
    const mod = await import("../warmup");
    mod._resetWarmupThrottle();
    mod.warmUpServices();
    const urls = fetch.mock.calls.map((c) => c[0]);
    expect(urls.some((u) => u.endsWith("/warmup"))).toBe(true);
    expect(urls).toContain("https://ai.example.com/health");
    const aiCall = fetch.mock.calls.find((c) => c[0].includes("ai.example.com"));
    expect(aiCall[1]).toMatchObject({ mode: "no-cors" });
    vi.unstubAllEnvs();
  });
});
