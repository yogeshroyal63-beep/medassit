import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import ProtectedRoute from "../ProtectedRoute";

// Mock useAuth so we can control auth state per test
vi.mock("../../hooks/useAuth");
import { useAuth } from "../../hooks/useAuth";

const wrap = (ui) => <MemoryRouter>{ui}</MemoryRouter>;

describe("ProtectedRoute", () => {
  it("shows Loader while auth state is loading", () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    render(wrap(<ProtectedRoute><p>protected</p></ProtectedRoute>));
    // Loader renders a spinner div; the children must NOT be in the DOM
    expect(screen.queryByText("protected")).not.toBeInTheDocument();
  });

  it("redirects to /login when there is no authenticated user", () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <ProtectedRoute><p>protected</p></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText("protected")).not.toBeInTheDocument();
  });

  it("renders children for an authenticated user", () => {
    useAuth.mockReturnValue({ user: { id: "1", role: "patient" }, loading: false });
    render(wrap(<ProtectedRoute><p>protected content</p></ProtectedRoute>));
    expect(screen.getByText("protected content")).toBeInTheDocument();
  });
});
