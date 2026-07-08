import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../shared/utils/api";
import { useAuth } from "../../../shared/hooks/useAuth";
import { Activity, Search, Stethoscope, Pill, FileText, CalendarCheck, ArrowRight } from "lucide-react";
import { vitalsService } from "../vitals.service";
import HealthMetricsChart from "../components/HealthMetricsChart";
import TodaysVitals from "../components/TodaysVitals";

const StatCard = ({ icon: Icon, value, label, trend, tint }) => (
  <div className="glass-card fade-up" style={{ borderRadius: "1rem", padding: "1.1rem 1.25rem" }}>
    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: tint.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.85rem" }}>
      <Icon size={16} color={tint.fg} />
    </div>
    <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", fontFamily: "'Fraunces', serif" }}>{value}</p>
    <p style={{ margin: "2px 0 0", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
    {trend && <p style={{ margin: "4px 0 0", fontSize: "11.5px", color: "var(--brand-600, #0e8a99)", fontWeight: 600 }}>{trend}</p>}
  </div>
);

const QuickAction = ({ icon: Icon, label, tint, onClick }) => (
  <button
    onClick={onClick}
    className="quick-action-btn"
    style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
      padding: "1.35rem 0.75rem", borderRadius: "0.9rem", border: "none",
      background: "var(--surface-elevated)", cursor: "pointer",
      transition: "transform 0.15s, box-shadow 0.15s",
    }}
  >
    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: tint.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={20} color={tint.fg} />
    </div>
    <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)", textAlign: "center", lineHeight: 1.2 }}>{label}</span>
  </button>
);

const statusColors = { pending: "badge-amber", confirmed: "badge-teal", completed: "badge-blue", cancelled: "badge-rose" };

