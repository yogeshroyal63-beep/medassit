import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doctorService } from "../doctor.service";
import Loader from "../../../shared/components/Loader";
import toast from "react-hot-toast";
import { ArrowLeft, Star, Briefcase, DollarSign } from "lucide-react";

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { doctorService.getById(id).then(setDoctor).catch(() => toast.error("Doctor not found")).finally(() => setLoading(false)); }, [id]);

  if (loading) return <Loader />;
  if (!doctor) return <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-subtle)" }}>Doctor not found.</div>;

  const d = doctor;
  return (
    <div style={{ maxWidth: "580px" }}>
      <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "13px", fontWeight: 600, marginBottom: "1.25rem", padding: 0 }}>
        <ArrowLeft size={15} /> Back
      </button>

      <div className="section-card">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, var(--brand-700), var(--brand-500))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "22px", flexShrink: 0 }}>
            {d.userId?.name?.charAt(0) || "D"}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: "1.2rem", fontFamily: "'Fraunces', serif", color: "var(--text)" }}>{d.userId?.name}</h1>
            <p style={{ margin: "2px 0", fontSize: "13px", color: "var(--brand-500)", fontWeight: 600 }}>{d.specialization}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-subtle)" }}>{d.hospital}</p>
            {d.rating > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                <Star size={13} color="#b45309" fill="#b45309" />
                <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#b45309" }}>{d.rating.toFixed(1)}</span>
                <span style={{ fontSize: "11.5px", color: "var(--text-subtle)" }}>({d.totalReviews} reviews)</span>
              </div>
            )}
          </div>
        </div>

        {d.bio && (
          <div style={{ marginBottom: "1.25rem" }}>
            <p style={{ margin: "0 0 0.4rem", fontSize: "11.5px", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>About</p>
            <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.6 }}>{d.bio}</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <div style={{ padding: "0.85rem 1rem", borderRadius: "10px", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Briefcase size={16} color="var(--brand-700)" />
            <div>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--text-subtle)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Experience</p>
              <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "var(--text)" }}>{d.experience} years</p>
            </div>
          </div>
          {d.consultationFee > 0 && (
            <div style={{ padding: "0.85rem 1rem", borderRadius: "10px", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px" }}>
              <DollarSign size={16} color="#059669" />
              <div>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--text-subtle)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Fee</p>
                <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "var(--text)" }}>₹{d.consultationFee}</p>
              </div>
            </div>
          )}
        </div>

        <button onClick={() => navigate(`/patient/appointments?doctorId=${d._id}`)} className="btn-primary" style={{ width: "100%", padding: "0.85rem" }}>
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default DoctorProfile;
