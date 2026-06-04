import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateTime,
  capitalize,
  truncate,
  severityColor,
} from "../helpers";

describe("formatDate", () => {
  it("formats a valid ISO date string", () => {
    const result = formatDate("2024-01-15T10:00:00Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2024/);
  });

  it("returns — for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns — for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("returns stringified value for an invalid date", () => {
    const result = formatDate("not-a-date");
    expect(typeof result).toBe("string");
  });
});

describe("formatDateTime", () => {
  it("formats a valid datetime to include month and year", () => {
    const result = formatDateTime("2024-06-20T14:30:00Z");
    expect(typeof result).toBe("string");
    expect(result).toMatch(/2024/);
  });

  it("returns — for null", () => {
    expect(formatDateTime(null)).toBe("—");
  });

  it("returns — for undefined", () => {
    expect(formatDateTime(undefined)).toBe("—");
  });
});

describe("capitalize", () => {
  it("uppercases the first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("leaves an already-capitalized string unchanged", () => {
    expect(capitalize("World")).toBe("World");
  });

  it("returns empty string for empty input", () => {
    expect(capitalize("")).toBe("");
  });

  it("handles null gracefully", () => {
    expect(capitalize(null)).toBe("");
  });

  it("handles undefined gracefully", () => {
    expect(capitalize(undefined)).toBe("");
  });
});

describe("truncate", () => {
  it("truncates a string longer than max and appends ellipsis", () => {
    const result = truncate("Hello World, this is a test", 10);
    expect(result.endsWith("…")).toBe(true);
    expect(result.replace("…", "").length).toBeLessThanOrEqual(10);
  });

  it("leaves a string shorter than max untouched", () => {
    expect(truncate("Hi", 20)).toBe("Hi");
  });

  it("leaves a string exactly at max untouched", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });

  it("returns falsy for null without throwing", () => {
    expect(truncate(null, 10)).toBeFalsy();
  });
});

describe("severityColor", () => {
  it("returns red classes for emergency", () => {
    expect(severityColor("emergency")).toContain("red");
  });

  it("returns orange classes for urgent", () => {
    expect(severityColor("urgent")).toContain("orange");
  });

  it("returns yellow classes for moderate", () => {
    expect(severityColor("moderate")).toContain("yellow");
  });

  it("returns green classes for mild", () => {
    expect(severityColor("mild")).toContain("green");
  });

  it("is case-insensitive", () => {
    expect(severityColor("EMERGENCY")).toContain("red");
    expect(severityColor("Urgent")).toContain("orange");
  });

  it("returns slate classes for unknown severity", () => {
    expect(severityColor("unknown")).toContain("slate");
  });

  it("returns slate classes for null", () => {
    expect(severityColor(null)).toContain("slate");
  });

  it("returns slate classes for undefined", () => {
    expect(severityColor(undefined)).toContain("slate");
  });
});
