import SeverityBadge from "./SeverityBadge";

const TriageResultCard = ({ result }) => {
  if (!result) return null;
  const { status, top_condition, severity, advice, specialty, predictions = [], message, isEmergency, emergency_numbers, disclaimer } = result;

  const adviceText = typeof advice === "string" ? advice : advice ? [advice.action, advice.urgency, advice.home_care].filter(Boolean).join(" · ") : null;
  const specialtyText = typeof specialty === "string" ? specialty : specialty ? [specialty.primary, specialty.secondary].filter(Boolean).join(" / ") : null;
  const isEmergencyStatus = isEmergency || status === "emergency" || severity === "critical";

  if (isEmergencyStatus) return (
    <div style={{ padding: "1.5rem", borderRadius: "14px", border: "2px solid #fca5a5", background: "#fff1f2" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "1rem" }}>
        <span style={{ fontSize: "1.5rem" }}>🚨</span>
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: 700, color: "#991b1b" }}>Emergency Detected</h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#b91c1c" }}>{message || adviceText || "Seek immediate medical attention."}</p>
        </div>
      </div>
      {emergency_numbers && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: "#fee2e2", fontSize: "13px", color: "#991b1b" }}>
          <p style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Emergency Numbers</p>
          {Object.entries(emergency_numbers).map(([k, v]) => <p key={k} style={{ margin: "0 0 2px" }}><span style={{ fontWeight: 600 }}>{k}:</span> {v}</p>)}
        </div>
      )}
      {disclaimer && <p style={{ marginTop: "0.75rem", fontSize: "11px", color: "#ef4444", fontStyle: "italic" }}>{disclaimer}</p>}
    </div>
  );

  if (status && status !== "success") return (
    <div className="section-card">
      <p style={{ fontSize: "13.5px", color: "var(--text)" }}>{message || "Please consult a healthcare professional."}</p>
    </div>
  );

  return (
    <div className="section-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>Triage Result</h3>
        {severity && <SeverityBadge severity={severity} />}
      </div>
      {top_condition && (
        <div style={{ padding: "0.85rem 1rem", borderRadius: "10px", background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p style={{ margin: "0 0 3px", fontSize: "11px", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Most likely condition</p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>{top_condition}</p>
        </div>
      )}
      {specialtyText && (
        <div>
          <p style={{ margin: "0 0 3px", fontSize: "11px", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Recommended specialist</p>
          <p style={{ margin: 0, fontWeight: 600, fontSize: "13.5px", color: "var(--text)" }}>{specialtyText}</p>
        </div>
      )}
      {predictions.length > 1 && (
        <div>
          <p style={{ margin: "0 0 0.5rem", fontSize: "11px", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Other possibilities</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {predictions.slice(1).map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderRadius: "8px", background: "var(--surface)", fontSize: "13px" }}>
                <span style={{ color: "var(--text)" }}>{p.condition}</span>
                <span style={{ color: "var(--text-subtle)" }}>{Math.round((p.confidence || 0) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {adviceText && (
        <div style={{ padding: "0.85rem 1rem", borderRadius: "10px", background: "#eff6ff", border: "1px solid #bfdbfe" }}>
          <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "12px", color: "#1e40af" }}>Advice</p>
          <p style={{ margin: 0, fontSize: "13px", color: "#1e40af" }}>{adviceText}</p>
        </div>
      )}
      {disclaimer && <p style={{ margin: 0, fontSize: "11px", color: "var(--text-subtle)", fontStyle: "italic" }}>{disclaimer}</p>}
    </div>
  );
};

export default TriageResultCard;
