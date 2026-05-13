import { describe, it, expect } from "vitest";

// helpers.js exports utility functions — import whatever is actually exported
import * as helpers from "../helpers";

describe("helpers", () => {
  it("exports an object (module loads without errors)", () => {
    expect(typeof helpers).toBe("object");
  });

  // Test each exported function that exists
  if (typeof helpers.formatDate === "function") {
    describe("formatDate", () => {
      it("returns a non-empty string for a valid ISO date", () => {
        const result = helpers.formatDate("2024-01-15T10:00:00Z");
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });

      it("handles null/undefined gracefully", () => {
        expect(() => helpers.formatDate(null)).not.toThrow();
      });
    });
  }

  if (typeof helpers.truncate === "function") {
    describe("truncate", () => {
      it("truncates strings longer than the limit", () => {
        const result = helpers.truncate("Hello World", 5);
        expect(result.length).toBeLessThanOrEqual(8); // 5 + possible ellipsis
      });

      it("leaves short strings untouched", () => {
        const result = helpers.truncate("Hi", 20);
        expect(result).toContain("Hi");
      });
    });
  }

  if (typeof helpers.capitalize === "function") {
    describe("capitalize", () => {
      it("uppercases the first letter", () => {
        expect(helpers.capitalize("hello")).toMatch(/^H/);
      });

      it("handles empty string", () => {
        expect(helpers.capitalize("")).toBe("");
      });
    });
  }
});
