import { useEffect, useState } from "react";
import api from "../../../shared/utils/api";
import { formatDate } from "../../../shared/utils/helpers";
import { Users, Search } from "lucide-react";

const PatientList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [query, setQuery]               = useState("");

  useEffect(() => {
    api.get("/appointments/my")
      .then(r => setAppointments(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Deduplicate patients by patientId
  const seen    = new Set();
  const patients = appointments
    .filter(a => {
      const id = a.patientId?._id || a.patientId;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map(a => ({
      id:       a.patientId?._id || a.patientId,
      name:     a.patientId?.name || a.patientName || "Patient",
      email:    a.patientId?.email || "",
      lastSeen: a.date,
      status:   a.status,
    }))
    .filter(p =>
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.email.toLowerCase().includes(query.toLowerCase())
    );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "color-mix(in srgb, var(--brand-700) 10%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Users size={18} color="var(--brand-700)" />
        </div>
        <div>
          <h1 className="page-title">My Patients</h1>
          <p className="page-subtitle">Patients you have seen or have upcoming appointments with</p>
        </div>
      </div>

      <div className="section-card">
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} aria-hidden="true" />
          <input
            className="input-ui"
            style={{ paddingLeft: "2.25rem" }}
            placeholder="Search by name or email…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {[1,2,3].map(i => <div key={i} style={{ height: "60px", borderRadius: "10px", background: "var(--border)", animation: "pulse-ring 1.5s infinite" }} />)}
          </div>
        ) : patients.length === 0 ? (
          <p style={{ color: "var(--text-subtle)", fontSize: "13px", textAlign: "center", padding: "2rem 0" }}>
            {query ? "No patients match your search." : "No patients yet."}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {patients.map(p => (
              <div key={p.id} style={{
                padding: "0.85rem 1rem", borderRadius: "10px",
                border: "1px solid var(--border)", background: "var(--surface-elevated)",
                display: "flex", alignItems: "center", gap: "12px",
              }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "50%",
                  background: "color-mix(in srgb, var(--brand-700) 12%, transparent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "14px", color: "var(--brand-700)", flexShrink: 0,
                }}>
                  {p.name[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}
                  </p>
                  {p.email && (
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{p.email}</p>
                  )}
                </div>
                {p.lastSeen && (
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)", whiteSpace: "nowrap", flexShrink: 0 }}>
                    Last: {formatDate(p.lastSeen)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;
