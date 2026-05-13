import { adminService } from "../admin.service";
import { formatDate } from "../../../shared/utils/helpers";
import toast from "react-hot-toast";

const DoctorApprovalTable = ({ doctors, onRefresh }) => {
  const handleApprove = async (id) => {
    try {
      await adminService.approveDoctor(id);
      toast.success("Doctor approved");
      onRefresh?.();
    } catch {
      toast.error("Could not approve doctor");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Rejection reason (optional):");
    if (reason === null) return; // user cancelled
    try {
      await adminService.rejectDoctor(id, reason);
      toast.success("Doctor rejected");
      onRefresh?.();
    } catch {
      toast.error("Could not reject doctor");
    }
  };

  if (!doctors?.length) {
    return <p className="text-sm text-slate-400">No pending applications.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Specialization</th>
            <th className="py-2 pr-4">Hospital</th>
            <th className="py-2 pr-4">Applied</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((d) => (
            <tr key={d._id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 pr-4 font-medium">{d.userId?.name}</td>
              <td className="py-3 pr-4 text-slate-600">{d.specialization}</td>
              <td className="py-3 pr-4 text-slate-600">{d.hospital}</td>
              <td className="py-3 pr-4 text-slate-400">{formatDate(d.createdAt)}</td>
              <td className="py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(d._id)}
                    className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(d._id)}
                    className="rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorApprovalTable;
