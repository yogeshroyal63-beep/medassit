import { useState } from "react";
import { useAuth } from "../../../shared/hooks/useAuth";
import api from "../../../shared/utils/api";
import toast from "react-hot-toast";
import { Settings as SettingsIcon, Lock, LogOut } from "lucide-react";

const Settings = () => {
  const { logout } = useAuth();
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) return toast.error("Passwords do not match");
    if (passwords.next.length < 8) return toast.error("Password must be at least 8 characters");
    setSaving(true);
    try { await api.put("/users/me/password", { currentPassword: passwords.current, newPassword: passwords.next }); toast.success("Password updated"); setPasswords({ current: "", next: "", confirm: "" }); }
    catch (err) { toast.error(err.response?.data?.message || "Could not update password"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: "480px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SettingsIcon size={18} color="#475569" />
        </div>
        <h1 className="page-title">Settings</h1>
      </div>

      {/* Change Password */}
      <div className="section-card" style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
          <Lock size={16} color="var(--brand-700)" />
          <h2 className="section-title" style={{ margin: 0 }}>Change Password</h2>
        </div>
        <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label className="form-label">Current Password</label>
            <input type="password" name="current" value={passwords.current} onChange={handleChange} className="input-ui" required />
          </div>
          <div>
            <label className="form-label">New Password</label>
            <input type="password" name="next" value={passwords.next} onChange={handleChange} className="input-ui" required />
          </div>
          <div>
            <label className="form-label">Confirm New Password</label>
            <input type="password" name="confirm" value={passwords.confirm} onChange={handleChange} className="input-ui" required />
          </div>
          <button type="submit" disabled={saving} className="btn-primary" style={{ width: "100%", padding: "0.8rem" }}>
            {saving ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div style={{ background: "var(--card)", border: "1.5px solid #fecdd3", borderRadius: "14px", padding: "1.25rem 1.5rem", boxShadow: "var(--shadow-sm)" }}>
        <h2 style={{ margin: "0 0 0.4rem", fontSize: "14px", fontWeight: 700, color: "#be123c", display: "flex", alignItems: "center", gap: "7px" }}>
          <LogOut size={15} /> Danger Zone
        </h2>
        <p style={{ margin: "0 0 0.85rem", fontSize: "12.5px", color: "var(--text-muted)" }}>Logging out will clear your session from this device.</p>
        <button onClick={logout}
          style={{ padding: "0.6rem 1.25rem", borderRadius: "9px", background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
