import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import RoleGuard from "../RoleGuard";

vi.mock("../../hooks/useAuth");
import { useAuth } from "../../hooks/useAuth";

const wrap = (ui) => <MemoryRouter>{ui}</MemoryRouter>;

describe("RoleGuard", () => {
  it("shows Loader while auth is loading", () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    const { container } = render(wrap(<RoleGuard role="doctor"><p>doctor area</p></RoleGuard>));
    expect(screen.queryByText("doctor area")).not.toBeInTheDocument();
    // Spinner div should be present
    expect(container.querySelector("div > div")).toBeInTheDocument();
  });

  it("redirects when user has the wrong role", () => {
    useAuth.mockReturnValue({ user: { role: "patient" }, loading: false });
    render(wrap(<RoleGuard role="doctor"><p>doctor area</p></RoleGuard>));
    expect(screen.queryByText("doctor area")).not.toBeInTheDocument();
  });

  it("redirects when there is no user", () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    render(wrap(<RoleGuard role="admin"><p>admin area</p></RoleGuard>));
    expect(screen.queryByText("admin area")).not.toBeInTheDocument();
  });

  it("renders children when user has the correct role", () => {
    useAuth.mockReturnValue({ user: { role: "doctor" }, loading: false });
    render(wrap(<RoleGuard role="doctor"><p>doctor area</p></RoleGuard>));
    expect(screen.getByText("doctor area")).toBeInTheDocument();
  });
});
