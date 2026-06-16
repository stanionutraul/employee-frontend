import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import { forgotPasswordRequest } from "../api/authApi";

import "../styles/auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);

      await forgotPasswordRequest(email);

      setSent(true);

      toast.success("Password reset email sent");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send reset email");
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
            <Mail size={20} />
          </div>

          <span>Nexus Fit</span>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h1>Forgot password</h1>

            <p>Enter your email and we'll send you a password reset link.</p>
          </div>

          {!sent ? (
            <form onSubmit={submit} className="auth-form">
              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          ) : (
            <div className="auth-header">
              <h2>Email sent</h2>

              <p>
                Check your inbox and follow the password reset instructions.
              </p>
            </div>
          )}

          <p className="auth-footer">
            <Link to="/login">
              <ArrowLeft size={14} />
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
