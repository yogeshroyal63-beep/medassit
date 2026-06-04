import { useNavigate } from "react-router-dom";

const DoctorCard = ({ doctor, onBook }) => {
  const navigate = useNavigate();
  const d = doctor;
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "1.25rem", boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg, var(--brand-700), var(--brand-500))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "16px", flexShrink: 0 }}>
            {d.userId?.name?.charAt(0) || "D"}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "13.5px", color: "var(--text)" }}>{d.userId?.name}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--brand-500)", fontWeight: 600 }}>{d.specialization}</p>
            <p style={{ margin: 0, fontSize: "11.5px", color: "var(--text-subtle)" }}>{d.hospital}</p>
          </div>
        </div>
        {d.rating > 0 && (
          <span style={{ padding: "2px 8px", borderRadius: "100px", background: "#fef3c7", color: "#b45309", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" }}>
            ★ {d.rating.toFixed(1)}
          </span>
        )}
      </div>
      {d.bio && <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{d.bio}</p>}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
        <button onClick={() => navigate(`/doctors/${d._id}`)} className="btn-secondary" style={{ flex: 1, padding: "0.55rem", fontSize: "12px" }}>
          View Profile
        </button>
        {onBook && (
          <button onClick={() => onBook(d._id)} className="btn-primary" style={{ flex: 1, padding: "0.55rem", fontSize: "12px" }}>
            Book
          </button>
        )}
      </div>
    </div>
  );
};

export default DoctorCard;
