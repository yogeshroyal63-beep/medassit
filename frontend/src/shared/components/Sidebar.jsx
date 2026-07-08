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
  patient: { bg: "rgba(14,165,183,0.18)", text: "#71d9df", dot: "#0ea5b7" },
  doctor:  { bg: "rgba(59,130,246,0.18)", text: "#93c5fd", dot: "#3b82f6" },
  admin:   { bg: "rgba(168,85,247,0.18)", text: "#d8b4fe", dot: "#a855f7" },
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
      {/* CSS for hover states — avoids DOM-mutation anti-pattern */}
      <style>{`
        .sidebar-logout-btn:hover { background: rgba(220,38,38,0.18) !important; color: #fca5a5 !important; }
        .sidebar-nav-link:hover:not(.sidebar-nav-link-active) { background: rgba(255,255,255,0.06) !important; color: #fff !important; }
        .sidebar-nav-link svg { color: rgba(226,232,240,0.45); }
        .sidebar-nav-link:hover svg { color: #fff; }
        .sidebar-nav-link-active svg { color: var(--brand-400) !important; }
      `}</style>

      <aside
        aria-label="Main navigation"
        style={{
          width: "var(--sidebar-w)",
          height: "100vh",
          background: "#061227",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0, left: 0,
          zIndex: 100,
          overflowY: "auto",
          boxShadow: "1px 0 0 rgba(255,255,255,0.04)",
          transition: "transform 0.25s ease",
        }}
        className={open ? "sidebar-open" : ""}
      >
        {/* Logo */}
        <div style={{ padding: "1.25rem 1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "var(--brand-500)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Heart size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#fff", fontFamily: "'Fraunces', serif", letterSpacing: "-0.01em" }}>
              MedAssist
            </span>
          </div>
        </div>

        {/* User chip */}
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "10px",
              background: "rgba(14,165,183,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 700, color: "var(--brand-400)", flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name || "User"}
              </p>
              <span style={{ fontSize: "11px", color: "rgba(226,232,240,0.4)", textTransform: "capitalize" }}>
                {role || "patient"}
              </span>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "0.85rem 0.75rem", overflowY: "auto" }}>
          <p style={{ fontSize: "10px", color: "rgba(226,232,240,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, padding: "0 0.5rem", marginBottom: "0.5rem" }}>
            Navigation
          </p>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} end
              onClick={onClose}
              className={({ isActive }) => `sidebar-nav-link${isActive ? " sidebar-nav-link-active" : ""}`}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 10px", borderRadius: "10px", marginBottom: "2px",
                fontSize: "13px", fontWeight: isActive ? 600 : 500,
                color: isActive ? "#fff" : "rgba(226,232,240,0.45)",
                background: isActive ? "rgba(14,165,183,0.18)" : "transparent",
                textDecoration: "none", transition: "background 0.15s, color 0.15s",
              })}
            >
              <Icon size={15} style={{ flexShrink: 0 }} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Role tag */}
        <div style={{ padding: "1rem 1.25rem 0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "100px",
            background: rc.bg, color: rc.text, textTransform: "capitalize",
          }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: rc.dot, display: "inline-block" }} />
            {role || "patient"} account
          </span>
        </div>

        {/* Logout — bottom of sidebar */}
        <div style={{ padding: "0.5rem 1rem 1rem" }}>
          <button
            onClick={handleLogout}
            className="sidebar-logout-btn"
            style={{
              display: "flex", alignItems: "center", gap: "9px",
              width: "100%", padding: "9px 12px", borderRadius: "10px",
              fontSize: "13px", fontWeight: 500, color: "rgba(252,165,165,0.85)",
              background: "transparent", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
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
