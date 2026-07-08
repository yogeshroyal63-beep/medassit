import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const HealthMetricsChart = ({ data }) => {
  const hasData = data && data.length > 0;

  return (
    <div className="section-card" style={{ height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Health Metrics</p>
          <p style={{ margin: "2px 0 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", fontFamily: "'Fraunces', serif" }}>6-Month Trend</p>
        </div>
      </div>

      {hasData ? (
        <div style={{ width: "100%", height: 260, marginTop: "0.75rem" }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-subtle)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-subtle)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid var(--border)", fontSize: "12px" }} />
              <Line type="monotone" dataKey="systolic"  name="Systolic BP" stroke="#0ea5b7" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              <Line type="monotone" dataKey="heartRate" name="Heart Rate"  stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ padding: "2rem 0", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "var(--text-subtle)", margin: 0 }}>
            No vitals logged yet. Log a reading to start seeing your trend here.
          </p>
        </div>
      )}
    </div>
  );
};

export default HealthMetricsChart;
