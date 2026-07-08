import { useState } from "react";
import { Heart, Activity, Droplet, Wind, Thermometer, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { vitalsService } from "../vitals.service";
import { bpStatus, heartRateStatus, bloodSugarStatus, spo2Status, temperatureStatus, STATUS_COLORS } from "../utils/vitalRanges";

const StatusPill = ({ label }) => {
  if (!label) return null;
  const c = STATUS_COLORS[label] || STATUS_COLORS.Normal;
  return <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 9px", borderRadius: "100px", background: c.bg, color: c.color }}>{label}</span>;
};

const Row = ({ icon: Icon, label, value, unit, status }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={14} color="var(--text-muted)" />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{label}</p>
        <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "var(--text)" }}>
          {value != null ? `${value}${unit ? " " + unit : ""}` : "—"}
        </p>
      </div>
    </div>
    <StatusPill label={status} />
  </div>
);

const emptyForm = { systolic: "", diastolic: "", heartRate: "", bloodSugar: "", spo2: "", temperature: "" };

const TodaysVitals = ({ latest, onLogged }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== "").map(([k, v]) => [k, Number(v)]));
    if (!Object.keys(payload).length) { toast.error("Enter at least one reading"); return; }
    setSaving(true);
    try {
      await vitalsService.log(payload);
      toast.success("Vitals logged");
      setForm(emptyForm); setShowForm(false);
      onLogged?.();
    } catch { toast.error("Could not save vitals"); }
    finally { setSaving(false); }
  };

  return (
    <div className="section-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <p className="section-title" style={{ margin: 0 }}>Today's Vitals</p>
        <button onClick={() => setShowForm((v) => !v)} className="btn-secondary" style={{ padding: "5px 10px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
          {showForm ? <X size={13} /> : <Plus size={13} />} {showForm ? "Cancel" : "Log Vitals"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", padding: "0.75rem 0", borderBottom: "1px solid var(--border)", marginBottom: "0.25rem" }}>
          <div>
            <label className="form-label">Systolic (mmHg)</label>
            <input type="number" name="systolic" value={form.systolic} onChange={handleChange} className="input-ui" placeholder="120" />
          </div>
          <div>
            <label className="form-label">Diastolic (mmHg)</label>
            <input type="number" name="diastolic" value={form.diastolic} onChange={handleChange} className="input-ui" placeholder="80" />
          </div>
          <div>
            <label className="form-label">Heart Rate (bpm)</label>
            <input type="number" name="heartRate" value={form.heartRate} onChange={handleChange} className="input-ui" placeholder="72" />
          </div>
          <div>
            <label className="form-label">Blood Sugar (mg/dL)</label>
            <input type="number" name="bloodSugar" value={form.bloodSugar} onChange={handleChange} className="input-ui" placeholder="90" />
          </div>
          <div>
            <label className="form-label">SpO₂ (%)</label>
            <input type="number" name="spo2" value={form.spo2} onChange={handleChange} className="input-ui" placeholder="98" />
          </div>
          <div>
            <label className="form-label">Temperature (°C)</label>
            <input type="number" step="0.1" name="temperature" value={form.temperature} onChange={handleChange} className="input-ui" placeholder="36.6" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary" style={{ gridColumn: "1 / -1" }}>
            {saving ? "Saving…" : "Save Reading"}
          </button>
        </form>
      )}

      {latest ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Row icon={Heart}        label="Blood Pressure" value={latest.systolic && latest.diastolic ? `${latest.systolic}/${latest.diastolic}` : null} unit="mmHg" status={bpStatus(latest.systolic, latest.diastolic)} />
          <Row icon={Activity}     label="Heart Rate"      value={latest.heartRate}   unit="bpm"   status={heartRateStatus(latest.heartRate)} />
          <Row icon={Droplet}      label="Blood Sugar"     value={latest.bloodSugar}  unit="mg/dL" status={bloodSugarStatus(latest.bloodSugar)} />
          <Row icon={Wind}         label="SpO₂"            value={latest.spo2}        unit="%"     status={spo2Status(latest.spo2)} />
          <Row icon={Thermometer}  label="Temperature"     value={latest.temperature} unit="°C"    status={temperatureStatus(latest.temperature)} />
        </div>
      ) : (
        !showForm && <p style={{ fontSize: "13px", color: "var(--text-subtle)", padding: "0.5rem 0" }}>No vitals logged yet.</p>
      )}
    </div>
  );
};

export default TodaysVitals;
