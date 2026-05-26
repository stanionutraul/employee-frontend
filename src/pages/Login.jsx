import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, ArrowRight } from "lucide-react";

import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();

    setLoading(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 600);
  };

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-1"></div>
      <div className="auth-glow auth-glow-2"></div>

      <div className="auth-wrapper">
        {/* LOGO */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Dumbbell size={20} />
          </div>

          <span>Nexus Fit</span>
        </div>

        {/* CARD */}
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome back</h1>

            <p>Sign in to your fitness intelligence dashboard.</p>
          </div>

          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="you@nexus.fit"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* ROLE */}
            <div className="form-group">
              <label>Continue as</label>

              <div className="role-grid">
                <button
                  type="button"
                  className={role === "USER" ? "role-btn active" : "role-btn"}
                  onClick={() => setRole("USER")}
                >
                  Member
                </button>

                <button
                  type="button"
                  className={
                    role === "TRAINER" ? "role-btn active" : "role-btn"
                  }
                  onClick={() => setRole("TRAINER")}
                >
                  Trainer
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Signing in..." : "Continue"}

              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-footer">
            New to Nexus Fit? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
