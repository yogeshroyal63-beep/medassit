import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

const SUGGESTED_SYMPTOMS = ["Headache", "Chest pain", "Shortness of breath", "Fatigue", "Fever", "Nausea"];
const DURATIONS = ["< 24 hours", "1–3 days", "4–7 days", "> 1 week"];
const EXTRA_SYMPTOMS = ["Nausea", "Dizziness", "Fatigue", "Shortness of breath", "Fever", "Headache", "Chest tightness", "Sweating"];
const STEP_LABELS = ["Symptom", "Duration", "Severity", "Details"];

/**
 * Multi-step intake wizard. Collects everything the Figma design calls for
 * (main symptom, duration, self-reported severity, extra symptoms, age) and
 * folds it into a single descriptive string for the real /triage endpoint —
 * the actual severity shown afterwards comes from the AI service's response,
 * not from the self-reported slider here (that's just useful context).
 */
const SymptomWizard = ({ onAnalyze, loading }) => {
  const [step, setStep] = useState(0);
  const [symptom, setSymptom] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState(0);
  const [extras, setExtras] = useState([]);
  const [age, setAge] = useState("");

  const toggleExtra = (s) => setExtras((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleAnalyze = () => {
    const parts = [symptom];
    if (duration) parts.push(`for ${duration}`);
    if (severity) parts.push(`self-rated severity ${severity}/10`);
    if (extras.length) parts.push(`also experiencing ${extras.join(", ")}`);
    const composedSymptoms = parts.join(", ");
    onAnalyze({ symptoms: composedSymptoms, age: age ? Number(age) : null });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Stepper */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {STEP_LABELS.map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1 }}>
            <div style={{
              width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 700,
              background: step > i ? "var(--brand-500)" : step === i ? "rgba(14,165,183,0.15)" : "var(--muted)",
              color: step > i ? "#fff" : step === i ? "var(--brand-700)" : "var(--text-subtle)",
              border: step === i ? "2px solid var(--brand-500)" : "none",
            }}>
              {step > i ? <Check size={12} /> : i + 1}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ flex: 1, height: "2px", borderRadius: "2px", background: step > i ? "var(--brand-500)" : "var(--border)" }} />
            )}
          </div>
        ))}
      </div>

      <div className="section-card">
        {/* Step 0 — Main symptom */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Step 1 of 4</p>
              <h2 style={{ margin: "4px 0 0", fontSize: "1.4rem", fontFamily: "'Fraunces', serif", color: "var(--text)" }}>What's your main symptom?</h2>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>Describe your primary concern clearly.</p>
            </div>
            <input
              value={symptom} onChange={(e) => setSymptom(e.target.value)}
              placeholder="e.g. persistent headache, chest tightness…"
              className="input-ui"
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {SUGGESTED_SYMPTOMS.map((s) => (
                <button key={s} onClick={() => setSymptom(s)} type="button"
                  style={{
                    padding: "6px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: 600,
                    border: `1px solid ${symptom === s ? "var(--brand-500)" : "var(--border)"}`,
                    background: symptom === s ? "var(--brand-500)" : "transparent",
                    color: symptom === s ? "#fff" : "var(--text-muted)", cursor: "pointer",
                  }}>{s}</button>
              ))}
            </div>
            <button onClick={() => setStep(1)} disabled={!symptom.trim()} className="btn-primary"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              Continue <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* Step 1 — Duration */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Step 2 of 4</p>
              <h2 style={{ margin: "4px 0 0", fontSize: "1.4rem", fontFamily: "'Fraunces', serif", color: "var(--text)" }}>How long have you had this?</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {DURATIONS.map((d) => (
                <button key={d} onClick={() => setDuration(d)} type="button"
                  style={{
                    padding: "1rem", borderRadius: "10px", fontSize: "13px", fontWeight: 600, textAlign: "left",
                    border: `1px solid ${duration === d ? "var(--brand-500)" : "var(--border)"}`,
                    background: duration === d ? "var(--brand-50)" : "transparent",
                    color: duration === d ? "var(--brand-700)" : "var(--text)", cursor: "pointer",
                  }}>{d}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setStep(0)} type="button" className="btn-secondary" style={{ flex: 1 }}>Back</button>
              <button onClick={() => setStep(2)} disabled={!duration} className="btn-primary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                Continue <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Self-reported severity */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Step 3 of 4</p>
              <h2 style={{ margin: "4px 0 0", fontSize: "1.4rem", fontFamily: "'Fraunces', serif", color: "var(--text)" }}>How severe is it right now?</h2>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>1 = barely noticeable, 10 = worst you've felt. This helps give context — the AI still determines the final severity.</p>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setSeverity(n)} type="button"
                  style={{
                    flex: 1, height: "36px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer",
                    background: severity === n ? "var(--brand-500)" : severity > 0 && n <= severity ? "rgba(14,165,183,0.18)" : "var(--muted)",
                    color: severity === n ? "#fff" : severity > 0 && n <= severity ? "var(--brand-700)" : "var(--text-subtle)",
                  }}>{n}</button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-subtle)" }}>
              <span>Mild</span><span>Moderate</span><span>Severe</span>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setStep(1)} type="button" className="btn-secondary" style={{ flex: 1 }}>Back</button>
              <button onClick={() => setStep(3)} disabled={!severity} className="btn-primary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                Continue <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Extra symptoms + age, then Analyze */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Step 4 of 4</p>
              <h2 style={{ margin: "4px 0 0", fontSize: "1.4rem", fontFamily: "'Fraunces', serif", color: "var(--text)" }}>Any other symptoms?</h2>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>Select all that apply.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              {EXTRA_SYMPTOMS.map((s) => {
                const on = extras.includes(s);
                return (
                  <button key={s} onClick={() => toggleExtra(s)} type="button"
                    style={{
                      display: "flex", alignItems: "center", gap: "8px", padding: "0.7rem", borderRadius: "10px",
                      fontSize: "13px", fontWeight: 500, textAlign: "left", cursor: "pointer",
                      border: `1px solid ${on ? "var(--brand-500)" : "var(--border)"}`,
                      background: on ? "var(--brand-50)" : "transparent",
                      color: on ? "var(--brand-700)" : "var(--text)",
                    }}>
                    <span style={{
                      width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
                      border: `1px solid ${on ? "var(--brand-500)" : "var(--text-subtle)"}`,
                      background: on ? "var(--brand-500)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {on && <Check size={10} color="#fff" />}
                    </span>
                    {s}
                  </button>
                );
              })}
            </div>
            <div>
              <label className="form-label">Age (optional)</label>
              <input type="number" min={1} max={120} value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 34" className="input-ui" style={{ maxWidth: "120px" }} />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setStep(2)} type="button" className="btn-secondary" style={{ flex: 1 }}>Back</button>
              <button onClick={handleAnalyze} disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                {loading ? "Analysing…" : "Analyze Symptoms"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomWizard;
