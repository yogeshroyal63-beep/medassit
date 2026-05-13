import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorCard from "../components/DoctorCard";
import Loader from "../../../shared/components/Loader";
import { doctorService } from "../doctor.service";
import toast from "react-hot-toast";
import { Search } from "lucide-react";

const FindDoctor = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors]   = useState([]);
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    doctorService.list()
      .then(setDoctors)
      .catch(() => toast.error("Failed to load doctors"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d => {
    const q = query.toLowerCase();
    return (d.userId?.name || "").toLowerCase().includes(q) || (d.specialization || "").toLowerCase().includes(q) || (d.hospital || "").toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-title">Find a Doctor</h1>
        <p className="page-subtitle">Search across {doctors.length} verified healthcare professionals</p>
      </div>

      <div style={{ position: "relative", marginBottom: "1.5rem" }}>
        <Search size={15} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, specialization or hospital…"
          className="input-ui" style={{ paddingLeft: "38px" }} />
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-subtle)", fontSize: "14px" }}>No doctors matched your search.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {filtered.map(d => <DoctorCard key={d._id} doctor={d} onBook={id => navigate(`/patient/book/${id}`)} />)}
        </div>
      )}
    </div>
  );
};

export default FindDoctor;
