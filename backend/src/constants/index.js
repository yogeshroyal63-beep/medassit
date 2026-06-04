/**
 * Shared constants for the backend.
 * Import from here rather than sprinkling magic strings across the codebase.
 */

const ROLES = Object.freeze({
  PATIENT: "patient",
  DOCTOR:  "doctor",
  ADMIN:   "admin",
});

const APPOINTMENT_STATUS = Object.freeze({
  PENDING:   "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
});

const RECORD_TYPES = Object.freeze({
  LAB:          "lab",
  PRESCRIPTION: "prescription",
  IMAGING:      "imaging",
  DIAGNOSIS:    "diagnosis",
  VACCINATION:  "vaccination",
  OTHER:        "other",
});

module.exports = { ROLES, APPOINTMENT_STATUS, RECORD_TYPES };
