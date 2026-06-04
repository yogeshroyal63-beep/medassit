import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../shared/utils/api";
import { useAuth } from "../../../shared/hooks/useAuth";
import { Activity, Search, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const DOCTORS_PER_PAGE = 4;
const APPOINTMENTS_PER_PAGE = 5;

const PatientPortal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [triageResult, setTriageResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // No localStorage — plain component state only
  const [doctorQuery, setDoctorQuery] = useState("");
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("ALL");
  const [doctorPage, setDoctorPage] = useState(1);
  const [appointmentPage, setAppointmentPage] = useState(1);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true); setError("");
    try {
      const [doctorsRes, appointmentsRes] = await Promise.all([api.get("/doctors"), api.get("/appointments/my")]);
      setDoctors(doctorsRes.data);
      setAppointments(appointmentsRes.data);
    } catch { setError("Failed to load patient dashboard data."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load().catch(() => null); }, [user?.id]);

  const runTriage = async () => {
    if (!symptoms.trim()) { toast.error("Please enter symptoms first"); return; }
    try {
      const payload = { symptoms: symptoms.trim() };
      // Fix: age !== "" handles age=0 correctly (truthy check would skip 0)
      if (age !== "") payload.age = Number(age);
      const { data } = await api.post("/triage", payload);
      setTriageResult(data);
      toast.success("Triage completed");
    } catch { toast.error("Unable to run symptom check"); }
  };

  const filteredDoctors = doctors.filter(d => {
    const q = doctorQuery.toLowerCase();
    return (d.userId?.name || "").toLowerCase().includes(q) || (d.specialization || "").toLowerCase().includes(q);
  });
  const filteredAppointments = appointments.filter(a => appointmentStatusFilter === "ALL" ? true : a.status === appointmentStatusFilter);
  const totalDoctorPages = Math.max(1, Math.ceil(filteredDoctors.length / DOCTORS_PER_PAGE));
  const totalAppointmentPages = Math.max(1, Math.ceil(filteredAppointments.length / APPOINTMENTS_PER_PAGE));
  const doctorsPageSlice = filteredDoctors.slice((doctorPage - 1) * DOCTORS_PER_PAGE, doctorPage * DOCTORS_PER_PAGE);
  const appointmentsPageSlice = filteredAppointments.slice((appointmentPage - 1) * APPOINTMENTS_PER_PAGE, appointmentPage * APPOINTMENTS_PER_PAGE);

  useEffect(() => { setDoctorPage(1); }, [doctorQuery]);
  useEffect(() => { setAppointmentPage(1); }, [appointmentStatusFilter]);
  useEffect(() => { if (doctorPage > totalDoctorPages) setDoctorPage(totalDoctorPages); }, [doctorPage, totalDoctorPages]);
  useEffect(() => { if (appointmentPage > totalAppointmentPages) setAppointmentPage(totalAppointmentPages); }, [appointmentPage, totalAppointmentPages]);

  const statusColors = { pending: "badge-amber", confirmed: "badge-teal", completed: "badge-blue", cancelled: "badge-rose" };

  if (loading) return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {[1,2,3].map(i => <div key={i} style={{ height: "140px", borderRadius: "14px", background: "var(--border)", animation: "pulse 1.5s infinite" }} />)}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {error && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", fontSize: "13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {error}
          <button onClick={load} style={{ background: "none", border: "none", color: "#be123c", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Retry</button>
        </div>
      )}

      {/* Smart Symptom Check */}
      <div className="section-card">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.35rem" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--brand-50)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={16} color="var(--brand-700)" />
          </div>
          <h2 className="section-title" style={{ margin: 0 }}>Smart Symptom Check</h2>
        </div>
        <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "1rem" }}>Decision-support only. This tool does not provide diagnosis.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 110px", gap: "0.75rem", alignItems: "end" }}>
          <div>
            <label className="form-label">Symptoms</label>
            <input value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="fever, cough, headache" className="input-ui" />
          </div>
          <div>
            <label className="form-label">Age</label>
            <input value={age} onChange={e => setAge(e.target.value)} placeholder="Age" className="input-ui" />
          </div>
          <button onClick={runTriage} className="btn-primary" style={{ height: "40px" }}>Analyze</button>
        </div>
        {triageResult && (
          <div style={{ marginTop: "1rem", padding: "1rem", borderRadius: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: "13px" }}>
            {triageResult.degraded && (
              <div style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", marginBottom: "0.75rem", fontSize: "12px" }}>
                AI engine fallback mode is active. Use clinical judgment for urgent symptoms.
              </div>
            )}
            <div style={{ display: "grid", gap: "0.4rem" }}>
              <p style={{ margin: 0 }}><span style={{ fontWeight: 700 }}>Severity:</span> {triageResult.severity || "N/A"}</p>
              {/* Fix: use advice.action (correct field) instead of non-existent .recommendation */}
              <p style={{ margin: 0 }}><span style={{ fontWeight: 700 }}>Recommended Action:</span> {triageResult.advice?.action || triageResult.message || "Consult a healthcare professional"}</p>
              {/* Fix: use predictions[] (correct field) instead of non-existent .insights */}
              {(triageResult.predictions || []).map(item => (
                <p key={item.condition} style={{ margin: 0, color: "var(--text-muted)" }}>
                  • {item.condition} ({Math.round(item.confidence * 100)}% confidence)
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Find Doctor */}
      <div className="section-card">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.35rem" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Search size={16} color="var(--medical-green, #059669)" />
          </div>
          <h2 className="section-title" style={{ margin: 0 }}>Find Doctor</h2>
        </div>
        <input value={doctorQuery} onChange={e => setDoctorQuery(e.target.value)} placeholder="Search by name or specialty" className="input-ui" style={{ marginBottom: "1rem", marginTop: "0.5rem" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
          {doctorsPageSlice.map(d => (
            <div key={d._id} style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--surface-elevated)" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, var(--brand-700), var(--brand-500))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "14px", marginBottom: "0.6rem" }}>
                {d.userId?.name?.[0] || "D"}
              </div>
              <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>{d.userId?.name}</p>
              <p style={{ margin: "0 0 2px", fontSize: "12px", color: "var(--text-muted)" }}>{d.specialization}</p>
              <p style={{ margin: "0 0 0.75rem", fontSize: "11px", color: "var(--text-subtle)" }}>{d.hospital || "Hospital unavailable"}</p>
              {/* Fix: navigate to FindDoctor for booking to avoid hardcoded time '10:30' causing 409 double-booking */}
              <button
                onClick={() => navigate(`/patient/find-doctor?doctorId=${d._id}`)}
                className="btn-primary"
                style={{ width: "100%", padding: "0.5rem", fontSize: "12px" }}
              >
                Book Appointment
              </button>
            </div>
          ))}
          {!filteredDoctors.length && <p style={{ color: "var(--text-subtle)", fontSize: "13px" }}>No doctors matched current filters.</p>}
        </div>
        {filteredDoctors.length > DOCTORS_PER_PAGE && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
            <button onClick={() => setDoctorPage(p => Math.max(1, p - 1))} style={{ padding: "4px 10px", borderRadius: "7px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer" }}><ChevronLeft size={14} /></button>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{doctorPage} / {totalDoctorPages}</span>
            <button onClick={() => setDoctorPage(p => Math.min(totalDoctorPages, p + 1))} style={{ padding: "4px 10px", borderRadius: "7px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer" }}><ChevronRight size={14} /></button>
          </div>
        )}
      </div>

      {/* Appointments */}
      <div className="section-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={16} color="var(--brand-700)" />
            </div>
            <h2 className="section-title" style={{ margin: 0 }}>Appointment History</h2>
          </div>
          <select value={appointmentStatusFilter} onChange={e => setAppointmentStatusFilter(e.target.value)}
            style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface)", fontSize: "12px", color: "var(--text-muted)", cursor: "pointer" }}>
            <option value="ALL">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {appointmentsPageSlice.map(a => (
            <div key={a._id} className="data-row">
              <span style={{ fontSize: "13px", fontWeight: 500 }}>{a.date} · {a.time}</span>
              <span className={`badge ${statusColors[a.status] || "badge-slate"}`}>{a.status}</span>
            </div>
          ))}
          {!filteredAppointments.length && <p style={{ color: "var(--text-subtle)", fontSize: "13px" }}>No appointments yet.</p>}
        </div>
        {filteredAppointments.length > APPOINTMENTS_PER_PAGE && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
            <button onClick={() => setAppointmentPage(p => Math.max(1, p - 1))} style={{ padding: "4px 10px", borderRadius: "7px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer" }}><ChevronLeft size={14} /></button>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{appointmentPage} / {totalAppointmentPages}</span>
            <button onClick={() => setAppointmentPage(p => Math.min(totalAppointmentPages, p + 1))} style={{ padding: "4px 10px", borderRadius: "7px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer" }}><ChevronRight size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientPortal;
