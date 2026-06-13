import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Dumbbell } from "lucide-react";
import toast from "react-hot-toast";

import { verifyEmailRequest } from "../api/authApi";
import "../styles/auth.css";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      toast.error("Verification token is missing");
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmailRequest(token);

        setStatus("success");
        setMessage(response || "Email verified successfully.");
        toast.success("Email verified successfully");
      } catch (err) {
        console.error(err);

        setStatus("error");
        setMessage("Verification link is invalid or expired.");
        toast.error("Verification failed");
      }
    };

    verify();
  }, [searchParams]);

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
            {status === "loading" && <Loader2 size={36} className="spin" />}
            {status === "success" && <CheckCircle2 size={42} />}
            {status === "error" && <XCircle size={42} />}
          </div>

          <div className="auth-header">
            <h1>
              {status === "loading" && "Verifying email"}
              {status === "success" && "Email verified"}
              {status === "error" && "Verification failed"}
            </h1>

            <p>{message}</p>
          </div>

          <Link to="/login" className="submit-btn verify-login-btn">
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
}
