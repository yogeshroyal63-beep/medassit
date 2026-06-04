import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  LayoutDashboard, Activity, Search, Calendar, Pill,
  Clock, FileText, MessageSquare, Video, User, Settings,
  Users, Stethoscope, ClipboardList, LogOut, Heart,
} from "lucide-react";

const patientLinks = [
  { to: "/patient/dashboard",          icon: LayoutDashboard, label: "Dashboard" },
  { to: "/patient/symptom-check",      icon: Activity,        label: "Smart Check" },
  { to: "/patient/find-doctor",        icon: Search,          label: "Find Doctor" },
  { to: "/patient/appointments",       icon: Calendar,        label: "Appointments" },
  { to: "/patient/medications",        icon: Pill,            label: "Medications" },
  { to: "/patient/reminders",          icon: Clock,           label: "Reminders" },
  { to: "/patient/records",            icon: FileText,        label: "Health Records" },
  { to: "/patient/messages",           icon: MessageSquare,   label: "Messages" },
  { to: "/patient/video-consultation", icon: Video,           label: "Video Consult" },
  { to: "/patient/profile",            icon: User,            label: "Profile" },
  { to: "/patient/settings",           icon: Settings,        label: "Settings" },
];

const doctorLinks = [
  { to: "/doctor/dashboard",           icon: LayoutDashboard, label: "Dashboard" },
  { to: "/doctor/appointments",        icon: Calendar,        label: "Appointments" },
  { to: "/doctor/patients",            icon: Users,           label: "Patients" },
  { to: "/doctor/messages",            icon: MessageSquare,   label: "Messages" },
  { to: "/doctor/video-consultation",  icon: Video,           label: "Video Consult" },
  { to: "/doctor/profile",             icon: User,            label: "Profile" },
  { to: "/doctor/settings",            icon: Settings,        label: "Settings" },
];

const adminLinks = [
  { to: "/admin/dashboard",        icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/doctor-approvals", icon: Stethoscope,     label: "Doctor Approvals" },
  { to: "/admin/users",            icon: Users,           label: "Users" },
  { to: "/admin/audit-logs",       icon: ClipboardList,   label: "Audit Logs" },
];

const roleColors = {
  patient: { bg: "#EEF6FF", text: "#1a5490", dot: "#0ea5b7" },
  doctor:  { bg: "#ECFDF5", text: "#065f46", dot: "#10b981" },
  admin:   { bg: "#FEF3C7", text: "#92400e", dot: "#f59e0b" },
};

const Sidebar = ({ open = true, onClose = () => {} }) => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const role             = user?.role;
  const links            = role === "doctor" ? doctorLinks : role === "admin" ? adminLinks : patientLinks;
  const rc               = roleColors[role] || roleColors.patient;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* CSS for logout hover — avoids DOM-mutation anti-pattern */}
      <style>{`
        .sidebar-logout-btn:hover { background: #fff1f2 !important; }
        [data-theme="dark"] .sidebar-logout-btn:hover { background: rgba(220,38,38,0.15) !important; }
      `}</style>

      <aside
        aria-label="Main navigation"
        style={{
          width: "var(--sidebar-w)",
          height: "100vh",
          background: "var(--card)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0, left: 0,
          zIndex: 100,
          overflowY: "auto",
          boxShadow: "1px 0 0 var(--border)",
          transition: "transform 0.25s ease",
        }}
        className={open ? "sidebar-open" : ""}
      >
        {/* Logo */}
        <div style={{ padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, var(--brand-700), var(--brand-500))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(14,165,183,0.35)", flexShrink: 0,
            }}>
              <Heart size={17} color="#fff" fill="#fff" />
            </div>
            <div>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--brand-700)", fontFamily: "'Fraunces', serif" }}>MedAssist</span>
              <p style={{ fontSize: "10px", color: "var(--text-subtle)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Healthcare Platform
              </p>
            </div>
          </div>
        </div>

        {/* User chip */}
        <div style={{ padding: "0.9rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "linear-gradient(135deg, var(--brand-700), var(--brand-500))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name || "User"}
              </p>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                fontSize: "10px", fontWeight: 600, padding: "1px 7px", borderRadius: "100px",
                background: rc.bg, color: rc.text, textTransform: "capitalize", marginTop: "2px",
              }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: rc.dot, display: "inline-block" }} />
                {role || "patient"}
              </span>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "0.6rem 0.75rem", overflowY: "auto" }}>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} end
              onClick={onClose}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "9px",
                padding: "7px 10px", borderRadius: "8px", marginBottom: "1px",
                fontSize: "13px", fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--brand-700)" : "var(--text-muted)",
                background: isActive ? "var(--brand-50)" : "transparent",
                textDecoration: "none", transition: "all 0.15s",
                borderLeft: isActive ? "3px solid var(--brand-500)" : "3px solid transparent",
              })}
            >
              <Icon size={15} style={{ flexShrink: 0 }} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "0.75rem", borderTop: "1px solid var(--border)" }}>
          <button
            onClick={handleLogout}
            className="sidebar-logout-btn"
            style={{
              display: "flex", alignItems: "center", gap: "9px",
              width: "100%", padding: "8px 10px", borderRadius: "8px",
              fontSize: "13px", fontWeight: 500, color: "#dc2626",
              background: "transparent", border: "none", cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            <LogOut size={15} aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
