import { useEffect, useState } from "react";
import {
  Shield,
  User,
  Mail,
  Lock,
  BadgeCheck,
  RotateCcw,
  Trash2,
} from "lucide-react";

import {
  getProfile,
  updateProfile,
  changePassword,
  resetProgress,
  deleteAccount,
} from "../api/profileApi";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import "../styles/profile.css";

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

export default function Profile() {
  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();

      setProfile(data);
      setName(data.name);
    } catch {
      setError("Failed to load profile.");
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required.");
      toast.error("Name is required");
      return;
    }

    try {
      setSavingProfile(true);
      setError("");
      setMessage("");

      const updated = await updateProfile({ name });

      setProfile(updated);
      setMessage("Profile updated successfully.");
      toast.success("Profile updated successfully");
    } catch {
      setError("Failed to update profile.");
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword.trim()) {
      setError("Current password is required.");
      toast.error("Current password is required");
      return;
    }

    if (!newPassword.trim()) {
      setError("New password is required.");
      toast.error("New password is required");
      return;
    }
    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      setError(passwordError);
      toast.error(passwordError);
      return;
    }

    try {
      setSavingPassword(true);
      setError("");
      setMessage("");

      await changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password changed successfully.");
      toast.success("Password changed successfully");
    } catch {
      setError("Current password is incorrect.");
      toast.error("Current password is incorrect");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleResetProgress = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all your progress? This will remove all scheduled and completed workouts.",
    );

    if (!confirmed) return;

    try {
      setResetting(true);
      setError("");
      setMessage("");

      await resetProgress();

      window.dispatchEvent(new Event("user-workouts-updated"));

      setMessage("Progress reset successfully.");
      toast.success("Progress reset successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to reset progress.");
      toast.error("Failed to reset progress");
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");
      setMessage("");

      await deleteAccount();

      toast.success("Account deleted successfully");

      logout();
      navigate("/register");
    } catch (err) {
      console.error(err);
      setError(
        "Failed to delete account. Trainers with active workouts cannot delete their account yet.",
      );
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="muted">Loading profile...</p>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1>Profile</h1>
          <p>Manage your account information and security settings.</p>
        </div>
      </div>

      {message && <div className="profile-success">{message}</div>}
      {error && <div className="profile-error">{error}</div>}

      <div className="profile-grid">
        <div className="profile-card profile-summary">
          <div className="avatar">
            {profile?.name?.charAt(0)?.toUpperCase()}
          </div>

          <h2>{profile?.name}</h2>
          <p>{profile?.email}</p>

          <div className="profile-badges">
            <span>
              <Shield size={13} />
              {profile?.role}
            </span>

            <span>
              <BadgeCheck size={13} />
              {profile?.membership ?? "No membership"}
            </span>
          </div>
        </div>

        <form className="profile-card" onSubmit={saveProfile}>
          <div className="card-title">
            <User size={18} />
            <div>
              <h3>Personal information</h3>
              <p>Update your public profile details.</p>
            </div>
          </div>

          <div className="profile-group">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="profile-group">
            <label>Email</label>
            <div className="readonly-field">
              <Mail size={15} />
              {profile?.email}
            </div>
          </div>

          <button className="profile-btn primary" disabled={savingProfile}>
            {savingProfile ? "Saving..." : "Save profile"}
          </button>
        </form>

        <form className="profile-card security-card" onSubmit={savePassword}>
          <div className="card-title">
            <Lock size={18} />
            <div>
              <h3>Security</h3>
              <p>Change your account password.</p>
            </div>
          </div>

          <div className="profile-group">
            <label>Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
            />
          </div>

          <div className="profile-group">
            <label>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
            />

            <p className="profile-password-hint">
              Minimum 10 characters, one uppercase letter, one lowercase letter
              and one number.
            </p>
          </div>

          <button className="profile-btn primary" disabled={savingPassword}>
            {savingPassword ? "Changing..." : "Change password"}
          </button>
        </form>
      </div>
      <div className="profile-card danger-zone-card">
        <div className="card-title danger-title">
          <Trash2 size={18} />
          <div>
            <h3>Danger zone</h3>
            <p>Reset your training data or permanently delete your account.</p>
          </div>
        </div>

        <div className="danger-action">
          <div>
            <h4>Reset progress</h4>
            <p>
              Remove all scheduled and completed workouts from your account.
            </p>
          </div>

          <button
            type="button"
            className="profile-btn warning"
            onClick={handleResetProgress}
            disabled={resetting}
          >
            <RotateCcw size={15} />
            {resetting ? "Resetting..." : "Reset progress"}
          </button>
        </div>

        <div className="danger-action">
          <div>
            <h4>Delete account</h4>
            <p>Permanently delete your account and verification data.</p>
          </div>

          <button
            type="button"
            className="profile-btn danger"
            onClick={handleDeleteAccount}
            disabled={deleting}
          >
            <Trash2 size={15} />
            {deleting ? "Deleting..." : "Delete account"}
          </button>
        </div>
      </div>
    </div>
  );
}
