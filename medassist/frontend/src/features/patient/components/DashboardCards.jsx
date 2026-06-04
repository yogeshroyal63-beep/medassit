import { Activity, Calendar, Pill, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardCards() {
  const navigate = useNavigate();

  const cards = [
    { title: "Smart Check", subtitle: "Check symptoms", icon: Activity, color: "#1d4ed8", bg: "#eff6ff", path: "/triage" },
    { title: "Book Appointment", subtitle: "Schedule visit", icon: Calendar, color: "#0f766e", bg: "#f0fdfa", path: "/appointments" },
    { title: "Medications", subtitle: "View medicines", icon: Pill, color: "#0891b2", bg: "#ecfeff", path: "/medications" },
    { title: "Health Records", subtitle: "View history", icon: FileText, color: "#7c3aed", bg: "#f5f3ff", path: "/records" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.85rem", marginBottom: "1.5rem" }}>
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} onClick={() => navigate(card.path)}
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", transition: "box-shadow 0.15s, transform 0.15s", boxShadow: "var(--shadow-sm)" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "none"; }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={18} color={card.color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{card.title}</p>
              <p style={{ margin: 0, fontSize: "11.5px", color: "var(--text-subtle)" }}>{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
