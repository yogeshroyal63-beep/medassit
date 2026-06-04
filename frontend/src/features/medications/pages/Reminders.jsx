import { useEffect, useState } from "react";
import ReminderList from "../components/ReminderList";
import Loader from "../../../shared/components/Loader";
import { medicationService } from "../medication.service";
import toast from "react-hot-toast";
import { Clock } from "lucide-react";

const Reminders = () => {
  const [meds, setMeds]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => medicationService.list().then(all => setMeds(all.filter(m => m.isActive))).catch(() => toast.error("Failed to load reminders")).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Clock size={18} color="#b45309" />
        </div>
        <div>
          <h1 className="page-title">Today's Reminders</h1>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{meds.length} active reminder{meds.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
      {loading ? <Loader /> : <ReminderList medications={meds} onRefresh={load} />}
    </div>
  );
};

export default Reminders;
