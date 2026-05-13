import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import Sidebar from "./Sidebar";   // ← Use the richer icon sidebar everywhere

const AppShell = () => {
  const { user }             = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">

      {/* ── Mobile overlay ───────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 90,
            background: "rgba(0,0,0,0.45)",
          }}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile toggle button ─────────────────────────────────────────── */}
      <button
        onClick={() => setSidebarOpen(v => !v)}
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        aria-expanded={sidebarOpen}
        className="mobile-menu-toggle"
        style={{
          position: "fixed", left: "1rem", top: "1rem", zIndex: 110,
          padding: "0.5rem", borderRadius: "8px",
          background: "var(--brand-700)", border: "none",
          cursor: "pointer", color: "#fff", display: "none",
        }}
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* ── Sidebar (Sidebar.jsx handles all roles + icons) ─────────────── */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main content area ────────────────────────────────────────────── */}
      <main className="app-main">

        {/* Topbar */}
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          padding: "0.85rem 2rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              MedAssist · Care Intelligence
            </p>
            <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text)", fontFamily: "'Fraunces', serif" }}>
              Welcome back, {user?.name?.split(" ")[0] || "User"}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              style={{
                padding: "0.45rem 0.75rem", borderRadius: "8px",
                border: "1px solid var(--border)", background: "var(--surface)",
                cursor: "pointer", color: "var(--text-muted)",
                display: "flex", alignItems: "center", gap: "5px", fontSize: "12px",
              }}
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <div style={{
              padding: "4px 10px", borderRadius: "100px",
              background: "var(--brand-50)", color: "var(--brand-700)",
              fontSize: "11px", fontWeight: 600, border: "1px solid var(--brand-100)",
            }}>
              🔒 Secure Session
            </div>
          </div>
        </header>

        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppShell;
