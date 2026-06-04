const StatCard = ({ label, value }) => (
  <div className="glass-card rounded-xl p-4">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
  </div>
);

const StatsOverview = ({ stats }) => {
  if (!stats) return null;

  return (
    <section className="grid gap-4 md:grid-cols-4">
      <StatCard label="Today's Patients"    value={stats.todayPatients     ?? 0} />
      <StatCard label="Total Appointments"  value={stats.totalAppointments ?? 0} />
      <StatCard label="Pending"             value={stats.pending           ?? 0} />
      <StatCard label="Revenue"             value={`₹${stats.revenue       ?? 0}`} />
    </section>
  );
};

export default StatsOverview;
