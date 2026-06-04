import { useEffect, useState } from "react";
import api from "../../../shared/utils/api";
import { Users, Search } from "lucide-react";

const ROLE_CLASS = { patient: "badge-cyan", doctor: "badge-teal", admin: "badge-amber" };

const AdminUsers = () => {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]   = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    api.get("/admin/users")
      .then(r => setUsers(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchRole  = roleFilter === "ALL" || u.role === roleFilter;
    const matchQuery = !query ||
      (u.name || "").toLowerCase().includes(query.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(query.toLowerCase());
    return matchRole && matchQuery;
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "color-mix(in srgb, var(--brand-700) 10%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Users size={18} color="var(--brand-700)" />
        </div>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">All registered platform users</p>
        </div>
      </div>

      <div className="section-card">
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} aria-hidden="true" />
            <input
              className="input-ui"
              style={{ paddingLeft: "2.25rem" }}
              placeholder="Search by name or email…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
            style={{ padding: "0.65rem 0.9rem", borderRadius: "0.75rem", border: "1px solid var(--border-strong)", background: "var(--card)", color: "var(--text)", fontSize: "0.875rem", cursor: "pointer" }}
          >
            <option value="ALL">All roles</option>
            <option value="patient">Patients</option>
            <option value="doctor">Doctors</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: "52px", borderRadius: "10px", background: "var(--border)", animation: "pulse-ring 1.5s infinite" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--text-subtle)", fontSize: "13px", textAlign: "center", padding: "2rem 0" }}>
            No users found.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {filtered.map(u => (
              <div key={u._id} style={{
                padding: "0.7rem 1rem", borderRadius: "10px",
                border: "1px solid var(--border)", background: "var(--surface-elevated)",
                display: "flex", alignItems: "center", gap: "12px",
              }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, var(--brand-700), var(--brand-500))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: "13px",
                }}>
                  {u.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.name || "—"}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.email}
                  </p>
                </div>
                <span className={`badge ${ROLE_CLASS[u.role] || "badge-slate"}`} style={{ textTransform: "capitalize", flexShrink: 0 }}>
                  {u.role}
                </span>
                {u.isApproved === false && u.role === "doctor" && (
                  <span className="badge badge-amber" style={{ flexShrink: 0 }}>Pending</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
