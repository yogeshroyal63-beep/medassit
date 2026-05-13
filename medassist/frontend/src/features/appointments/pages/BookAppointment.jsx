import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SlotSelector from "../components/SlotSelector";
import Loader from "../../../shared/components/Loader";
import { appointmentService } from "../appointment.service";
import { doctorService } from "../../doctors/doctor.service";
import toast from "react-hot-toast";
import { Calendar } from "lucide-react";

const BookAppointment = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const [doctor, setDoctor]   = useState(null);
  const [date, setDate]       = useState("");
  const [time, setTime]       = useState("");
  const [type, setType]       = useState("in-person");
  const [notes, setNotes]     = useState("");
  const [loading, setLoading] = useState(!!doctorId);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    doctorService.getById(doctorId).then(data => setDoctor(data)).catch(() => toast.error("Doctor not found")).finally(() => setLoading(false));
  }, [doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) return toast.error("Please select a date and time slot");
    setSubmitting(true);
    try {
      await appointmentService.book({ doctorId, date, time, type, notes });
      toast.success("Appointment booked successfully");
      navigate("/patient/appointments");
    } catch (err) { toast.error(err.response?.data?.message || "Booking failed"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ maxWidth: "520px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.4rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Calendar size={18} color="#7c3aed" />
          </div>
          <h1 className="page-title">Book Appointment</h1>
        </div>
        <p className="page-subtitle">Schedule a consultation with your doctor</p>
      </div>

      {doctor && (
        <div style={{ padding: "1rem 1.25rem", borderRadius: "12px", background: "var(--brand-50)", border: "1px solid var(--brand-100)", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, var(--brand-700), var(--brand-500))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "15px", flexShrink: 0 }}>
            {doctor.userId?.name?.charAt(0) || "D"}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "13.5px", color: "var(--brand-700)" }}>{doctor.userId?.name}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--brand-500)" }}>{doctor.specialization} · {doctor.hospital}</p>
          </div>
        </div>
      )}

      <div className="section-card">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label className="form-label">Date</label>
            <input type="date" value={date} min={new Date().toISOString().slice(0,10)} onChange={e => setDate(e.target.value)} className="input-ui" required />
          </div>
          <div>
            <label className="form-label">Time Slot</label>
            <SlotSelector selected={time} onChange={setTime} />
          </div>
          <div>
            <label className="form-label">Consultation Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="input-ui">
              <option value="in-person">In Person</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <label className="form-label">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="input-ui" style={{ resize: "none" }} placeholder="Describe your concern briefly…" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary" style={{ width: "100%", padding: "0.85rem" }}>
            {submitting ? "Booking…" : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
