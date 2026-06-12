import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  Dumbbell,
  Edit3,
  ListChecks,
  Plus,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import { getWorkoutById } from "../api/workoutApi";
import {
  addWorkoutExercise,
  deleteWorkoutExercise,
  getWorkoutExercises,
  updateWorkoutExercise,
} from "../api/workoutExerciseApi";
import { useAuth } from "../context/AuthContext";
import ScheduleModal from "./ScheduleModal";

import "../styles/workout-details.css";

function formatEnum(value) {
  if (!value) return "—";

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const emptyExercise = {
  name: "",
  sets: 3,
  reps: "8-10",
  notes: "",
};

export default function WorkoutDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);

  const [loading, setLoading] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [error, setError] = useState("");

  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [exerciseForm, setExerciseForm] = useState(emptyExercise);
  const [savingExercise, setSavingExercise] = useState(false);

  const canManageWorkout =
    user?.role === "ADMIN" ||
    (user?.role === "TRAINER" && workout?.trainerId === user?.id);

  const loadWorkout = async () => {
    try {
      setLoading(true);
      setError("");

      const [workoutData, exerciseData] = await Promise.all([
        getWorkoutById(id),
        getWorkoutExercises(id),
      ]);

      setWorkout(workoutData);
      setExercises(exerciseData);
    } catch (err) {
      console.error(err);
      setError("Failed to load workout.");
      toast.error("Failed to load workout");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkout();
  }, [id]);

  const openAddExercise = () => {
    setEditingExercise(null);
    setExerciseForm({ ...emptyExercise });
    setExerciseModalOpen(true);
  };

  const openEditExercise = (exercise) => {
    setEditingExercise(exercise);
    setExerciseForm({
      name: exercise.name ?? "",
      sets: exercise.sets ?? 3,
      reps: exercise.reps ?? "8-10",
      notes: exercise.notes ?? "",
    });
    setExerciseModalOpen(true);
  };

  const closeExerciseModal = () => {
    setExerciseModalOpen(false);
    setEditingExercise(null);
    setExerciseForm({ ...emptyExercise });
  };

  const handleExerciseChange = (field, value) => {
    setExerciseForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveExercise = async (e) => {
    e.preventDefault();

    if (!exerciseForm.name.trim()) {
      toast.error("Exercise name is required");
      return;
    }

    if (!exerciseForm.sets || Number(exerciseForm.sets) <= 0) {
      toast.error("Sets must be greater than 0");
      return;
    }

    try {
      setSavingExercise(true);

      const payload = {
        name: exerciseForm.name.trim(),
        sets: Number(exerciseForm.sets),
        reps: exerciseForm.reps,
        notes: exerciseForm.notes,
        position: editingExercise
          ? editingExercise.position
          : exercises.length + 1,
      };

      if (editingExercise) {
        const updated = await updateWorkoutExercise(
          editingExercise.id,
          payload,
        );

        setExercises((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );

        toast.success("Exercise updated");
      } else {
        const created = await addWorkoutExercise(workout.id, payload);

        setExercises((prev) =>
          [...prev, created].sort(
            (a, b) => (a.position ?? 0) - (b.position ?? 0),
          ),
        );

        toast.success("Exercise added");
      }

      closeExerciseModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save exercise");
    } finally {
      setSavingExercise(false);
    }
  };

  const removeExercise = async (exerciseId) => {
    try {
      await deleteWorkoutExercise(exerciseId);

      setExercises((prev) => prev.filter((item) => item.id !== exerciseId));

      toast.success("Exercise deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete exercise");
    }
  };

  if (loading) return <p className="muted">Loading workout...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!workout) return <p className="muted">Workout not found.</p>;

  return (
    <div className="details-page">
      <button className="back-btn" onClick={() => navigate("/workouts")}>
        <ArrowLeft size={16} />
        Back to workouts
      </button>

      <div className="details-hero">
        <div>
          <div className="details-badge">
            <Dumbbell size={14} />
            {formatEnum(workout.category)}
          </div>

          <h1>{workout.name}</h1>

          <p>{workout.description}</p>
        </div>

        <button
          className="details-primary"
          onClick={() => setScheduleOpen(true)}
        >
          <CalendarClock size={16} />
          Schedule workout
        </button>
      </div>

      <div className="details-grid">
        <div className="details-card">
          <Clock size={20} />
          <span>Duration</span>
          <strong>{workout.durationMinutes ?? "—"} min</strong>
        </div>

        <div
          className={`details-card difficulty ${String(
            workout.difficulty,
          ).toLowerCase()}`}
        >
          <Shield size={20} />
          <span>Difficulty</span>
          <strong>{formatEnum(workout.difficulty)}</strong>
        </div>

        <div className="details-card">
          <User size={20} />
          <span>Trainer</span>
          <strong>{workout.trainerName ?? "—"}</strong>
        </div>
      </div>

      <div className="details-content">
        <div className="details-panel">
          <div className="panel-title workout-builder-title">
            <div className="panel-title-left">
              <ListChecks size={18} />

              <div>
                <h3>About this workout</h3>
                <p>Exercise structure, sets, reps and trainer notes.</p>
              </div>
            </div>

            {canManageWorkout && (
              <button className="exercise-add-btn" onClick={openAddExercise}>
                <Plus size={15} />
                Add exercise
              </button>
            )}
          </div>

          {exercises.length === 0 ? (
            <div className="empty-exercises">
              No exercises added yet for this workout.
            </div>
          ) : (
            <div className="exercise-list">
              {exercises.map((exercise, index) => (
                <div key={exercise.id} className="exercise-item">
                  <div className="exercise-number">{index + 1}</div>

                  <div className="exercise-main">
                    <div className="exercise-top">
                      <h4>{exercise.name}</h4>

                      <span>
                        {exercise.sets} sets · {exercise.reps || "—"} reps
                      </span>
                    </div>

                    {exercise.notes && <p>{exercise.notes}</p>}
                  </div>

                  {canManageWorkout && (
                    <div className="exercise-actions">
                      <button
                        type="button"
                        onClick={() => openEditExercise(exercise)}
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        type="button"
                        className="danger"
                        onClick={() => removeExercise(exercise.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="details-panel side">
          <h3>Program info</h3>

          <div className="info-row">
            <span>Category</span>
            <strong>{formatEnum(workout.category)}</strong>
          </div>

          <div className="info-row">
            <span>Difficulty</span>
            <strong>{formatEnum(workout.difficulty)}</strong>
          </div>

          <div className="info-row">
            <span>Duration</span>
            <strong>{workout.durationMinutes ?? "—"} min</strong>
          </div>

          <div className="info-row">
            <span>Created by</span>
            <strong>{workout.trainerName ?? "—"}</strong>
          </div>

          <button
            className="side-schedule-btn"
            onClick={() => setScheduleOpen(true)}
          >
            <CalendarClock size={15} />
            Schedule this workout
          </button>
        </div>
      </div>

      {exerciseModalOpen && (
        <div
          className="exercise-modal-overlay"
          onMouseDown={closeExerciseModal}
        >
          <form
            className="exercise-modal"
            onSubmit={saveExercise}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="exercise-modal-header">
              <div>
                <h3>{editingExercise ? "Edit exercise" : "Add exercise"}</h3>
                <p>
                  {editingExercise
                    ? "Update the exercise structure."
                    : "Add a new exercise to this workout."}
                </p>
              </div>

              <button type="button" onClick={closeExerciseModal}>
                <X size={18} />
              </button>
            </div>

            <div className="exercise-form-group">
              <label>Exercise name</label>
              <input
                value={exerciseForm.name}
                onChange={(e) => handleExerciseChange("name", e.target.value)}
                placeholder="e.g. Bench Press"
              />
            </div>

            <div className="exercise-form-grid">
              <div className="exercise-form-group">
                <label>Sets</label>
                <input
                  type="number"
                  min={1}
                  value={exerciseForm.sets}
                  onChange={(e) => handleExerciseChange("sets", e.target.value)}
                />
              </div>

              <div className="exercise-form-group">
                <label>Reps</label>
                <input
                  value={exerciseForm.reps}
                  onChange={(e) => handleExerciseChange("reps", e.target.value)}
                  placeholder="8-10"
                />
              </div>
            </div>

            <div className="exercise-form-group">
              <label>Notes</label>
              <textarea
                rows={4}
                value={exerciseForm.notes}
                onChange={(e) => handleExerciseChange("notes", e.target.value)}
                placeholder="e.g. Progressive overload, controlled negative."
              />
            </div>

            <div className="exercise-modal-actions">
              <button
                type="button"
                className="exercise-secondary-btn"
                onClick={closeExerciseModal}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="exercise-primary-btn"
                disabled={savingExercise}
              >
                {savingExercise
                  ? "Saving..."
                  : editingExercise
                    ? "Save changes"
                    : "Add exercise"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        workout={workout}
        user={user}
      />
    </div>
  );
}
