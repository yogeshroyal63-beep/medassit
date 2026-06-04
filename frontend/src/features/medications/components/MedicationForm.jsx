import { useState } from "react";

const EMPTY = { name: "", dosage: "", frequency: "", startDate: "", endDate: "", instructions: "", prescribedBy: "" };

const MedicationForm = ({ initial = {}, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
      <div style={{ gridColumn: "1/-1" }}>
        <label className="form-label">Medication Name</label>
        <input name="name" value={form.name} onChange={handleChange} className="input-ui" required />
      </div>
      <div>
        <label className="form-label">Dosage</label>
        <input name="dosage" value={form.dosage} onChange={handleChange} placeholder="e.g. 500mg" className="input-ui" required />
      </div>
      <div>
        <label className="form-label">Frequency</label>
        <input name="frequency" value={form.frequency} onChange={handleChange} placeholder="e.g. Twice daily" className="input-ui" required />
      </div>
      <div>
        <label className="form-label">Start Date</label>
        <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="input-ui" required />
      </div>
      <div>
        <label className="form-label">End Date (optional)</label>
        <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="input-ui" />
      </div>
      <div>
        <label className="form-label">Prescribed By</label>
        <input name="prescribedBy" value={form.prescribedBy} onChange={handleChange} className="input-ui" />
      </div>
      <div style={{ gridColumn: "1/-1" }}>
        <label className="form-label">Instructions</label>
        <textarea name="instructions" value={form.instructions} onChange={handleChange} rows={2} className="input-ui" style={{ resize: "none" }} />
      </div>
      <div style={{ gridColumn: "1/-1", display: "flex", gap: "0.75rem" }}>
        <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: "0.75rem" }}>
          {loading ? "Saving…" : "Save"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary" style={{ flex: 1, padding: "0.75rem" }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default MedicationForm;
