/**
 * PatientDashboard.jsx — DEPRECATED
 *
 * This file is intentionally empty. The patient dashboard is served by
 * PatientPortal.jsx at /patient/dashboard. This file previously contained
 * stale code with incorrect auth keys and missing dependencies.
 *
 * Do not add content here. If you need a new patient dashboard component,
 * update PatientPortal.jsx or create a new file under features/patient/pages/.
 */

// Re-export the real dashboard to avoid import errors if this is ever referenced
export { default } from "./PatientPortal.jsx";
