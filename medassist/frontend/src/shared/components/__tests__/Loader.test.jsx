import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Loader from "../Loader";

describe("Loader", () => {
  it("renders the spinner element", () => {
    const { container } = render(<Loader />);
    // The spinner is the div with the spin animation style
    const spinner = container.querySelector("div > div");
    expect(spinner).toBeInTheDocument();
  });

  it("renders the label when provided", () => {
    render(<Loader label="Loading data…" />);
    expect(screen.getByText("Loading data…")).toBeInTheDocument();
  });

  it("does not render a label paragraph when label is omitted", () => {
    const { container } = render(<Loader />);
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });
});
