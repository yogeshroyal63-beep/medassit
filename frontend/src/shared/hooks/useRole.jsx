import { useAuth } from "./useAuth";

/**
 * Returns the current user's role and convenience booleans.
 * Usage: const { isDoctor, isPatient, isAdmin, role } = useRole();
 */
export function useRole() {
  const { user } = useAuth();
  const role = user?.role || null;
  return {
    role,
    isPatient: role === "patient",
    isDoctor:  role === "doctor",
    isAdmin:   role === "admin",
  };
}
