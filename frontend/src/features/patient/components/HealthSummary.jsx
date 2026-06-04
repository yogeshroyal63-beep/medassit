import { HeartPulse, TrendingUp } from "lucide-react";

export default function HealthSummary() {
  return (
    <div style={{ background: "linear-gradient(135deg, var(--brand-700) 0%, var(--brand-500) 100%)", color: "#fff", borderRadius: "14px", padding: "1.5rem", marginBottom: "1.5rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
      <div style={{ position: "absolute", bottom: "-30px", right: "60px", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", opacity: 0.85, marginBottom: "0.4rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        <HeartPulse size={13} /> Health Confidence Index
      </div>
      <div style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1, marginBottom: "0.3rem", fontFamily: "'Fraunces', serif" }}>89</div>
      <p style={{ fontSize: "12px", opacity: 0.8, marginBottom: "0.85rem" }}>Your overall health score based on recent activity</p>
      <div style={{ height: "6px", background: "rgba(255,255,255,0.25)", borderRadius: "100px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: "89%", background: "#fff", borderRadius: "100px" }} />
      </div>
    </div>
  );
}
