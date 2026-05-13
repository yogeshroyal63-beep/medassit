import { useEffect, useState } from "react";
import api from "../../../shared/utils/api";
import { useAuth } from "../../../shared/hooks/useAuth";
import toast from "react-hot-toast";
import { Users, Calendar, Clock, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

const APPOINTMENTS_PER_PAGE = 6;

const ALLOWED_ACTIONS = {
  pending:   ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const ACTION_STYLE = {
  confirmed: { background: "var(--badge-teal-bg, #ccfbf1)", color: "#065f46" },
  completed: { background: "var(--badge-blue-bg, #dbeafe)", color: "#1e40af" },
  cancelled: { background: "var(--badge-rose-bg, #ffe4e6)", color: "#be123c" },
};

const ACTION_LABEL = {
  confirmed: "Confirm",
  completed: "Complete",
  cancelled:  "Cancel",
};

const STATUS_CLASS = {
  pending:   "badge-amber",
  confirmed: "badge-teal",
  completed: "badge-blue",
  cancelled: "badge-rose",
};

const DoctorPortal = () => {
  const { user }   = useAuth();
  const [doctorFee, setDoctorFee]             = useState(500);
  const [stats, setStats]                     = useState(null);
  const [appointments, setAppointments]       = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [busyAppointmentId, setBusyId]        = useState("");
  const [error, setError]                     = useState("");
  const [statusFilter, setStatusFilter]       = useState("ALL");
  const [currentPage, setCurrentPage]         = useState(1);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true); setError("");
    try {
      const [apptRes, profileRes] = await Promise.allSettled([
        api.get("/appointments/my"),
        api.get("/doctors/me"),
      ]);

      const allAppts = apptRes.status === "fulfilled" ? apptRes.value.data : [];
      const fee      = profileRes.status === "fulfilled" ? (profileRes.value.data?.consultationFee ?? 500) : 500;
      setDoctorFee(fee);
      setAppointments(allAppts);

      const today = new Date().toISOString().slice(0, 10);
      setStats({
        todayPatients:     allAppts.filter(a => a.date?.slice(0, 10) === today).length,
        totalAppointments: allAppts.length,
        pending:           allAppts.filter(a => a.status === "pending").length,
        revenue:           allAppts.filter(a => a.status === "completed").length * fee,
      });
    } catch { setError("Unable to load doctor dashboard."); }
    finally   { setLoading(false); }
  };

  const updateStatus = async (appointmentId, status) => {
    setBusyId(appointmentId);
    const prev = [...appointments];
    setAppointments(p => p.map(a => a._id === appointmentId ? { ...a, status } : a));
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status });
      toast.success(`Appointment ${status}`);
      await load();
    } catch {
      setAppointments(prev);
      toast.error("Unable to update appointment status");
    } finally { setBusyId(""); }
  };

  useEffect(() => { load().catch(() => null); }, [user?.id]);
  useEffect(() => { setCurrentPage(1); }, [statusFilter]);

  const filtered   = appointments.filter(a => statusFilter === "ALL" || a.status === statusFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / APPOINTMENTS_PER_PAGE));
  const paged      = filtered.slice((currentPage - 1) * APPOINTMENTS_PER_PAGE, currentPage * APPOINTMENTS_PER_PAGE);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  const statCards = [
    { label: "Today's Patients",    value: stats?.todayPatients ?? 0,     icon: Users,      color: "var(--brand-700)", bg: "color-mix(in srgb, var(--brand-700) 10%, transparent)" },
    { label: "Total Appointments",  value: stats?.totalAppointments ?? 0, icon: Calendar,   color: "#0f766e",          bg: "#f0fdfa" },
    { label: "Pending",             value: stats?.pending ?? 0,           icon: Clock,      color: "#b45309",          bg: "#fffbeb" },
    { label: "Revenue",             value: `₹${stats?.revenue ?? 0}`,    icon: TrendingUp, color: "#15803d",          bg: "#f0fdf4" },
  ];

  if (loading) return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: "88px", borderRadius: "12px", background: "var(--border)", animation: "pulse-ring 1.5s infinite" }} />)}
      </div>
      <div style={{ height: "300px", borderRadius: "14px", background: "var(--border)" }} />
    </div>
  );

  return (
    <div>
      {error && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: "var(--badge-rose-bg, #fff1f2)", border: "1px solid var(--border-strong)", color: "#be123c", fontSize: "13px", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {error}
          <button onClick={load} style={{ background: "none", border: "none", cursor: "pointer", color: "#be123c", fontWeight: 700, textDecoration: "underline" }}>Retry</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}><Icon size={18} color={color} aria-hidden="true" /></div>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
          </div>
        ))}
      </div>

      {/* Appointments table */}
      <div className="section-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 className="section-title" style={{ margin: 0 }}>Appointment Management</h3>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer" }}>
            <option value="ALL">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {paged.map(a => {
            const actions = ALLOWED_ACTIONS[a.status] || [];
            const patientName = a.patientId?.name || a.patientName || "Patient";
            const badgeClass = STATUS_CLASS[a.status] || "badge-slate";
            return (
              <div key={a._id} style={{ padding: "0.85rem 1rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--surface-elevated)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: "var(--text)" }}>{patientName}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{a.date} · {a.time}</p>
                  <span className={`badge ${badgeClass}`} style={{ textTransform: "capitalize", marginTop: "4px" }}>{a.status}</span>
                </div>
                {actions.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    {actions.map(action => (
                      <button
                        key={action}
                        onClick={() => updateStatus(a._id, action)}
                        disabled={busyAppointmentId === a._id}
                        aria-label={`${ACTION_LABEL[action]} appointment`}
                        style={{ padding: "4px 10px", borderRadius: "7px", border: "none", fontSize: "11.5px", fontWeight: 700, cursor: "pointer", ...ACTION_STYLE[action] }}
                      >
                        {ACTION_LABEL[action]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {!filtered.length && <p style={{ color: "var(--text-subtle)", fontSize: "13px" }}>No appointments found.</p>}
        </div>

        {filtered.length > APPOINTMENTS_PER_PAGE && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
            <button aria-label="Previous page" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{ padding: "4px 10px", borderRadius: "7px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", display: "flex" }}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{currentPage} / {totalPages}</span>
            <button aria-label="Next page" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{ padding: "4px 10px", borderRadius: "7px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", display: "flex" }}>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPortal;
