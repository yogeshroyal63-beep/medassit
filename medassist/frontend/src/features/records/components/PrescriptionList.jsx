import { formatDate } from "../../../shared/utils/helpers";

const PrescriptionList = ({ prescriptions = [] }) => {
  if (prescriptions.length === 0) {
    return <p className="text-sm text-slate-500 py-4">No prescriptions found.</p>;
  }
  return (
    <ul className="space-y-3">
      {prescriptions.map((rx, i) => (
        <li key={rx._id || i} className="glass-card rounded-xl p-4 space-y-1">
          <p className="font-semibold text-slate-800">{rx.medication || rx.name}</p>
          {rx.dosage    && <p className="text-sm text-slate-600">Dosage: {rx.dosage}</p>}
          {rx.frequency && <p className="text-sm text-slate-600">Frequency: {rx.frequency}</p>}
          {rx.prescribedBy && <p className="text-sm text-slate-500">Prescribed by: {rx.prescribedBy}</p>}
          <p className="text-xs text-slate-400">{formatDate(rx.date || rx.createdAt)}</p>
        </li>
      ))}
    </ul>
  );
};

export default PrescriptionList;
