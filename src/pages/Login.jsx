import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, ArrowRight } from "lucide-react";

import { loginRequest } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // 🔥 IMPORTANT

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    try {
      setLoading(true);

      const res = await loginRequest({
        email,
        password,
      });

      await login(res);

      toast.success("Welcome back");

      navigate("/dashboard");
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      toast.error("Invalid email or password");
      console.error("ERROR STATUS:", err.response?.status);
      console.error("ERROR DATA:", err.response?.data);
      console.error("ERROR URL:", err.config?.url);
      console.error("ERROR BASE URL:", err.config?.baseURL);

      toast.error(
        err.response?.data?.message || err.response?.data || "Request failed",
      );
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

          <div className="demo-accounts">
            <div className="demo-header">Try the application instantly</div>

            <div
              className="demo-card"
              onClick={() => {
                setEmail("alex.trainer@nexusfit.com");
                setPassword("Password123");
              }}
            >
              <div>
                <strong>Trainer Demo</strong>
                <span>alex.trainer@nexusfit.com</span>
              </div>
            </div>

            <div
              className="demo-card"
              onClick={() => {
                setEmail("demo.user@nexusfit.com");
                setPassword("Password123");
              }}
            >
              <div>
                <strong>User Demo</strong>
                <span>demo.user@nexusfit.com</span>
              </div>
            </div>
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
              <div
                style={{
                  textAlign: "right",
                  marginTop: "8px",
                }}
              >
                <Link
                  to="/forgot-password"
                  style={{
                    color: "#a78bfa",
                    fontSize: "14px",
                  }}
                >
                  Forgot password?
                </Link>
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
