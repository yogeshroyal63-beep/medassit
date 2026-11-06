import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("../model.service", () => ({
  modelService: { info: vi.fn(), explain: vi.fn() },
}));

import { modelService } from "../model.service";
import ModelCard from "../pages/ModelCard";

const card = {
  name: "MedAssist symptom triage",
  version: "2.0",
  summary: "Hybrid triage assistant.",
  architecture: ["Validation", "Emergency rules", "BioBERT"],
  training_data: { source: "Synthetic text", note: "No real patient data." },
  metrics: null,
  intended_use: "Educational demo.",
  limitations: ["Synthetic training data"],
  safety: ["Emergency rules run first"],
};

const renderPage = () => render(<MemoryRouter><ModelCard /></MemoryRouter>);

beforeEach(() => vi.clearAllMocks());

describe("ModelCard", () => {
  it("shows 'evaluation pending' and never invents numbers when metrics are null", async () => {
    modelService.info.mockResolvedValue({ card, runtime: { state: "ready", mode: "bert", loadSeconds: 11.2 } });
    renderPage();
    expect(await screen.findByText(/Evaluation pending/i)).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByText(/model load 11.2s/)).toBeInTheDocument();
    expect(screen.queryByText(/%$/)).toBeNull();
  });

  it("renders real metrics when present", async () => {
    const metrics = {
      evaluated_on: "2026-11-06", n_classes: 60,
      splits: [{ name: "Held-out symptom combinations", accuracy: 0.8123, macro_f1: 0.79, top3: 0.93, n: 5000 }],
      baselines: [{ name: "TF-IDF + Logistic Regression", accuracy: 0.7, macro_f1: 0.68 }],
      calibration: { ece: 0.041, selective: [{ coverage: 0.9, accuracy: 0.88 }] },
      emergency_rules: { recall: 0.95, precision: 0.9, n_pos: 40, n_neg: 40 },
      latency_ms: { cpu: 52, gpu: 9 },
    };
    modelService.info.mockResolvedValue({ card: { ...card, metrics }, runtime: { state: "ready", mode: "bert" } });
    renderPage();
    expect(await screen.findByText("Held-out symptom combinations")).toBeInTheDocument();
    expect(screen.getByText("81.2%")).toBeInTheDocument();
    expect(screen.getByText("TF-IDF + Logistic Regression")).toBeInTheDocument();
    expect(screen.getByText(/recall 95.0%/)).toBeInTheDocument();
  });

  it("shows the waking state while the AI service boots", async () => {
    modelService.info.mockResolvedValue({ card, runtime: { state: "waking" } });
    renderPage();
    expect(await screen.findByText("Waking the AI service")).toBeInTheDocument();
  });

  it("keeps the page usable if the backend is still waking up", async () => {
    modelService.info.mockRejectedValue(new Error("network"));
    renderPage();
    expect(await screen.findByText(/backend is waking up/i)).toBeInTheDocument();
  });

  it("explains a prediction and highlights words by importance", async () => {
    modelService.info.mockResolvedValue({ card, runtime: { state: "ready", mode: "bert" } });
    modelService.explain.mockResolvedValue({
      status: "success", mode: "bert", top_condition: "CommonCold", confidence: 0.91, severity: "low",
      specialty: { primary: "General Physician" },
      predictions: [{ condition: "CommonCold", confidence: 0.91 }, { condition: "Flu", confidence: 0.06 }],
      tokens: [{ word: "runny", importance: 1, drop: 0.5 }, { word: "today", importance: 0, drop: 0 }],
      occlusion_passes: 3, latency_ms: 40, runtime: { state: "ready", mode: "bert" },
    });
    renderPage();
    await screen.findByText(/Evaluation pending/i);
    await userEvent.type(screen.getByLabelText("Symptom description"), "runny nose today");
    await userEvent.click(screen.getByRole("button", { name: "Explain" }));
    expect(await screen.findByText("91.0% confidence")).toBeInTheDocument();
    const hot = screen.getByText("runny");
    expect(hot.style.background).toContain("rgba(14, 165, 183");
    expect(modelService.explain).toHaveBeenCalledWith("runny nose today");
  });

  it("shows a friendly message on 503 (cold start)", async () => {
    modelService.info.mockResolvedValue({ card, runtime: { state: "waking" } });
    modelService.explain.mockRejectedValue({ response: { status: 503 } });
    renderPage();
    await screen.findByText(/Evaluation pending/i);
    await userEvent.type(screen.getByLabelText("Symptom description"), "fever and cough");
    await userEvent.click(screen.getByRole("button", { name: "Explain" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/waking up/i);
  });

  it("renders the emergency state with matched words highlighted", async () => {
    modelService.info.mockResolvedValue({ card, runtime: { state: "ready", mode: "bert" } });
    modelService.explain.mockResolvedValue({
      status: "emergency", mode: "rules", message: "Emergency pattern detected by the rule engine.",
      matched_rules: ["chest pain"], predictions: [],
      tokens: [{ word: "chest", importance: 1, drop: null }, { word: "pain", importance: 1, drop: null }],
    });
    renderPage();
    await screen.findByText(/Evaluation pending/i);
    await userEvent.type(screen.getByLabelText("Symptom description"), "chest pain and sweating");
    await userEvent.click(screen.getByRole("button", { name: "Explain" }));
    expect(await screen.findByText("Emergency pattern detected")).toBeInTheDocument();
  });
});
