import { useEffect, useState } from "react";
import MedicationForm from "../components/MedicationForm";
import Loader from "../../../shared/components/Loader";
import { medicationService } from "../medication.service";
import { formatDate } from "../../../shared/utils/helpers";
import toast from "react-hot-toast";
import { Pill, Plus, X } from "lucide-react";

const Medications = () => {
  const [meds, setMeds]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);

  const load = () => medicationService.list().then(setMeds).catch(() => toast.error("Failed to load medications")).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleAdd = async (data) => {
    setSaving(true);
    try { await medicationService.add(data); toast.success("Medication added"); setShowForm(false); load(); }
    catch { toast.error("Could not add medication"); }
    finally { setSaving(false); }
  };

  const handleRemove = async (id) => {
    try { await medicationService.remove(id); toast.success("Medication removed"); setMeds(prev => prev.filter(m => m._id !== id)); }
    catch { toast.error("Could not remove medication"); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f0fdfa", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Pill size={18} color="#0f766e" />
          </div>
          <div>
            <h1 className="page-title">Medications</h1>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{meds.length} active medication{meds.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(v => !v)} className={showForm ? "btn-secondary" : "btn-primary"} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0.6rem 1.1rem" }}>
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Medication</>}
        </button>
      </div>

      {showForm && (
        <div className="section-card" style={{ marginBottom: "1.25rem" }}>
          <h3 className="section-title">New Medication</h3>
          <MedicationForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} loading={saving} />
        </div>
      )}

      {loading ? <Loader /> : meds.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-subtle)", fontSize: "14px" }}>No medications added yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {meds.map(m => (
            <div key={m._id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "1rem 1.25rem", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f0fdfa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Pill size={18} color="#0f766e" />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "13.5px", color: "var(--text)" }}>{m.name}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{m.dosage} · {m.frequency}</p>
                  {m.prescribedBy && <p style={{ margin: 0, fontSize: "11.5px", color: "var(--text-subtle)" }}>By {m.prescribedBy}</p>}
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-subtle)" }}>
                    {formatDate(m.startDate)}{m.endDate ? ` → ${formatDate(m.endDate)}` : ""}
                  </p>
                </div>
              </div>
              <button onClick={() => handleRemove(m._id)}
                style={{ padding: "5px 12px", borderRadius: "8px", background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", fontSize: "12px", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Medications;
