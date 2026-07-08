import { useState, useEffect, useRef } from "react";
import SymptomWizard from "../components/SymptomWizard";
import TriageResultCard from "../components/TriageResultCard";
import { triageService } from "../triage.service";
import toast from "react-hot-toast";
import { Activity, Coffee, RotateCcw } from "lucide-react";

// Loading copy escalates the longer we wait — most requests resolve well
// before the "waking up" tier, which only shows up after a real cold start.
const LOADING_TIERS = [
  { after: 0,     text: "Analysing your symptoms…" },
  { after: 4000,  text: "Still working — this is taking a bit longer than usual…" },
  { after: 10000, text: "Our AI service is waking up after being idle. This can take up to a minute on the first check." },
];

const SmartCheck = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (loading) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 500), 500);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading]);

  const loadingTier = [...LOADING_TIERS].reverse().find((t) => elapsed >= t.after) || LOADING_TIERS[0];
  const isWaking = elapsed >= LOADING_TIERS[2].after;

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

      {/* Wizard — hidden once analysis starts/completes */}
      {!loading && !result && (
        <SymptomWizard onAnalyze={handleSubmit} loading={loading} />
      )}

      {/* Loading */}
      {loading && (
        <div className="section-card" style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
            {isWaking && <Coffee size={14} color="var(--brand-500)" />}
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>{loadingTier.text}</p>
          </div>
          <div style={{ height: "6px", borderRadius: "100px", background: "var(--surface)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "60%", borderRadius: "100px", background: "linear-gradient(90deg, var(--brand-700), var(--brand-500))", animation: "pulse-ring 1.5s ease-in-out infinite" }} />
          </div>
          {isWaking && (
            <p style={{ margin: "0.6rem 0 0", fontSize: "11.5px", color: "var(--text-subtle)" }}>
              No need to refresh or resubmit — it'll come through.
            </p>
          )}
        </div>
      )}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <TriageResultCard result={result} />
          <button onClick={() => setResult(null)} className="btn-secondary" style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px" }}>
            <RotateCcw size={14} /> Start Over
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartCheck;
