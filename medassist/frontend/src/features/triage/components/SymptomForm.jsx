import { useState } from "react";
import Loader from "../../../shared/components/Loader";

const SymptomForm = ({ onSubmit, loading }) => {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    onSubmit({ symptoms: symptoms.trim(), age: age ? Number(age) : null });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <label className="form-label">Describe your symptoms</label>
        <textarea
          rows={4} value={symptoms} onChange={e => setSymptoms(e.target.value)}
          placeholder="e.g. I have had a headache and mild fever for the past two days…"
          className="input-ui" maxLength={1000} required
          style={{ resize: "none" }}
        />
        <p style={{ marginTop: "4px", fontSize: "11px", color: "var(--text-subtle)" }}>{symptoms.length}/1000 characters</p>
      </div>
      <div>
        <label className="form-label">Age (optional)</label>
        <input type="number" min={1} max={120} value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 34" className="input-ui" style={{ maxWidth: "120px" }} />
      </div>
      <button type="submit" disabled={loading || !symptoms.trim()} className="btn-primary" style={{ alignSelf: "flex-start", padding: "0.75rem 1.75rem" }}>
        {loading ? "Analysing…" : "Analyse Symptoms"}
      </button>
    </form>
  );
};

export default SymptomForm;
