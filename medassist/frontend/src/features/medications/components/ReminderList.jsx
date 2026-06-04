import { formatDate } from "../../../shared/utils/helpers";
import toast from "react-hot-toast";
import { medicationService } from "../medication.service";
import { CheckCircle, Pill } from "lucide-react";

const ReminderList = ({ medications, onRefresh }) => {
  const handleTaken = async (id) => {
    try { await medicationService.markTaken(id); toast.success("Marked as taken"); onRefresh?.(); }
    catch { toast.error("Could not update medication"); }
  };

  if (!medications?.length) return (
    <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-subtle)", fontSize: "13px" }}>No active medications.</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {medications.map(m => (
        <div key={m._id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "1rem 1.25rem", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: m.takenToday ? "#f0fdf4" : "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Pill size={17} color={m.takenToday ? "#15803d" : "#b45309"} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "13.5px", color: "var(--text)" }}>{m.name}</p>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{m.dosage} · {m.frequency}</p>
              {m.endDate && <p style={{ margin: 0, fontSize: "11px", color: "var(--text-subtle)" }}>Until {formatDate(m.endDate)}</p>}
            </div>
          </div>
          <button onClick={() => handleTaken(m._id)} disabled={m.takenToday}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: m.takenToday ? "default" : "pointer", border: "none",
              background: m.takenToday ? "#dcfce7" : "var(--brand-700)",
              color: m.takenToday ? "#15803d" : "#fff",
              flexShrink: 0,
            }}>
            {m.takenToday ? <><CheckCircle size={13} /> Taken</> : "Mark Taken"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default ReminderList;
