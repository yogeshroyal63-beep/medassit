import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Heart, User, Mail, Phone, Lock } from "lucide-react";
import { authService } from "../auth.service";
import { validateSignup } from "../auth.validation";
import toast from "react-hot-toast";

const Signup = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const defaultRole = (location.state?.role || "patient").toLowerCase();

  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [fieldErrors,         setFieldErrors]         = useState({});

  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: defaultRole, password: "", confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear individual field error on change
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[e.target.name]; return n; });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    const errors = validateSignup(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix the errors below.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        name: form.name, email: form.email, phone: form.phone,
        role: form.role, password: form.password,
      });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputWrap = { position: "relative" };
  const iconStyle = { position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" };
  const eyeBtn    = { position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", display: "flex", padding: 0 };
  const errStyle  = { fontSize: "11.5px", color: "#dc2626", marginTop: "3px" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "520px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg, var(--brand-700), var(--brand-500))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart size={15} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--brand-700)", fontFamily: "'Fraunces', serif" }}>MedAssist</span>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontFamily: "'Fraunces', serif", color: "var(--text)", marginBottom: "0.3rem" }}>Create your account</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>Profile setup takes under 2 minutes.</p>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "18px", padding: "2rem", boxShadow: "var(--shadow)" }}>

          {/* Role selector */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {["patient", "doctor"].map(r => (
              <button key={r} type="button"
                onClick={() => setForm({ ...form, role: r })}
                style={{
                  flex: 1, padding: "0.55rem", borderRadius: "9px", fontSize: "13px", fontWeight: 600,
                  border: form.role === r ? "2px solid var(--brand-500)" : "1.5px solid var(--border-strong)",
                  background: form.role === r ? "var(--brand-50)" : "transparent",
                  color: form.role === r ? "var(--brand-700)" : "var(--text-muted)",
                  cursor: "pointer", transition: "all 0.15s", textTransform: "capitalize",
                }}
              >
                {r === "patient" ? "👤" : "🩺"} {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

              {/* Full name */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Full Name</label>
                <div style={inputWrap}>
                  <User size={13} style={iconStyle} />
                  <input name="name" value={form.name} onChange={handleChange}
                    placeholder="John Doe" className="input-ui" required
                    style={{ paddingLeft: "32px" }} />
                </div>
                {fieldErrors.name && <p style={errStyle}>{fieldErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="form-label">Email</label>
                <div style={inputWrap}>
                  <Mail size={13} style={iconStyle} />
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="john@example.com" className="input-ui" required
                    autoComplete="email" style={{ paddingLeft: "32px" }} />
                </div>
                {fieldErrors.email && <p style={errStyle}>{fieldErrors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="form-label">Phone <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                <div style={inputWrap}>
                  <Phone size={13} style={iconStyle} />
                  <input name="phone" value={form.phone} onChange={handleChange}
                    placeholder="+91 90000 00000" className="input-ui"
                    style={{ paddingLeft: "32px" }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="form-label">Password</label>
                <div style={inputWrap}>
                  <Lock size={13} style={iconStyle} />
                  <input type={showPassword ? "text" : "password"} name="password"
                    value={form.password} onChange={handleChange}
                    placeholder="Min 8 characters" className="input-ui" required
                    autoComplete="new-password"
                    style={{ paddingLeft: "32px", paddingRight: "36px" }} />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(v => !v)} style={eyeBtn}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {fieldErrors.password && <p style={errStyle}>{fieldErrors.password}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className="form-label">Confirm Password</label>
                <div style={inputWrap}>
                  <Lock size={13} style={iconStyle} />
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword"
                    value={form.confirmPassword} onChange={handleChange}
                    placeholder="Repeat password" className="input-ui" required
                    autoComplete="new-password"
                    style={{ paddingLeft: "32px", paddingRight: "36px" }} />
                  <button type="button" aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirmPassword(v => !v)} style={eyeBtn}>
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p style={errStyle}>{fieldErrors.confirmPassword}</p>}
              </div>
            </div>

            {form.role === "doctor" && (
              <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", borderRadius: "10px", background: "#fffbeb", border: "1px solid #fde68a", fontSize: "12px", color: "#92400e" }}>
                ⚠ Doctor accounts require admin approval before first login.
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: "100%", marginTop: "1.5rem", padding: "0.85rem" }}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "1.25rem", marginBottom: 0 }}>
            Already have an account?{" "}
            <button onClick={() => navigate("/login")}
              style={{ background: "none", border: "none", color: "var(--brand-700)", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
