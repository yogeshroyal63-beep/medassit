import { useEffect, useState } from "react";
import AppointmentCard from "../components/AppointmentCard";
import Loader from "../../../shared/components/Loader";
import { appointmentService } from "../appointment.service";
import toast from "react-hot-toast";
import { Calendar } from "lucide-react";

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => appointmentService.myAppointments().then(setAppointments).catch(() => toast.error("Failed to load appointments")).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    try { await appointmentService.cancel(id); toast.success("Appointment cancelled"); load(); }
    catch { toast.error("Could not cancel appointment"); }
  };

  return (
    <div style={{ maxWidth: "680px" }}>
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Calendar size={18} color="#7c3aed" />
        </div>
        <div>
          <h1 className="page-title">Appointment History</h1>
          <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-muted)" }}>All your scheduled and past consultations</p>
        </div>
      </div>
      {loading ? <Loader /> : appointments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-subtle)", fontSize: "14px" }}>No appointments found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {appointments.map(a => <AppointmentCard key={a._id} appointment={a} onCancel={handleCancel} />)}
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;
