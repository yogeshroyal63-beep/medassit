import { useEffect, useState } from "react";
import api from "../../../shared/utils/api";
import toast from "react-hot-toast";
import { Users, Stethoscope, Calendar, Activity, ChevronLeft, ChevronRight } from "lucide-react";

const LOGS_PER_PAGE = 8;

const AdminPortal = () => {
  const [stats, setStats]               = useState({});
  const [pending, setPending]           = useState([]);
  const [triageLogs, setTriageLogs]     = useState([]);
  const [apptLogs, setApptLogs]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [busyDoctorId, setBusyDoctorId] = useState("");
  const [error, setError]               = useState("");
  const [pendingQuery, setPendingQuery] = useState("");
  const [logPage, setLogPage] = useState(1);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [s, p, l] = await Promise.all([api.get("/admin/stats"), api.get("/admin/doctors/pending"), api.get("/admin/audit-logs")]);
      setStats(s.data || {});
      setPending(Array.isArray(p.data) ? p.data : []);
      const ld = l.data || {};
      setTriageLogs(Array.isArray(ld.triages) ? ld.triages : []);
      setApptLogs(Array.isArray(ld.appointments) ? ld.appointments : []);
    } catch { setError("Failed to load admin dashboard data."); }
    finally { setLoading(false); }
  };

  const approveDoctor = async (profileId) => {
    setBusyDoctorId(profileId);
    const prev = [...pending];
    setPending(p => p.filter(d => d._id !== profileId));
    try { await api.patch(`/admin/doctors/${profileId}/approve`); toast.success("Doctor approved successfully"); }
    catch { setPending(prev); toast.error("Unable to approve doctor"); }
    finally { setBusyDoctorId(""); }
  };

  const rejectDoctor = async (profileId) => {
    const note = window.prompt("Add rejection note (optional):", "");
    setBusyDoctorId(profileId);
    const prev = [...pending];
    setPending(p => p.filter(d => d._id !== profileId));
    try { await api.patch(`/admin/doctors/${profileId}/reject`, { reason: note || "" }); toast.success("Doctor rejected"); }
    catch { setPending(prev); toast.error("Unable to reject doctor"); }
    finally { setBusyDoctorId(""); }
  };

  useEffect(() => { load().catch(() => null); }, []);

  const allLogs = [
    ...triageLogs.map(l => ({ ...l, _type: "triage" })),
    ...apptLogs.map(l => ({ ...l, _type: "appointment" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalLogPages = Math.max(1, Math.ceil(allLogs.length / LOGS_PER_PAGE));
  const pagedLogs = allLogs.slice((logPage - 1) * LOGS_PER_PAGE, logPage * LOGS_PER_PAGE);
  useEffect(() => { if (logPage > totalLogPages) setLogPage(totalLogPages); }, [logPage, totalLogPages]);

  const filteredPending = pending.filter(d => {
    const q = pendingQuery.toLowerCase();
    return (d.userId?.name || "").toLowerCase().includes(q) || (d.specialization || "").toLowerCase().includes(q);
  });

  const statCards = [
    { label: "Patients", value: stats.totalPatients ?? 0, icon: Users, color: "var(--brand-700)", bg: "#eff6ff" },
    { label: "Doctors", value: stats.totalDoctors ?? 0, icon: Stethoscope, color: "#0f766e", bg: "#f0fdfa" },
    { label: "Appointments", value: stats.totalAppointments ?? 0, icon: Calendar, color: "var(--brand-600)", bg: "#f5f3ff" },
    { label: "Triage Sessions", value: stats.totalTriageSessions ?? 0, icon: Activity, color: "#b45309", bg: "#fffbeb" },
  ];

  if (loading) return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: "88px", borderRadius: "12px", background: "var(--border)" }} />)}
      </div>
      <div style={{ height: "300px", borderRadius: "14px", background: "var(--border)" }} />
    </div>
  );

  return (
    <div>
      {error && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: "var(--badge-rose-bg, #fff1f2)", border: "1px solid #fecdd3", color: "#be123c", fontSize: "13px", marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
          {error} <button onClick={load} style={{ background: "none", border: "none", cursor: "pointer", color: "#be123c", fontWeight: 700, textDecoration: "underline" }}>Retry</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}><Icon size={18} color={color} /></div>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
          </div>
        ))}
      </div>

      {/* Doctor Approvals */}
      <div className="section-card" style={{ marginBottom: "1.5rem" }}>
        <h3 className="section-title">Doctor Approvals
          {filteredPending.length > 0 && <span style={{ marginLeft: "8px", padding: "1px 8px", borderRadius: "100px", background: "#fef3c7", color: "#b45309", fontSize: "11px", fontWeight: 700 }}>{filteredPending.length} pending</span>}
        </h3>
        <input value={pendingQuery} onChange={e => setPendingQuery(e.target.value)}
          placeholder="Search by name or specialization…" className="input-ui" style={{ marginBottom: "1rem" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {filteredPending.map(d => (
            <div key={d._id} style={{ padding: "0.85rem 1rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--surface-elevated)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, var(--brand-700), var(--brand-500))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "14px", flexShrink: 0 }}>
                  {d.userId?.name?.[0] || "D"}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>{d.userId?.name || "Unknown"}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{d.specialization || "—"} · {d.hospital || ""}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-subtle)" }}>{d.userId?.email || ""}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                <button onClick={() => approveDoctor(d._id)} disabled={busyDoctorId === d._id}
                  style={{ padding: "5px 12px", borderRadius: "8px", background: "var(--badge-teal-bg, #ecfdf5)", color: "#065f46", border: "1px solid #bbf7d0", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Approve</button>
                <button onClick={() => rejectDoctor(d._id)} disabled={busyDoctorId === d._id}
                  style={{ padding: "5px 12px", borderRadius: "8px", background: "var(--badge-rose-bg, #fff1f2)", color: "#be123c", border: "1px solid #fecdd3", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Reject</button>
              </div>
            </div>
          ))}
          {!filteredPending.length && <p style={{ color: "var(--text-subtle)", fontSize: "13px" }}>No pending approvals.</p>}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="section-card">
        <h3 className="section-title">Audit Logs</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {pagedLogs.map(l => (
            <div key={l._id} style={{ padding: "0.7rem 0.85rem", borderRadius: "9px", border: "1px solid var(--border)", background: "var(--surface-elevated)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", fontSize: "12.5px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ padding: "2px 8px", borderRadius: "100px", fontSize: "11px", fontWeight: 700,
                  background: l._type === "triage" ? "#ecfeff" : "#f5f3ff",
                  color: l._type === "triage" ? "#0e7490" : "#6d28d9" }}>
                  {l._type}
                </span>
                {l._type === "triage"
                  ? `Severity: ${l.severity || "—"} · ${l.topCondition || "—"}`
                  : `Status: ${l.status || "—"} · ${l.type || "—"}`}
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-subtle)", whiteSpace: "nowrap" }}>
                {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ""}
              </span>
            </div>
          ))}
          {!allLogs.length && <p style={{ color: "var(--text-subtle)", fontSize: "13px" }}>No audit events available.</p>}
        </div>
        {allLogs.length > LOGS_PER_PAGE && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
            <button onClick={() => setLogPage(p => Math.max(1, p - 1))} style={{ padding: "4px 10px", borderRadius: "7px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer" }}><ChevronLeft size={14} /></button>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{logPage} / {totalLogPages}</span>
            <button onClick={() => setLogPage(p => Math.min(totalLogPages, p + 1))} style={{ padding: "4px 10px", borderRadius: "7px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer" }}><ChevronRight size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
