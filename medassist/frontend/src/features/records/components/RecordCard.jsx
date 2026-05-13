import { formatDate } from "../../../shared/utils/helpers";
import { FileText, Trash2 } from "lucide-react";

const RecordCard = ({ record, onDelete }) => {
  if (!record) return null;
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "1rem 1.25rem", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "color-mix(in srgb, var(--brand-600) 10%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FileText size={18} color="#7c3aed" />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "13.5px", color: "var(--text)" }}>{record.title || "Medical Record"}</p>
          {record.type && <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{record.type}</p>}
          <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "var(--text-subtle)" }}>{formatDate(record.date || record.createdAt)}</p>
          {record.notes && <p style={{ margin: "6px 0 0", fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>{record.notes}</p>}
        </div>
      </div>
      {onDelete && (
        <button onClick={() => onDelete(record._id)}
          style={{ padding: "6px", borderRadius: "8px", background: "var(--badge-rose-bg, #fff1f2)", color: "var(--severity-high)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

export default RecordCard;
