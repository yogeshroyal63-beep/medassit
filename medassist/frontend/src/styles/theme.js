/**
 * Design tokens — mirrors CSS variables in globals.css
 * Import these wherever you need JS-level color access (e.g. recharts).
 */
export const colors = {
  brand: {
    50:  "var(--brand-50)",
    100: "var(--brand-100)",
    500: "var(--brand-500)",
    700: "var(--brand-700)",
    900: "var(--brand-900)",
  },
  severity: {
    emergency: "#dc2626",
    urgent:    "#ea580c",
    moderate:  "#ca8a04",
    mild:      "#16a34a",
    normal:    "#64748b",
  },
};
