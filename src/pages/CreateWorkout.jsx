import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Sparkles } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { createWorkout } from "../api/workoutApi";

import "../styles/create-workout.css";

export default function CreateWorkout() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Workout name is required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createWorkout({
        name,
        description,
        trainerId: user.id,
      });

      navigate("/workouts");
    } catch (err) {
      console.error(err);
      setError("Failed to create workout");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-page">
      <div className="create-container">
        <div className="create-header">
          <div className="create-badge">
            <Sparkles size={14} />
            <span>New program</span>
          </div>

          <h1>Create a workout</h1>

          <p>Design a new training session for your members.</p>
        </div>

        <form className="create-card" onSubmit={submit}>
          <div className="cw-group">
            <label>Workout name</label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Push Day"
            />
          </div>

          <div className="cw-group">
            <label>Description</label>

            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the workout..."
            />
          </div>

          {error && (
            <p
              style={{
                color: "#ff6b6b",
                marginTop: "10px",
              }}
            >
              {error}
            </p>
          )}

          <div className="cw-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/workouts")}
            >
              Cancel
            </button>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Creating..." : "Create workout"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
