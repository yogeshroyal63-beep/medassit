import { useEffect, useState } from "react";
import RecordCard from "../components/RecordCard";
import Loader from "../../../shared/components/Loader";
import { recordService } from "../record.service";
import toast from "react-hot-toast";
import { FileText } from "lucide-react";

const MedicalHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { recordService.list().then(setRecords).catch(() => toast.error("Failed to load records")).finally(() => setLoading(false)); }, []);

  const handleDelete = async (id) => {
    try { await recordService.delete(id); setRecords(prev => prev.filter(r => r._id !== id)); toast.success("Record deleted"); }
    catch { toast.error("Could not delete record"); }
  };

  return (
    <div style={{ maxWidth: "700px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FileText size={18} color="#7c3aed" />
        </div>
        <div>
          <h1 className="page-title">Medical History</h1>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{records.length} record{records.length !== 1 ? "s" : ""} on file</p>
        </div>
      </div>
      {loading ? <Loader /> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-subtle)", fontSize: "14px" }}>No medical records found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {records.map(r => <RecordCard key={r._id} record={r} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
