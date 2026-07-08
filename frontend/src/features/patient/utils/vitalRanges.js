// Simple adult reference ranges for at-a-glance status badges.
// Not diagnostic — just a rough "does this look normal" signal for the patient.
export function bpStatus(systolic, diastolic) {
  if (systolic == null || diastolic == null) return null;
  if (systolic >= 140 || diastolic >= 90) return "High";
  if (systolic >= 130 || diastolic >= 85) return "Elevated";
  if (systolic < 90 || diastolic < 60) return "Low";
  return "Normal";
}
export function heartRateStatus(hr) {
  if (hr == null) return null;
  if (hr > 100) return "High";
  if (hr < 60) return "Low";
  return "Normal";
}
export function bloodSugarStatus(mgdl) {
  if (mgdl == null) return null;
  if (mgdl >= 126) return "High";
  if (mgdl < 70) return "Low";
  return "Normal";
}
export function spo2Status(pct) {
  if (pct == null) return null;
  if (pct < 92) return "Low";
  if (pct < 95) return "Fair";
  return "Great";
}
export function temperatureStatus(celsius) {
  if (celsius == null) return null;
  if (celsius >= 38) return "Fever";
  if (celsius < 35.5) return "Low";
  return "Normal";
}

export const STATUS_COLORS = {
  Normal: { bg: "#dcfce7", color: "#15803d" },
  Great:  { bg: "#dcfce7", color: "#15803d" },
  Fair:   { bg: "#fef3c7", color: "#b45309" },
  Elevated: { bg: "#fef3c7", color: "#b45309" },
  High:   { bg: "#ffe4e6", color: "#be123c" },
  Fever:  { bg: "#ffe4e6", color: "#be123c" },
  Low:    { bg: "#ffedd5", color: "#c2410c" },
};
