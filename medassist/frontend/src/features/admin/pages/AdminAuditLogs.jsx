import { useEffect, useState } from "react";
import api from "../../../shared/utils/api";
import { ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";

const LOGS_PER_PAGE = 10;

const AdminAuditLogs = () => {
  const [triageLogs, setTriageLogs]   = useState([]);
  const [apptLogs, setApptLogs]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [typeFilter, setTypeFilter]   = useState("ALL");
  const [page, setPage]               = useState(1);

  useEffect(() => {
    api.get("/admin/audit-logs")
      .then(r => {
        const d = r.data || {};
        setTriageLogs(Array.isArray(d.triages) ? d.triages : []);
        setApptLogs(Array.isArray(d.appointments) ? d.appointments : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allLogs = [
    ...triageLogs.map(l => ({ ...l, _type: "triage" })),
    ...apptLogs.map(l => ({ ...l, _type: "appointment" })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filtered = typeFilter === "ALL"
    ? allLogs
    : allLogs.filter(l => l._type === typeFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LOGS_PER_PAGE));
  const paged      = filtered.slice((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "color-mix(in srgb, var(--brand-700) 10%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ClipboardList size={18} color="var(--brand-700)" />
        </div>
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Triage sessions and appointment events across the platform</p>
        </div>
      </div>

      <div className="section-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {filtered.length} event{filtered.length !== 1 ? "s" : ""}
          </span>
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            aria-label="Filter by event type"
            style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer" }}
          >
            <option value="ALL">All events</option>
            <option value="triage">Triage only</option>
            <option value="appointment">Appointments only</option>
          </select>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[1,2,3,4,5].map(i => <div key={i} style={{ height: "44px", borderRadius: "9px", background: "var(--border)", animation: "pulse-ring 1.5s infinite" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--text-subtle)", fontSize: "13px", textAlign: "center", padding: "2rem 0" }}>
            No audit events available.
          </p>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {paged.map(l => (
                <div key={l._id} style={{
                  padding: "0.7rem 0.85rem", borderRadius: "9px",
                  border: "1px solid var(--border)", background: "var(--surface-elevated)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: "1rem", fontSize: "12.5px", flexWrap: "wrap",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: "100px", fontSize: "11px", fontWeight: 700,
                      background: l._type === "triage" ? "#ecfeff" : "color-mix(in srgb, var(--brand-600) 10%, transparent)",
                      color: l._type === "triage" ? "#0e7490" : "var(--brand-600)",
                    }}>
                      {l._type}
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {l._type === "triage"
                        ? `Severity: ${l.severity || "—"} · ${l.topCondition || "—"}`
                        : `Status: ${l.status || "—"} · ${l.type || "—"}`}
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)", whiteSpace: "nowrap" }}>
                    {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
              ))}
            </div>

            {filtered.length > LOGS_PER_PAGE && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} aria-label="Previous page"
                  style={{ padding: "4px 10px", borderRadius: "7px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", display: "flex" }}>
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} aria-label="Next page"
                  style={{ padding: "4px 10px", borderRadius: "7px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", display: "flex" }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
