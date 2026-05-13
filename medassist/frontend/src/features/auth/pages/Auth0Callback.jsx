import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0Login } from "../../../shared/hooks/useAuth0Login";
import Loader from "../../../shared/components/Loader";
import toast from "react-hot-toast";

/**
 * Auth0Callback
 *
 * Auth0 redirects the user here after a successful social login.
 * This page handles the token exchange and redirects to the dashboard.
 *
 * Register this route in routes.jsx:
 *   <Route path="/auth0/callback" element={<Auth0Callback />} />
 */
const Auth0Callback = () => {
  const navigate = useNavigate();
  const { handleAuth0Callback, error } = useAuth0Login();

  useEffect(() => {
    handleAuth0Callback()
      .then(() => {
        toast.success("Logged in successfully");
        navigate("/", { replace: true });
      })
      .catch(() => {
        toast.error("Auth0 login failed. Please try again.");
        navigate("/login", { replace: true });
      });
  }, []);

  // Fix: replaced all Tailwind utility classes with CSS variable inline styles
  // so this page renders correctly even before Tailwind is compiled.
  if (error) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <div className="glass-card" style={{ borderRadius: "1rem", padding: "2rem", textAlign: "center", maxWidth: "360px", width: "100%" }}>
          <p style={{ color: "#be123c", fontWeight: 600, margin: "0 0 0.5rem" }}>Authentication failed</p>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: "0 0 1rem" }}>{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="btn-primary"
            style={{ padding: "0.5rem 1.25rem" }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return <Loader label="Completing sign-in…" size="lg" />;
};

export default Auth0Callback;
