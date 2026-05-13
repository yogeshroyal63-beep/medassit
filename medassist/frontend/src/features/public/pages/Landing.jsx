import { Link } from "react-router-dom";
import { Heart, Shield, Activity, Calendar, FileText, MessageSquare, Video, CheckCircle } from "lucide-react";

const Landing = () => (
  <div style={{ minHeight: "100vh", background: "var(--brand-950)", color: "#e2e8f0", fontFamily: "'Manrope', sans-serif" }}>

    {/* Nav */}
    <header style={{ padding: "1.25rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 50, background: "rgba(6,18,39,0.9)", backdropFilter: "blur(16px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "linear-gradient(135deg, #0ea5b7, #71d9df)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Heart size={17} color="#061227" fill="#061227" />
        </div>
        <span style={{ fontSize: "17px", fontWeight: 700, color: "#fff", fontFamily: "'Fraunces', serif" }}>MedAssist</span>
      </div>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <Link to="/login" style={{ padding: "0.55rem 1.25rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: "13px", fontWeight: 500, transition: "all 0.15s" }}>Sign in</Link>
        <Link to="/role-selection" style={{ padding: "0.55rem 1.25rem", borderRadius: "8px", background: "linear-gradient(135deg, #0ea5b7, #71d9df)", color: "#061227", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}>Get started</Link>
      </div>
    </header>

    {/* Hero */}
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "5rem 2rem 4rem" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 16px", borderRadius: "100px", border: "1px solid rgba(14,165,183,0.4)", color: "#71d9df", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "1.5rem" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0ea5b7", display: "inline-block" }} />
          AI-Powered Healthcare Management
        </div>
        <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", fontFamily: "'Fraunces', serif", fontWeight: 600, color: "#fff", lineHeight: 1.15, marginBottom: "1.25rem", maxWidth: "720px", margin: "0 auto 1.25rem" }}>
          Clinical-grade digital care for patients, doctors, and hospitals.
        </h1>
        <p style={{ fontSize: "1rem", color: "rgba(226,232,240,0.7)", maxWidth: "560px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
          MedAssist unifies triage intelligence, consultation workflows, appointment management, records, and communication into one secure enterprise platform.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/role-selection" style={{ padding: "0.85rem 2rem", borderRadius: "10px", background: "linear-gradient(135deg, #0ea5b7, #71d9df)", color: "#061227", textDecoration: "none", fontSize: "14px", fontWeight: 700, boxShadow: "0 4px 20px rgba(14,165,183,0.4)" }}>
            Launch Workspace →
          </Link>
          <Link to="/login" style={{ padding: "0.85rem 2rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
            Access Existing Account
          </Link>
        </div>
      </div>

      {/* Features grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
        {[
          { icon: Activity, label: "Smart Triage", desc: "AI symptom analysis with emergency safety overrides and severity scoring." },
          { icon: Calendar, label: "Appointments", desc: "Book, manage, and track consultations across specialties." },
          { icon: MessageSquare, label: "Secure Messaging", desc: "HIPAA-compliant real-time messaging between patients and providers." },
          { icon: Video, label: "Video Consults", desc: "Peer-to-peer WebRTC video consultations with no third-party services." },
          { icon: FileText, label: "Health Records", desc: "Digital medical history, prescriptions, and lab results in one place." },
          { icon: Shield, label: "Role-Based Access", desc: "Dedicated patient, doctor, and admin workflows with audit tracking." },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} style={{ padding: "1.5rem", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(14,165,183,0.15)", border: "1px solid rgba(14,165,183,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.85rem" }}>
              <Icon size={18} color="#71d9df" />
            </div>
            <p style={{ margin: "0 0 0.4rem", fontSize: "14px", fontWeight: 700, color: "#fff" }}>{label}</p>
            <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(226,232,240,0.55)", lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>
    </main>
  </div>
);

export default Landing;
