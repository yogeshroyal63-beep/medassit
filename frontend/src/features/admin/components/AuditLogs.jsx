import { useEffect, useState } from "react";
import { adminService } from "../admin.service";
import Loader from "../../../shared/components/Loader";
import { formatDateTime } from "../../../shared/utils/helpers";
import toast from "react-hot-toast";

const AuditLogs = () => {
  const [logs, setLogs]     = useState({ triages: [], appointments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.auditLogs()
      .then(setLogs)
      .catch(() => toast.error("Failed to load audit logs"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-base font-semibold text-slate-700">Triage Sessions</h3>
        {logs.triages.length === 0 ? (
          <p className="text-sm text-slate-400">No triage sessions recorded.</p>
        ) : (
          <div className="space-y-2">
            {logs.triages.map((t) => (
              <div key={t._id} className="rounded-xl border border-slate-100 bg-white p-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{t.symptoms?.slice(0, 60)}…</span>
                  <span className="text-xs text-slate-400">{formatDateTime(t.createdAt)}</span>
                </div>
                <p className="mt-1 text-slate-500">Severity: {t.severity} · Status: {t.status}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-slate-700">Appointments</h3>
        {logs.appointments.length === 0 ? (
          <p className="text-sm text-slate-400">No appointments recorded.</p>
        ) : (
          <div className="space-y-2">
            {logs.appointments.map((a) => (
              <div key={a._id} className="rounded-xl border border-slate-100 bg-white p-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{a.date?.slice(0, 10)} at {a.time}</span>
                  <span className="text-xs text-slate-400">{formatDateTime(a.createdAt)}</span>
                </div>
                <p className="mt-1 text-slate-500">Status: {a.status} · Type: {a.type}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AuditLogs;
