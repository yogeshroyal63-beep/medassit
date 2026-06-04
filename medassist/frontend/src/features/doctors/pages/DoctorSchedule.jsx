import { useEffect, useState } from "react";
import api from "../../../shared/utils/api";
import { formatDate } from "../../../shared/utils/helpers";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekDates(baseDate) {
  const d    = new Date(baseDate);
  const day  = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

const STATUS_CLASS = {
  pending:   "badge-amber",
  confirmed: "badge-teal",
  completed: "badge-blue",
  cancelled: "badge-rose",
};

const DoctorSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [weekBase, setWeekBase]         = useState(new Date());

  useEffect(() => {
    api.get("/appointments/my")
      .then(r => setAppointments(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const week    = getWeekDates(weekBase);
  const today   = isoDate(new Date());

  const apptMap = {};
  appointments.forEach(a => {
    const key = a.date?.slice(0, 10);
    if (!key) return;
    if (!apptMap[key]) apptMap[key] = [];
    apptMap[key].push(a);
  });

  const prevWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); };
  const nextWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); };
  const goToday  = () => setWeekBase(new Date());

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "color-mix(in srgb, var(--brand-700) 10%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CalendarDays size={18} color="var(--brand-700)" />
        </div>
        <div>
          <h1 className="page-title">Schedule</h1>
          <p className="page-subtitle">Weekly view of your appointments</p>
        </div>
      </div>

      {/* Week navigator */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <button onClick={prevWeek} aria-label="Previous week" style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", display: "flex" }}>
          <ChevronLeft size={14} />
        </button>
        <button onClick={goToday} style={{ padding: "5px 14px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
          Today
        </button>
        <button onClick={nextWeek} aria-label="Next week" style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", display: "flex" }}>
          <ChevronRight size={14} />
        </button>
        <span style={{ fontSize: "13px", color: "var(--text-muted)", marginLeft: "4px" }}>
          {formatDate(week[0])} – {formatDate(week[6])}
        </span>
      </div>

      {/* Week grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "0.5rem" }}>
        {week.map((date, i) => {
          const key       = isoDate(date);
          const isToday   = key === today;
          const dayAppts  = apptMap[key] || [];
          return (
            <div key={key} style={{
              borderRadius: "10px",
              border: `1px solid ${isToday ? "var(--brand-500)" : "var(--border)"}`,
              background: isToday ? "color-mix(in srgb, var(--brand-500) 6%, var(--card))" : "var(--card)",
              minHeight: "120px",
              overflow: "hidden",
            }}>
              {/* Day header */}
              <div style={{
                padding: "6px 8px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}>
                <span style={{ fontSize: "10px", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {DAYS[date.getDay()]}
                </span>
                <span style={{
                  fontSize: "16px", fontWeight: isToday ? 700 : 400,
                  color: isToday ? "var(--brand-700)" : "var(--text)",
                  lineHeight: 1.2,
                }}>
                  {date.getDate()}
                </span>
              </div>

              {/* Appointments */}
              <div style={{ padding: "4px" }}>
                {loading
                  ? <div style={{ height: "20px", borderRadius: "4px", background: "var(--border)", margin: "4px" }} />
                  : dayAppts.map(a => (
                    <div key={a._id} style={{ marginBottom: "3px" }}>
                      <span className={`badge ${STATUS_CLASS[a.status] || "badge-slate"}`} style={{ fontSize: "10px", padding: "1px 5px", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {a.time} {a.patientId?.name || a.patientName || "Patient"}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
        {[["badge-amber","Pending"],["badge-teal","Confirmed"],["badge-blue","Completed"],["badge-rose","Cancelled"]].map(([cls, label]) => (
          <div key={cls} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span className={`badge ${cls}`} style={{ fontSize: "10px", padding: "1px 7px" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorSchedule;
