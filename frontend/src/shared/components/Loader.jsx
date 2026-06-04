const Loader = ({ label }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem", gap: "0.75rem" }}>
    <div style={{
      width: "36px", height: "36px", borderRadius: "50%",
      border: "3px solid var(--border)",
      borderTopColor: "var(--brand-500)",
      animation: "spin 0.8s linear infinite",
    }} />
    {label && <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>{label}</p>}
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default Loader;
