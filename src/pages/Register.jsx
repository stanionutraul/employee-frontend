import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Dumbbell,
  ArrowRight,
  ArrowLeft,
  User,
  Award,
  Check,
  MailCheck,
  RefreshCw,
} from "lucide-react";

import toast from "react-hot-toast";

import { registerRequest, resendVerificationRequest } from "../api/authApi";

import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("USER");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const goNext = () => {
    if (!name.trim()) {
      setError("Full name is required");
      toast.error("Full name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      toast.error("Email is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      toast.error("Password is required");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      toast.error("Password must be at least 4 characters");
      return;
    }

    setError("");
    setStep(2);
  };

  const finish = async () => {
    try {
      setLoading(true);
      setError("");

      await registerRequest({
        name,
        email,
        password,
        role,
      });

      setRegisteredEmail(email);
      toast.success("Verification email sent");
    } catch (err) {
      console.error(err);
      setError("Failed to create account");
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      setResending(true);
      setError("");

      await resendVerificationRequest(registeredEmail);

      toast.success("Verification email resent");
    } catch (err) {
      console.error(err);
      setError("Failed to resend verification email");
      toast.error("Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  if (registeredEmail) {
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

          <div className="auth-card verify-card">
            <div className="verify-icon">
              <MailCheck size={42} />
            </div>

            <div className="auth-header">
              <h1>Check your email</h1>

              <p>
                We sent a verification link to{" "}
                <strong>{registeredEmail}</strong>. Your account will become
                active after you verify your email.
              </p>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button
              className="submit-btn verify-login-btn"
              onClick={resendVerification}
              disabled={resending}
            >
              {resending ? "Resending..." : "Resend verification email"}
              <RefreshCw size={18} />
            </button>

            <button
              className="secondary-btn verify-secondary-btn"
              onClick={() => navigate("/login")}
            >
              Go to login
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="progress-wrapper">
            <div className="progress-top">
              <span className={step >= 1 ? "active" : ""}>Your info</span>

              <div className="progress-line"></div>

              <span className={step >= 2 ? "active" : ""}>Role</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: step === 1 ? "50%" : "100%",
                }}
              ></div>
            </div>
          </div>

          {step === 1 && (
            <div className="step-content">
              <div className="auth-header">
                <h1>Create your account</h1>

                <p>Start tracking your training intelligently.</p>
              </div>

              <div className="form-group">
                <label>Full name</label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jordan Reed"
                />
              </div>

              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@nexus.fit"
                />
              </div>

              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <button className="submit-btn" onClick={goNext}>
                Continue
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <div className="auth-header">
                <h1>Choose your role</h1>

                <p>You can change this later in settings.</p>
              </div>

              <div className="role-cards">
                <button
                  className={role === "USER" ? "role-card active" : "role-card"}
                  onClick={() => setRole("USER")}
                >
                  <div className="role-icon">
                    <User size={20} />
                  </div>

                  <div className="role-info">
                    <h3>Member</h3>

                    <p>Join workouts and track your progress.</p>
                  </div>

                  {role === "USER" && <Check size={18} />}
                </button>

                <button
                  className={
                    role === "TRAINER" ? "role-card active" : "role-card"
                  }
                  onClick={() => setRole("TRAINER")}
                >
                  <div className="role-icon">
                    <Award size={20} />
                  </div>

                  <div className="role-info">
                    <h3>Trainer</h3>

                    <p>Build workouts and manage athletes.</p>
                  </div>

                  {role === "TRAINER" && <Check size={18} />}
                </button>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <div className="register-actions">
                <button className="secondary-btn" onClick={() => setStep(1)}>
                  <ArrowLeft size={18} />
                  Back
                </button>

                <button
                  className="submit-btn"
                  onClick={finish}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create account"}
                </button>
              </div>
            </div>
          )}

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
