import { useEffect, useState } from "react";
import { useAuth } from "../../../shared/hooks/useAuth";
import api from "../../../shared/utils/api";
import toast from "react-hot-toast";
import { User } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", age: "", gender: "", bloodGroup: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    api.get("/users/me")
      .then(({ data }) => setForm({ name: data.user?.name || "", phone: data.profile?.phone || "", age: data.profile?.age || "", gender: data.profile?.gender || "", bloodGroup: data.profile?.bloodGroup || "", address: data.profile?.address || "" }))
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.put("/users/me", form); toast.success("Profile updated"); }
    catch { toast.error("Could not save profile"); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ height: "200px", borderRadius: "14px", background: "var(--border)" }} />;

  return (
    <div style={{ maxWidth: "560px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <User size={18} color="#1d4ed8" />
        </div>
        <h1 className="page-title">My Profile</h1>
      </div>

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", padding: "1.25rem", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, var(--brand-700), var(--brand-500))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "20px" }}>
          {form.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>{form.name || "User"}</p>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{user?.email}</p>
          <span style={{ padding: "2px 8px", borderRadius: "100px", background: "var(--brand-50)", color: "var(--brand-700)", fontSize: "11px", fontWeight: 700, textTransform: "capitalize" }}>
            {user?.role || "patient"}
          </span>
        </div>
      </div>

      <div className="section-card">
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label className="form-label">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-ui" />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="input-ui" />
          </div>
          <div>
            <label className="form-label">Age</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} className="input-ui" />
          </div>
          <div>
            <label className="form-label">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="input-ui">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="form-label">Blood Group</label>
            <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} placeholder="e.g. O+" className="input-ui" />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label className="form-label">Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} rows={2} className="input-ui" style={{ resize: "none" }} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ width: "100%", padding: "0.85rem" }}>
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
