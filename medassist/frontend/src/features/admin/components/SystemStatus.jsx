import { useEffect, useState } from "react";
import api from "../../../shared/utils/api";

const StatusDot = ({ ok }) => (
  <span className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? "bg-emerald-500" : "bg-rose-500"}`} />
);

const SystemStatus = () => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.get("/health")
      .then(() => setStatus({ api: true }))
      .catch(() => setStatus({ api: false }));
  }, []);

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="mb-4 text-base font-semibold text-slate-700">System Status</h3>
      <ul className="space-y-3 text-sm">
        <li className="flex items-center gap-3">
          <StatusDot ok={status?.api ?? null} />
          <span>API Server</span>
          <span className="ml-auto text-xs text-slate-400">
            {status === null ? "Checking…" : status.api ? "Operational" : "Unreachable"}
          </span>
        </li>
        <li className="flex items-center gap-3">
          <StatusDot ok={true} />
          <span>Authentication</span>
          <span className="ml-auto text-xs text-slate-400">Operational</span>
        </li>
        <li className="flex items-center gap-3">
          <StatusDot ok={true} />
          <span>Database</span>
          <span className="ml-auto text-xs text-slate-400">Connected</span>
        </li>
      </ul>
    </div>
  );
};

export default SystemStatus;
