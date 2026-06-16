import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";

import { resetPasswordRequest } from "../api/authApi";

import "../styles/auth.css";

function validatePassword(value) {
  if (value.length < 10) {
    return "Password must be at least 10 characters";
  }

  if (!/[A-Z]/.test(value)) {
    return "Password must contain at least one uppercase letter";
  }

  if (!/[a-z]/.test(value)) {
    return "Password must contain at least one lowercase letter";
  }

  if (!/[0-9]/.test(value)) {
    return "Password must contain at least one number";
  }

  return "";
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    try {
      setLoading(true);

      await resetPasswordRequest(token, password);

      toast.success("Password reset successfully");

      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Reset password failed");
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
            <Lock size={20} />
          </div>

          <span>Nexus Fit</span>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h1>Reset password</h1>

            <p>Create a new password for your account.</p>
          </div>

          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label>New password</label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <p className="password-hint">
                Minimum 10 characters, one uppercase letter, one lowercase
                letter and one number.
              </p>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>

          <p className="auth-footer">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
