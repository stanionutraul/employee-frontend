import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { X, Plus, Sparkles } from "lucide-react";

import "../styles/create-workout.css";

const SUGGESTED = [
  "Strength",
  "Cardio",
  "Hypertrophy",
  "Mobility",
  "Power",
  "Core",
  "Endurance",
];

export default function CreateWorkout() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("45");

  const [tags, setTags] = useState(["Strength"]);

  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const submit = (e) => {
    e.preventDefault();

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);

      navigate("/workouts");
    }, 700);
  };

  return (
    <div className="create-page">
      <div className="create-container">
        {/* HEADER */}
        <div className="create-header">
          <div className="create-badge">
            <Sparkles size={14} />

            <span>New program</span>
          </div>

          <h1>Create a workout</h1>

          <p>Design a new training session for your members.</p>
        </div>

        {/* FORM */}
        <form className="create-card" onSubmit={submit}>
          {/* NAME */}
          <div className="cw-group">
            <label>Workout name</label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Push Strength Fundamentals"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="cw-group">
            <label>Description</label>

            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this session about? Who is it for?"
            />
          </div>

          {/* DURATION */}
          <div className="cw-group">
            <label>Duration (minutes)</label>

            <input
              type="number"
              min={5}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {/* TAGS */}
          <div className="cw-group">
            <label>Tags</label>

            <div className="selected-tags">
              {tags.map((tag) => (
                <div key={tag} className="selected-tag">
                  <span>{tag}</span>

                  <button type="button" onClick={() => toggleTag(tag)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="suggested-tags">
              {SUGGESTED.filter((s) => !tags.includes(s)).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="suggested-tag"
                  onClick={() => toggleTag(tag)}
                >
                  <Plus size={12} />

                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ACTIONS */}
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
