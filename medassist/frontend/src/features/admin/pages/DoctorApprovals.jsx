import { useEffect, useState } from "react";
import api from "../../../shared/utils/api";
import toast from "react-hot-toast";
import { Stethoscope, Search } from "lucide-react";

const DoctorApprovals = () => {
  const [pending, setPending]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [busyDoctorId, setBusyDoctorId] = useState("");
  const [query, setQuery]               = useState("");

  const load = () => {
    setLoading(true);
    api.get("/admin/doctors/pending")
      .then(r => setPending(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error("Failed to load pending doctors"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const approveDoctor = async (profileId) => {
    setBusyDoctorId(profileId);
    const prev = [...pending];
    setPending(p => p.filter(d => d._id !== profileId));
    try {
      await api.patch(`/admin/doctors/${profileId}/approve`);
      toast.success("Doctor approved successfully");
    } catch {
      setPending(prev);
      toast.error("Unable to approve doctor");
    } finally {
      setBusyDoctorId("");
    }
  };

  const rejectDoctor = async (profileId) => {
    const note = window.prompt("Add rejection note (optional):", "");
    setBusyDoctorId(profileId);
    const prev = [...pending];
    setPending(p => p.filter(d => d._id !== profileId));
    try {
      await api.patch(`/admin/doctors/${profileId}/reject`, { reason: note || "" });
      toast.success("Doctor rejected");
    } catch {
      setPending(prev);
      toast.error("Unable to reject doctor");
    } finally {
      setBusyDoctorId("");
    }
  };

  const filtered = pending.filter(d => {
    const q = query.toLowerCase();
    return (
      (d.userId?.name || "").toLowerCase().includes(q) ||
      (d.specialization || "").toLowerCase().includes(q) ||
      (d.userId?.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "color-mix(in srgb, var(--brand-700) 10%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Stethoscope size={18} color="var(--brand-700)" />
        </div>
        <div>
          <h1 className="page-title">Doctor Approvals</h1>
          <p className="page-subtitle">
            Review and verify doctor credentials before granting access
            {pending.length > 0 && <span style={{ marginLeft: "8px" }} className="badge badge-amber">{pending.length} pending</span>}
          </p>
        </div>
      </div>

      <div className="section-card">
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} aria-hidden="true" />
          <input
            className="input-ui"
            style={{ paddingLeft: "2.25rem" }}
            placeholder="Search by name, specialization, or email…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {[1,2,3].map(i => <div key={i} style={{ height: "72px", borderRadius: "10px", background: "var(--border)", animation: "pulse-ring 1.5s infinite" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--text-subtle)", fontSize: "13px", textAlign: "center", padding: "2rem 0" }}>
            {query ? "No doctors match your search." : "No pending approvals."}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {filtered.map(d => (
              <div key={d._id} style={{
                padding: "0.85rem 1rem", borderRadius: "10px",
                border: "1px solid var(--border)", background: "var(--surface-elevated)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: "1rem", flexWrap: "wrap",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--brand-700), var(--brand-500))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: "14px", flexShrink: 0,
                  }}>
                    {d.userId?.name?.[0]?.toUpperCase() || "D"}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>
                      {d.userId?.name || "Unknown"}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>
                      {d.specialization || "—"}{d.hospital ? ` · ${d.hospital}` : ""}
                    </p>
                    <p style={{ margin: 0, fontSize: "11px", color: "var(--text-subtle)" }}>
                      {d.userId?.email || ""}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                  <button
                    onClick={() => approveDoctor(d._id)}
                    disabled={busyDoctorId === d._id}
                    style={{ padding: "5px 12px", borderRadius: "8px", background: "#ccfbf1", color: "#065f46", border: "1px solid #a7f3d0", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectDoctor(d._id)}
                    disabled={busyDoctorId === d._id}
                    style={{ padding: "5px 12px", borderRadius: "8px", background: "var(--danger-bg)", color: "var(--danger-text)", border: "1px solid var(--danger-border)", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorApprovals;
