import { formatDate } from "../../../shared/utils/helpers";

const STATUS_COLORS = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const AppointmentList = ({ appointments, onUpdateStatus, busyId }) => {
  if (!appointments?.length) {
    return <p className="text-sm text-slate-400">No appointments to display.</p>;
  }

  return (
    <div className="space-y-2">
      {appointments.map((a) => (
        <div key={a._id} className="rounded-xl border border-slate-100 bg-white p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{a.patientId?.name || "Patient"}</p>
              <p className="text-xs text-slate-400">{formatDate(a.date)} at {a.time} · {a.type}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[a.status] || "bg-slate-100 text-slate-600"}`}>
              {a.status}
            </span>
          </div>
          {onUpdateStatus && (
            <div className="mt-3 flex gap-2">
              {["confirmed", "completed", "cancelled"].map((s) => (
                <button
                  key={s}
                  disabled={busyId === a._id || a.status === s}
                  onClick={() => onUpdateStatus(a._id, s)}
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs capitalize hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AppointmentList;
