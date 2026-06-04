import { useState } from "react";
import SymptomForm from "../components/SymptomForm";
import TriageResultCard from "../components/TriageResultCard";
import { triageService } from "../triage.service";
import toast from "react-hot-toast";
import { Activity } from "lucide-react";

const SmartCheck = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const handleSubmit = async ({ symptoms, age }) => {
    setLoading(true); setResult(null);
    try {
      const data = await triageService.analyze(symptoms, age);
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Triage failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg, #eff6ff, #dbeafe)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={20} color="#1d4ed8" />
          </div>
          <h1 className="page-title">Smart Symptom Check</h1>
        </div>
        <p className="page-subtitle">Describe your symptoms and get an AI-powered triage assessment. This is not a substitute for professional medical advice.</p>
        {result?.inference_mode === "rule-based-fallback" && (
          <div style={{ padding: "0.6rem 0.85rem", borderRadius: "9px", background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", fontSize: "12px", fontWeight: 500 }}>
            ⚠ Running in rule-based mode — BERT model not yet trained. Results are based on keyword matching.
          </div>
        )}
      </div>

      {/* Form card */}
      <div className="section-card" style={{ marginBottom: "1.25rem" }}>
        <SymptomForm onSubmit={handleSubmit} loading={loading} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="section-card" style={{ marginBottom: "1.25rem" }}>
          <p style={{ marginBottom: "0.5rem", fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Analysing your symptoms…</p>
          <div style={{ height: "6px", borderRadius: "100px", background: "var(--surface)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "60%", borderRadius: "100px", background: "linear-gradient(90deg, var(--brand-700), var(--brand-500))", animation: "pulse-ring 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      )}

      {result && <TriageResultCard result={result} />}
    </div>
  );
};

export default SmartCheck;
