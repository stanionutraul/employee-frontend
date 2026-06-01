import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, ArrowRight } from "lucide-react";

import { loginRequest } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // 🔥 IMPORTANT

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginRequest({
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res);

      login(res); // 🔥 SALVEAZĂ TOKEN + /me

      navigate("/dashboard");
    } catch (err) {
      console.log("LOGIN ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-1"></div>
      <div className="auth-glow auth-glow-2"></div>

      <div className="auth-wrapper">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Dumbbell size={20} />
          </div>
          <span>Nexus Fit</span>
        </div>

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Continue as</label>
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
