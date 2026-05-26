import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Dumbbell,
  ArrowRight,
  ArrowLeft,
  User,
  Award,
  Check,
} from "lucide-react";

import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("USER");

  const finish = () => {
    navigate("/dashboard");
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

        <div className="auth-card">
          {/* PROGRESS */}
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

          {/* STEP 1 */}
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

              <button className="submit-btn" onClick={() => setStep(2)}>
                Continue
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2 */}
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

              <div className="register-actions">
                <button className="secondary-btn" onClick={() => setStep(1)}>
                  <ArrowLeft size={18} />
                  Back
                </button>

                <button className="submit-btn" onClick={finish}>
                  Create account
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
