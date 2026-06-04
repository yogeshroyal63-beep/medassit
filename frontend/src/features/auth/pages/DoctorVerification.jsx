import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../shared/utils/api";
import toast from "react-hot-toast";
import { Heart, Upload } from "lucide-react";

const DoctorVerification = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ licenseNumber: "", specialization: "", experience: "", hospital: "", bio: "" });
  const [files, setFiles] = useState({ license: null, governmentId: null });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile   = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.license || !files.governmentId) return toast.error("Please upload both license and government ID documents");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("license", files.license);
      fd.append("governmentId", files.governmentId);
      await api.post("/doctors/register", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Verification submitted — pending admin review");
      navigate("/doctor/pending");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "600px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg, var(--brand-700), var(--brand-500))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart size={15} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--brand-700)", fontFamily: "'Fraunces', serif" }}>MedAssist</span>
          </div>
          <h1 style={{ fontSize: "1.6rem", fontFamily: "'Fraunces', serif", color: "var(--text)", marginBottom: "0.3rem" }}>Doctor Verification</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Submit your credentials for admin review. Approval typically takes 24–48 hours.</p>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "2rem", boxShadow: "var(--shadow)" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="form-label">License Number</label>
                <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} className="input-ui" required placeholder="MCI-XXXXX" />
              </div>
              <div>
                <label className="form-label">Specialization</label>
                <input name="specialization" value={form.specialization} onChange={handleChange} className="input-ui" required placeholder="e.g. Cardiology" />
              </div>
              <div>
                <label className="form-label">Years of Experience</label>
                <input type="number" min="0" name="experience" value={form.experience} onChange={handleChange} className="input-ui" required placeholder="e.g. 8" />
              </div>
              <div>
                <label className="form-label">Hospital / Clinic</label>
                <input name="hospital" value={form.hospital} onChange={handleChange} className="input-ui" required placeholder="Apollo Hospital, Mumbai" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Bio (optional)</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} className="input-ui" style={{ resize: "none" }} placeholder="Brief professional summary…" />
              </div>

              {/* File uploads */}
              {[
                { name: "license", label: "Medical License Document" },
                { name: "governmentId", label: "Government ID" },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="form-label">{label}</label>
                  <label style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "0.65rem 0.9rem", borderRadius: "0.75rem",
                    border: `1.5px dashed ${files[name] ? "var(--brand-500)" : "var(--border-strong)"}`,
                    background: files[name] ? "var(--brand-50)" : "var(--surface)",
                    cursor: "pointer", fontSize: "12.5px",
                    color: files[name] ? "var(--brand-700)" : "var(--text-muted)",
                    transition: "all 0.15s",
                  }}>
                    <Upload size={14} />
                    {files[name] ? files[name].name : `Upload ${label}`}
                    <input type="file" name={name} accept=".pdf,.jpg,.png" onChange={handleFile} required style={{ display: "none" }} />
                  </label>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1.5rem", padding: "0.85rem 1rem", borderRadius: "10px", background: "#eff6ff", border: "1px solid #bfdbfe", fontSize: "12px", color: "#1e40af" }}>
              ℹ All documents are encrypted and reviewed only by MedAssist admin staff.
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", marginTop: "1.25rem", padding: "0.85rem" }}>
              {loading ? "Submitting…" : "Submit for Verification"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorVerification;
