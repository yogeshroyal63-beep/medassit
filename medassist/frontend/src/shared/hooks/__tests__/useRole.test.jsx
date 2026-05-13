import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useRole } from "../useRole";

vi.mock("./useAuth");
import { useAuth } from "./useAuth";

describe("useRole", () => {
  it("returns null role when there is no user", () => {
    useAuth.mockReturnValue({ user: null });
    const { result } = renderHook(() => useRole());
    expect(result.current.role).toBeNull();
    expect(result.current.isPatient).toBe(false);
    expect(result.current.isDoctor).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns isPatient=true for a patient user", () => {
    useAuth.mockReturnValue({ user: { role: "patient" } });
    const { result } = renderHook(() => useRole());
    expect(result.current.isPatient).toBe(true);
    expect(result.current.isDoctor).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns isDoctor=true for a doctor user", () => {
    useAuth.mockReturnValue({ user: { role: "doctor" } });
    const { result } = renderHook(() => useRole());
    expect(result.current.isDoctor).toBe(true);
    expect(result.current.isPatient).toBe(false);
  });

  it("returns isAdmin=true for an admin user", () => {
    useAuth.mockReturnValue({ user: { role: "admin" } });
    const { result } = renderHook(() => useRole());
    expect(result.current.isAdmin).toBe(true);
  });

  it("exposes the raw role string", () => {
    useAuth.mockReturnValue({ user: { role: "doctor" } });
    const { result } = renderHook(() => useRole());
    expect(result.current.role).toBe("doctor");
  });
});
