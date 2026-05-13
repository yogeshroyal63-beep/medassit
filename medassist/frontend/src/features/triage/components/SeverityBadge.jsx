import { severityColor } from "../../../shared/utils/helpers";
import { capitalize } from "../../../shared/utils/helpers";

const SEVERITY_STYLES = {
  critical:  { bg: "#ffe4e6", color: "#be123c" },
  emergency: { bg: "#ffe4e6", color: "#be123c" },
  high:      { bg: "#ffedd5", color: "#c2410c" },
  urgent:    { bg: "#ffedd5", color: "#c2410c" },
  moderate:  { bg: "#fef3c7", color: "#b45309" },
  medium:    { bg: "#fef3c7", color: "#b45309" },
  mild:      { bg: "#dcfce7", color: "#15803d" },
  low:       { bg: "#dcfce7", color: "#15803d" },
  normal:    { bg: "#f1f5f9", color: "#475569" },
};

const SeverityBadge = ({ severity }) => {
  if (!severity) return null;
  const s = (SEVERITY_STYLES[severity?.toLowerCase()] || SEVERITY_STYLES.normal);
  return (
    <span style={{ padding: "3px 10px", borderRadius: "100px", fontSize: "11.5px", fontWeight: 700, background: s.bg, color: s.color }}>
      {capitalize(severity)}
    </span>
  );
};

export default SeverityBadge;
