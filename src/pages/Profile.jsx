import { useEffect, useState } from "react";
import { Shield, User, Mail, Lock, BadgeCheck } from "lucide-react";

import { getProfile, updateProfile, changePassword } from "../api/profileApi";

import toast from "react-hot-toast";

import "../styles/profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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

    if (newPassword.length < 4) {
      setError("New password must be at least 4 characters.");
      toast.error("Password must be at least 4 characters");
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
          </div>

          <button className="profile-btn primary" disabled={savingPassword}>
            {savingPassword ? "Changing..." : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}