const PatientPortal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [lastTriage, setLastTriage] = useState(null);
  const [vitalsLatest, setVitalsLatest] = useState(null);
  const [vitalsTrend, setVitalsTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileChecked, setProfileChecked] = useState(false);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true); setError("");
    try {
      const [doctorsRes, appointmentsRes, meRes, triageRes, vitalsLatestRes, vitalsTrendRes] = await Promise.all([
        api.get("/doctors"),
        api.get("/appointments/my"),
        api.get("/users/me"),
        api.get("/triage/history").catch(() => ({ data: [] })),
        vitalsService.latest().catch(() => null),
        vitalsService.trend(6).catch(() => []),
      ]);
      setDoctors(doctorsRes.data);
      setAppointments(appointmentsRes.data?.data ?? []);
      const history = Array.isArray(triageRes.data) ? triageRes.data : [];
      if (history.length) setLastTriage(history[0]);
      setVitalsLatest(vitalsLatestRes);
      setVitalsTrend(Array.isArray(vitalsTrendRes) ? vitalsTrendRes : []);

      // First-login nudge: send patients with an empty medical profile to
      // fill it in before they land on the dashboard, so it doesn't get skipped.
      const profile = meRes.data?.profile || {};
      const isIncomplete = !profile.phone && !profile.age && !profile.gender;
      if (isIncomplete) {
        toast("Please complete your profile to get started", { icon: "\ud83d\udccb" });
        navigate("/patient/profile");
        return;
      }
      setProfileChecked(true);
    } catch { setError("Failed to load patient dashboard data."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load().catch(() => null); }, [user?.id]);

  const reloadVitals = async () => {
    const [latestRes, trendRes] = await Promise.all([vitalsService.latest().catch(() => null), vitalsService.trend(6).catch(() => [])]);
    setVitalsLatest(latestRes);
    setVitalsTrend(Array.isArray(trendRes) ? trendRes : []);
  };

  if (loading || !profileChecked) return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {[1,2,3].map(i => <div key={i} style={{ height: "140px", borderRadius: "14px", background: "var(--border)", animation: "pulse 1.5s infinite" }} />)}
    </div>
  );

  const upcoming = appointments
    .filter(a => ["pending", "confirmed"].includes(a.status))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const completedCount = appointments.filter(a => a.status === "completed").length;
  const firstName = (user?.name || "there").split(" ")[0];

  const nextApptTrend = upcoming.length
    ? (() => {
        const days = Math.ceil((new Date(upcoming[0].date) - new Date()) / (1000 * 60 * 60 * 24));
        return days <= 0 ? "Today" : days === 1 ? "Next in 1 day" : `Next in ${days} days`;
      })()
    : null;
  const lastTriageTrend = lastTriage
    ? new Date(lastTriage.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h2 style={{ margin: 0, fontSize: "1.6rem", fontFamily: "'Fraunces', serif", color: "var(--text)" }}>
          Welcome back, {firstName}
        </h2>
        <p style={{ margin: "0.2rem 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
          Here's an overview of your care today.
        </p>
      </div>

      <div className="stat-grid" style={{ marginBottom: 0 }}>
        <StatCard icon={CalendarCheck} value={upcoming.length}    label="Upcoming Appts"     trend={nextApptTrend} tint={{ bg: "rgba(14,165,183,0.12)", fg: "var(--brand-500)" }} />
        <StatCard icon={Stethoscope}   value={doctors.length}     label="Doctors Available"  tint={{ bg: "rgba(59,130,246,0.12)", fg: "#3b82f6" }} />
        <StatCard icon={FileText}      value={completedCount}     label="Completed Visits"   tint={{ bg: "rgba(16,185,129,0.12)", fg: "#10b981" }} />
        <StatCard icon={Activity}      value={lastTriage ? lastTriageTrend : "\u2014"} label="Last Symptom Check" tint={{ bg: "rgba(168,85,247,0.12)", fg: "#a855f7" }} />
      </div>

      {error && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", fontSize: "13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {error}
          <button onClick={load} style={{ background: "none", border: "none", color: "#be123c", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Retry</button>
        </div>
      )}

      {/* Row 2 — Health Metrics chart + Today's Vitals */}
      <div className="dashboard-grid">
        <HealthMetricsChart data={vitalsTrend} />
        <TodaysVitals latest={vitalsLatest} onLogged={reloadVitals} />
      </div>

      {/* Row 3 — Upcoming appointments preview + Quick Actions / Profile */}
      <div className="dashboard-grid">
        <div className="section-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Schedule</p>
              <p style={{ margin: "2px 0 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", fontFamily: "'Fraunces', serif" }}>Upcoming Appointments</p>
            </div>
            <button onClick={() => navigate("/patient/appointments")} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "var(--brand-600, #0e8a99)", fontWeight: 600, fontSize: "12.5px", cursor: "pointer" }}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {upcoming.slice(0, 3).map(a => (
              <div key={a._id} className="data-row">
                <div>
                  <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "var(--text)" }}>{a.doctorId?.userId?.name ? `Dr. ${a.doctorId.userId.name}` : "Doctor"}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{a.doctorId?.specialization || ""} {a.doctorId?.specialization ? "\u00b7 " : ""}{new Date(a.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} at {a.time}</p>
                </div>
                <span className={`badge ${statusColors[a.status] || "badge-slate"}`}>{a.status}</span>
              </div>
            ))}
            {!upcoming.length && <p style={{ color: "var(--text-subtle)", fontSize: "13px" }}>No upcoming appointments.</p>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="section-card">
            <p className="section-title">Quick Actions</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <QuickAction icon={Activity}      label="Smart Check"    tint={{ bg: "rgba(14,165,183,0.14)", fg: "var(--brand-500)" }} onClick={() => navigate("/patient/symptom-check")} />
              <QuickAction icon={Search}        label="Find Doctor"    tint={{ bg: "rgba(59,130,246,0.14)", fg: "#3b82f6" }}         onClick={() => navigate("/patient/find-doctor")} />
              <QuickAction icon={Pill}          label="Medications"    tint={{ bg: "rgba(245,158,11,0.14)", fg: "#f59e0b" }}         onClick={() => navigate("/patient/medications")} />
              <QuickAction icon={FileText}      label="Health Records" tint={{ bg: "rgba(168,85,247,0.14)", fg: "#a855f7" }}         onClick={() => navigate("/patient/records")} />
            </div>
          </div>

          <div className="section-card" style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <p className="section-title" style={{ marginBottom: 0 }}>Your Profile</p>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0 }}>
              Keep your medical details up to date so doctors have accurate context during visits.
            </p>
            <button onClick={() => navigate("/patient/profile")} className="btn-secondary" style={{ marginTop: "0.25rem" }}>
              View / Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPortal;
