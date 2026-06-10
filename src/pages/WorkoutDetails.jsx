import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  Dumbbell,
  ListChecks,
  Shield,
  User,
} from "lucide-react";

import { getWorkoutById } from "../api/workoutApi";
import { getWorkoutExercises } from "../api/workoutExerciseApi";
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

export default function WorkoutDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);

  const [loading, setLoading] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorkout = async () => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [id]);

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
          <div className="panel-title">
            <ListChecks size={18} />
            <div>
              <h3>About this workout</h3>
              <p>Exercise structure, sets, reps and trainer notes.</p>
            </div>
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

      <ScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        workout={workout}
        user={user}
      />
    </div>
  );
}
