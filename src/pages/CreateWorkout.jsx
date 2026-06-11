import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Sparkles, Trash2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { createWorkout } from "../api/workoutApi";
import { addWorkoutExercise } from "../api/workoutExerciseApi";
import toast from "react-hot-toast";

import "../styles/create-workout.css";

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

const CATEGORIES = [
  "STRENGTH",
  "CARDIO",
  "HYPERTROPHY",
  "MOBILITY",
  "CORE",
  "ENDURANCE",
  "POWER",
];

const emptyExercise = {
  name: "",
  sets: 3,
  reps: "8-10",
  notes: "",
};

export default function CreateWorkout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [category, setCategory] = useState("STRENGTH");
  const [exercises, setExercises] = useState([{ ...emptyExercise }]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateExercise = (index, field, value) => {
    setExercises((prev) =>
      prev.map((exercise, i) =>
        i === index ? { ...exercise, [field]: value } : exercise,
      ),
    );
  };

  const addExerciseRow = () => {
    setExercises((prev) => [...prev, { ...emptyExercise }]);
  };

  const removeExerciseRow = (index) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setError("Workout description is required");
      toast.error("Workout description is required");
      return;
    }

    if (!durationMinutes || Number(durationMinutes) < 5) {
      setError("Duration must be at least 5 minutes");
      toast.error("Duration must be at least 5 minutes");
      return;
    }

    const validExercises = exercises.filter((exercise) => exercise.name.trim());

    if (validExercises.length === 0) {
      setError("Add at least one exercise");
      toast.error("Add at least one exercise");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const createdWorkout = await createWorkout({
        name,
        description,
        durationMinutes: Number(durationMinutes),
        difficulty,
        category,
        trainerId: user.id,
      });

      await Promise.all(
        validExercises.map((exercise, index) =>
          addWorkoutExercise(createdWorkout.id, {
            name: exercise.name.trim(),
            sets: Number(exercise.sets),
            reps: exercise.reps,
            notes: exercise.notes,
            position: index + 1,
          }),
        ),
      );

      toast.success("Workout created successfully");
      navigate(`/workouts/${createdWorkout.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create workout");
      toast.error("Failed to create workout");
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
          <p>Design a complete training session for your members.</p>
        </div>

        <form className="create-card" onSubmit={submit}>
          <div className="cw-section">
            <div className="cw-section-title">
              <h3>Workout details</h3>
              <p>Short overview shown on workout cards.</p>
            </div>

            <div className="cw-group">
              <label>Workout name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Push Day"
              />
            </div>

            <div className="cw-group">
              <label>Short description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Perfect push day if you don't have enough time."
              />
            </div>

            <div className="cw-grid">
              <div className="cw-group">
                <label>Duration</label>
                <input
                  type="number"
                  min={5}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="45"
                />
              </div>

              <div className="cw-group">
                <label>Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  {DIFFICULTIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="cw-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="cw-section">
            <div className="cw-section-title with-action">
              <div>
                <h3>Exercises</h3>
                <p>These will appear in the workout details page.</p>
              </div>

              <button
                type="button"
                className="add-exercise-btn"
                onClick={addExerciseRow}
              >
                <Plus size={15} />
                Add exercise
              </button>
            </div>

            <div className="exercise-builder">
              {exercises.map((exercise, index) => (
                <div key={index} className="exercise-builder-card">
                  <div className="exercise-builder-top">
                    <span>Exercise {index + 1}</span>

                    {exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExerciseRow(index)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div className="cw-group">
                    <label>Exercise name</label>
                    <input
                      value={exercise.name}
                      onChange={(e) =>
                        updateExercise(index, "name", e.target.value)
                      }
                      placeholder="e.g. Bench Press"
                    />
                  </div>

                  <div className="cw-grid">
                    <div className="cw-group">
                      <label>Sets</label>
                      <input
                        type="number"
                        min={1}
                        value={exercise.sets}
                        onChange={(e) =>
                          updateExercise(index, "sets", e.target.value)
                        }
                      />
                    </div>

                    <div className="cw-group">
                      <label>Reps</label>
                      <input
                        value={exercise.reps}
                        onChange={(e) =>
                          updateExercise(index, "reps", e.target.value)
                        }
                        placeholder="8-10"
                      />
                    </div>
                  </div>

                  <div className="cw-group">
                    <label>Notes</label>
                    <textarea
                      rows={3}
                      value={exercise.notes}
                      onChange={(e) =>
                        updateExercise(index, "notes", e.target.value)
                      }
                      placeholder="e.g. Progressive overload, controlled negative."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="cw-error">{error}</p>}

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
