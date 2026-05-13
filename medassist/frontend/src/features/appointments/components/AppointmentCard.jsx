import { formatDate } from "../../../shared/utils/helpers";
import { Calendar } from "lucide-react";

const STATUS_CLASS = {
  pending:   "badge-amber",
  confirmed: "badge-teal",
  completed: "badge-blue",
  cancelled: "badge-rose",
};

const AppointmentCard = ({ appointment, onCancel }) => {
  const a = appointment;
  const badgeClass = STATUS_CLASS[a.status] || "badge-slate";

  return (
    <div className="data-row" style={{ borderRadius: "14px", padding: "1.1rem 1.25rem", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "color-mix(in srgb, var(--brand-700) 12%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Calendar size={18} color="var(--brand-700)" />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "13.5px", color: "var(--text)" }}>
            {a.doctorId?.userId?.name
              ? `Dr. ${a.doctorId.userId.name}`
              : a.doctorName
              ? `Dr. ${a.doctorName}`
              : "Doctor"}
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>
            {formatDate(a.date)} · {a.time}
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--text-subtle)", textTransform: "capitalize" }}>
            {a.type}{a.notes ? ` · ${a.notes}` : ""}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
        <span className={`badge ${badgeClass}`} style={{ textTransform: "capitalize" }}>
          {a.status}
        </span>
        {onCancel && a.status === "pending" && (
          <button
            onClick={() => onCancel(a._id)}
            className="badge badge-rose"
            style={{ cursor: "pointer", border: "none", padding: "4px 10px" }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
