/**
 * Auth type constants shared across the auth module.
 * JS equivalent of TypeScript enums / type aliases.
 */

const ROLES = Object.freeze({
  PATIENT: "patient",
  DOCTOR:  "doctor",
  ADMIN:   "admin",
});

const TOKEN_KEY = "medassist_token";
const USER_KEY  = "medassist_user";

module.exports = { ROLES, TOKEN_KEY, USER_KEY };
