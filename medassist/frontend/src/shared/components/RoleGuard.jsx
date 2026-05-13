import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "./Loader";

const RoleGuard = ({ children, role }) => {
  const { user, loading } = useAuth();

  // Wait for auth state to hydrate before making a role decision
  if (loading) {
    return <Loader label="Checking permissions…" />;
  }

  if (!user || user.role !== role) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default RoleGuard;
