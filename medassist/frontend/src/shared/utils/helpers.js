/**
 * Shared utility helpers
 */

/** Format a date value (string or Date) to "Jan 15, 2026" */
export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** Format a date-time to "Jan 15, 2026 at 3:45 PM" */
export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

/** Capitalize first letter of a string */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Truncate text with an ellipsis */
export function truncate(str, max = 80) {
  if (!str || str.length <= max) return str;
  return str.slice(0, max).trimEnd() + "…";
}

/** Map severity string to a Tailwind color class */
export function severityColor(severity) {
  switch ((severity || "").toLowerCase()) {
    case "emergency": return "text-red-600 bg-red-50";
    case "urgent":    return "text-orange-600 bg-orange-50";
    case "moderate":  return "text-yellow-600 bg-yellow-50";
    case "mild":      return "text-green-600 bg-green-50";
    default:          return "text-slate-600 bg-slate-50";
  }
}
