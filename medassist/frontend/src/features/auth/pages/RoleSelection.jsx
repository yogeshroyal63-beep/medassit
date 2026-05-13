import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Stethoscope, CheckCircle, Heart } from "lucide-react";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedRole) return;
    if (selectedRole === "patient") navigate("/signup", { state: { role: "patient" } });
    if (selectedRole === "doctor")  navigate("/signup", { state: { role: "doctor" } });
  };

  const roles = [
    {
      id: "patient",
      icon: User,
      title: "Patient",
      desc: "For individuals managing health, consultations, and medication plans.",
      features: ["Check symptoms with Smart Check", "Manage medications and reminders", "Book and manage appointments", "Maintain digital health records"],
      badge: { bg: "#eff6ff", color: "#1d4ed8", text: "✓ Instant access to all features" },
      accent: "#0ea5b7",
      iconBg: "#e0f2fe",
      iconColor: "#0ea5b7",
    },
    {
      id: "doctor",
      icon: Stethoscope,
      title: "Doctor",
      desc: "For healthcare professionals managing patient care workflows.",
      features: ["Manage patient appointments", "Review patient symptoms", "Create consultation notes", "Write digital prescriptions"],
      badge: { bg: "#fffbeb", color: "#92400e", text: "⚠ Requires verification of medical license" },
      accent: "#10b981",
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 1.5rem" }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "2.5rem" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg, var(--brand-700), var(--brand-500))", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Heart size={15} color="#fff" fill="#fff" />
        </div>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--brand-700)", fontFamily: "'Fraunces', serif" }}>MedAssist</span>
      </div>

      <div style={{ textAlign: "center", maxWidth: "520px", marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "1.9rem", fontFamily: "'Fraunces', serif", color: "var(--text)", marginBottom: "0.5rem" }}>Choose your access role</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Dedicated experience for patients and medical professionals.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem", width: "100%", maxWidth: "680px" }}>
        {roles.map(({ id, icon: Icon, title, desc, features, badge, accent, iconBg, iconColor }) => (
          <div
            key={id}
            onClick={() => setSelectedRole(id)}
            style={{
              background: "var(--card)",
              border: selectedRole === id ? `2px solid ${accent}` : "1.5px solid var(--border)",
              borderRadius: "18px",
              padding: "1.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: selectedRole === id ? `0 4px 20px ${accent}22` : "var(--shadow-sm)",
              transform: selectedRole === id ? "translateY(-2px)" : undefined,
              position: "relative",
            }}
          >
            {selectedRole === id && (
              <CheckCircle size={20} color={accent} style={{ position: "absolute", top: "1rem", right: "1rem" }} />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={22} color={iconColor} />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", fontFamily: "'Fraunces', serif" }}>{title}</h3>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "1rem", lineHeight: 1.6 }}>{desc}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {features.map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12.5px", color: "var(--text-muted)" }}>
                  <span style={{ color: accent, flexShrink: 0 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <div style={{ padding: "0.5rem 0.85rem", borderRadius: "8px", background: badge.bg, color: badge.color, fontSize: "11.5px", fontWeight: 600 }}>
              {badge.text}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedRole}
        className="btn-primary"
        style={{ marginTop: "2rem", padding: "0.85rem 2.5rem", fontSize: "14px" }}
      >
        Continue →
      </button>

      <p style={{ marginTop: "1rem", fontSize: "13px", color: "var(--text-muted)" }}>
        Already have an account?{" "}
        <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", color: "var(--brand-700)", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>
          Sign in
        </button>
      </p>
    </div>
  );
}
