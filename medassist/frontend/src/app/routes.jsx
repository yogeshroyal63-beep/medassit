import { Routes, Route, Navigate } from "react-router-dom";

// Auth pages
import Login              from "../features/auth/pages/Login.jsx";
import Signup             from "../features/auth/pages/Signup.jsx";
import RoleSelection      from "../features/auth/pages/RoleSelection.jsx";
import DoctorVerification from "../features/auth/pages/DoctorVerification.jsx";
import MedicalProfile     from "../features/auth/pages/MedicalProfile.jsx";
import Auth0Callback      from "../features/auth/pages/Auth0Callback.jsx";

// Patient pages
import PatientPortal  from "../features/patient/pages/PatientPortal.jsx";
import Profile        from "../features/patient/pages/Profile.jsx";
import Settings       from "../features/patient/pages/Settings.jsx";

// Triage
import SmartCheck from "../features/triage/pages/SmartCheck.jsx";

// Doctors
import FindDoctor   from "../features/doctors/pages/FindDoctor.jsx";
import DoctorPortal from "../features/doctors/pages/DoctorPortal.jsx";
import DoctorProfile from "../features/doctors/pages/DoctorProfile.jsx";

// Appointments
import AppointmentHistory from "../features/appointments/pages/AppointmentHistory.jsx";
import BookAppointment    from "../features/appointments/pages/BookAppointment.jsx";

// Medications
import Medications from "../features/medications/pages/Medications.jsx";
import Reminders   from "../features/medications/pages/Reminders.jsx";

// Records
import MedicalHistory from "../features/records/pages/MedicalHistory.jsx";

// Messaging
import Messages from "../features/messaging/pages/Messages.jsx";

// Video
import VideoConsultation from "../features/video/pages/VideoConsultation.jsx";

// Admin
import AdminPortal from "../features/admin/pages/AdminPortal.jsx";

// Shared
import ProtectedRoute from "../shared/components/ProtectedRoute.jsx";
import RoleGuard      from "../shared/components/RoleGuard.jsx";
import AppShell       from "../shared/components/AppShell.jsx";
import { useAuth }    from "../shared/hooks/useAuth";

// ─── Helper components ────────────────────────────────────────────────────────

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin")  return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "doctor") return <Navigate to="/doctor/dashboard" replace />;
  return <Navigate to="/patient/dashboard" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <HomeRedirect /> : children;
};

const linkStyle = { display: "inline-block", marginTop: "1.5rem", fontSize: "14px", color: "var(--brand-700)" };

const AccessDenied = () => (
  <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
    <p style={{ fontSize: "48px", fontWeight: 500, color: "var(--color-text-primary)" }}>403</p>
    <p style={{ fontSize: "16px", color: "var(--color-text-secondary)", marginTop: "0.5rem" }}>
      You don't have permission to view this page.
    </p>
    <a href="/" style={linkStyle}>Go home</a>
  </div>
);

const NotFound = () => (
  <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
    <p style={{ fontSize: "48px", fontWeight: 500, color: "var(--color-text-primary)" }}>404</p>
    <p style={{ fontSize: "16px", color: "var(--color-text-secondary)", marginTop: "0.5rem" }}>
      Page not found.
    </p>
    <a href="/" style={linkStyle}>Go home</a>
  </div>
);

// ─── Routes ───────────────────────────────────────────────────────────────────

const AppRoutes = () => {
  return (
    <Routes>

      {/* Root */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Public — redirect to dashboard if already logged in */}
      <Route path="/login"          element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/signup"         element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
      <Route path="/role"           element={<Navigate to="/role-selection" replace />} />
      <Route path="/role-selection" element={<PublicOnlyRoute><RoleSelection /></PublicOnlyRoute>} />

      {/* Auth0 social-login callback — public, no auth required */}
      <Route path="/auth0/callback" element={<Auth0Callback />} />

      {/* Auth flows — protected but no role guard */}
      <Route path="/doctor-verification" element={<ProtectedRoute><DoctorVerification /></ProtectedRoute>} />
      <Route path="/doctor/pending"      element={<ProtectedRoute><DoctorVerification /></ProtectedRoute>} />
      <Route path="/medical-profile"     element={<ProtectedRoute><MedicalProfile /></ProtectedRoute>} />

      {/* Utility */}
      <Route path="/access-denied" element={<AccessDenied />} />

      {/* Protected shell — all dashboard routes */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>

        {/* ── Patient ─────────────────────────────────────────── */}
        <Route path="/patient/dashboard"          element={<RoleGuard role="patient"><PatientPortal /></RoleGuard>} />
        <Route path="/patient/symptom-check"      element={<RoleGuard role="patient"><SmartCheck /></RoleGuard>} />
        <Route path="/patient/find-doctor"        element={<RoleGuard role="patient"><FindDoctor /></RoleGuard>} />
        <Route path="/patient/book/:doctorId"     element={<RoleGuard role="patient"><BookAppointment /></RoleGuard>} />
        <Route path="/patient/appointments"       element={<RoleGuard role="patient"><AppointmentHistory /></RoleGuard>} />
        <Route path="/patient/medications"        element={<RoleGuard role="patient"><Medications /></RoleGuard>} />
        <Route path="/patient/reminders"          element={<RoleGuard role="patient"><Reminders /></RoleGuard>} />
        <Route path="/patient/records"            element={<RoleGuard role="patient"><MedicalHistory /></RoleGuard>} />
        <Route path="/patient/messages"           element={<RoleGuard role="patient"><Messages /></RoleGuard>} />
        <Route path="/patient/video-consultation" element={<RoleGuard role="patient"><VideoConsultation /></RoleGuard>} />
        <Route path="/patient/profile"            element={<RoleGuard role="patient"><Profile /></RoleGuard>} />
        <Route path="/patient/settings"           element={<RoleGuard role="patient"><Settings /></RoleGuard>} />

        {/* ── Doctor ──────────────────────────────────────────── */}
        <Route path="/doctor/dashboard"           element={<RoleGuard role="doctor"><DoctorPortal /></RoleGuard>} />
        <Route path="/doctor/appointments"        element={<RoleGuard role="doctor"><AppointmentHistory /></RoleGuard>} />
        <Route path="/doctor/patients"            element={<RoleGuard role="doctor"><DoctorPortal /></RoleGuard>} />
        <Route path="/doctor/schedule"            element={<RoleGuard role="doctor"><DoctorPortal /></RoleGuard>} />
        <Route path="/doctor/messages"            element={<RoleGuard role="doctor"><Messages /></RoleGuard>} />
        <Route path="/doctor/video-consultation"  element={<RoleGuard role="doctor"><VideoConsultation /></RoleGuard>} />
        <Route path="/doctor/profile"             element={<RoleGuard role="doctor"><DoctorProfile /></RoleGuard>} />
        <Route path="/doctor/settings"            element={<RoleGuard role="doctor"><Settings /></RoleGuard>} />

        {/* ── Admin ───────────────────────────────────────────── */}
        <Route path="/admin/dashboard"        element={<RoleGuard role="admin"><AdminPortal /></RoleGuard>} />
        <Route path="/admin/doctor-approvals" element={<RoleGuard role="admin"><AdminPortal /></RoleGuard>} />
        <Route path="/admin/users"            element={<RoleGuard role="admin"><AdminPortal /></RoleGuard>} />
        <Route path="/admin/audit-logs"       element={<RoleGuard role="admin"><AdminPortal /></RoleGuard>} />

      </Route>

      {/* 404 — catch all unmatched routes */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRoutes;
