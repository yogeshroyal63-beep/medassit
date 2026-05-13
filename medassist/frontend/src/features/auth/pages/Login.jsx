import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Heart } from "lucide-react";
import { useAuth } from "../../../shared/hooks/useAuth";
import { useAuth0Login } from "../../../shared/hooks/useAuth0Login";
import { authService } from "../auth.service";
import toast from "react-hot-toast";

const Login = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const { enabled: auth0Enabled, loginWithAuth0, loading: auth0Loading } = useAuth0Login();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      login(data);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.message;
      if (status === 403) {
        toast.error(message || "Your account is pending approval.");
      } else {
        toast.error(message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>

      {/* ── Left brand panel ──────────────────────────────────────────────── */}
      <div style={{
        flex: "0 0 420px",
        background: "var(--brand-950)",
        display: "flex", flexDirection: "column",
        padding: "3rem",
        color: "#e2e8f0",
      }} className="auth-panel-left">

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "linear-gradient(135deg, #0ea5b7, #71d9df)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={17} color="#061227" fill="#061227" />
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", fontFamily: "'Fraunces', serif" }}>MedAssist</span>
        </div>

        {/* Copy */}
        <div style={{ marginTop: "auto", paddingTop: "4rem" }}>
          <p style={{ fontSize: "0.7rem", color: "#71d9df", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.75rem", fontWeight: 700 }}>
            Healthcare Platform
          </p>
          <h2 style={{ fontSize: "2rem", fontFamily: "'Fraunces', serif", color: "#ffffff", lineHeight: 1.2, marginBottom: "1rem" }}>
            Secure access to your health workspace
          </h2>
          <p style={{ color: "rgba(226,232,240,0.65)", fontSize: "13px", lineHeight: 1.75, margin: 0 }}>
            AI-powered triage, appointment management, secure messaging, and digital health records — all in one platform.
          </p>
          <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {["HIPAA-compliant & secure", "Role-based access control", "AI symptom intelligence"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "rgba(226,232,240,0.75)" }}>
                <span style={{ color: "#71d9df", fontSize: "15px", flexShrink: 0 }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem",
        background: "var(--surface)",
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>

          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.6rem", fontFamily: "'Fraunces', serif", color: "var(--text)", marginBottom: "0.35rem" }}>
              Sign in
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13.5px", margin: 0 }}>
              Enter your credentials to access your account
            </p>
          </div>

          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem", boxShadow: "var(--shadow)" }}>

            {/* Auth0 / Google */}
            {auth0Enabled && (
              <>
                <button
                  onClick={() => loginWithAuth0("google-oauth2")}
                  disabled={auth0Loading}
                  aria-label="Continue with Google"
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "0.7rem", borderRadius: "10px", border: "1.5px solid var(--border-strong)", background: "var(--surface)", color: "var(--text)", fontSize: "13px", fontWeight: 600, cursor: "pointer", marginBottom: "1.25rem" }}
                >
                  <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continue with Google
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                  <span style={{ fontSize: "11px", color: "var(--text-subtle)", whiteSpace: "nowrap" }}>or continue with email</span>
                  <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {/* Email */}
              <div>
                <label className="form-label" htmlFor="login-email">Email</label>
                <div style={{ position: "relative" }}>
                  <Mail size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
                  <input
                    id="login-email"
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" className="input-ui"
                    required autoComplete="email"
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="form-label" htmlFor="login-password">Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" className="input-ui"
                    required autoComplete="current-password"
                    style={{ paddingLeft: "36px", paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", display: "flex", padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary"
                style={{ width: "100%", marginTop: "0.25rem", padding: "0.8rem" }}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "1.25rem", marginBottom: 0 }}>
              Don't have an account?{" "}
              <button onClick={() => navigate("/role-selection")}
                style={{ background: "none", border: "none", color: "var(--brand-700)", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
