import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/myworkouts.css";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + 1;
  return new Date(d.setDate(diff));
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

function formatTime(dateStr) {
  if (!dateStr) return "";

  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatWeekLabel(start) {
  const end = addDays(start, 6);
  const opts = { day: "numeric", month: "long" };

  return `${start.toLocaleDateString("en-GB", opts)} – ${end.toLocaleDateString(
    "en-GB",
    opts,
  )}`;
}

export default function MyWorkoutsPage() {
  const { user } = useAuth();

  const [data, setData] = useState([]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/user-workouts/user/${user.id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load your workouts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchWorkouts();

    const handler = () => fetchWorkouts();
    window.addEventListener("user-workouts-updated", handler);

    return () => {
      window.removeEventListener("user-workouts-updated", handler);
    };
  }, [user?.id]);

  const markCompleted = async (id) => {
    try {
      await api.put(`/user-workouts/${id}/complete`);

      setData((prev) =>
        prev.map((w) => (w.id === id ? { ...w, completed: true } : w)),
      );
    } catch (err) {
      console.error(err);
      setError("Failed to complete workout.");
    }
  };

  const clearWorkout = async (id) => {
    try {
      await api.delete(`/user-workouts/${id}`);
      setData((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to clear workout.");
    }
  };

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(weekStart, i);
      const dateStr = formatDate(date);

      const workoutsForDay = data
        .filter((w) => w.date?.slice(0, 10) === dateStr)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 2);

      return {
        date,
        day: DAYS[date.getDay()],
        workouts: workoutsForDay,
      };
    });
  }, [data, weekStart]);

  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));

  if (!user) return <p className="muted">Please login</p>;

  return (
    <div className="my-page">
      <div className="my-header">
        <div>
          <h1>My Workouts</h1>
          <p>Your weekly training schedule at a glance.</p>
        </div>
      </div>

      <div className="week-bar">
        <button className="week-btn" onClick={prevWeek}>
          <ChevronLeft size={16} />
        </button>

        <div className="week-label">{formatWeekLabel(weekStart)}</div>

        <button className="week-btn" onClick={nextWeek}>
          <ChevronRight size={16} />
        </button>
      </div>

      {error && <p className="my-error">{error}</p>}

      {loading ? (
        <div className="timeline-skeleton" />
      ) : (
        <div className="timeline">
          <div className="timeline-line" />

          <ul className="timeline-list">
            {weekDays.map((d, index) => {
              const hasWorkouts = d.workouts.length > 0;
              const allCompleted =
                hasWorkouts && d.workouts.every((w) => w.completed);

              return (
                <li key={index} className="timeline-item">
                  <div
                    className={`timeline-icon ${
                      allCompleted ? "completed" : hasWorkouts ? "planned" : ""
                    }`}
                  >
                    {allCompleted ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <CalendarClock size={16} />
                    )}
                  </div>

                  <div className="timeline-card">
                    <div className="timeline-card-header">
                      <div>
                        <h3>{d.day}</h3>
                        {!hasWorkouts && <p className="rest-text">Rest day</p>}
                      </div>

                      {!hasWorkouts && (
                        <span className="status free">Free</span>
                      )}
                    </div>

                    {hasWorkouts && (
                      <div className="workout-list">
                        {d.workouts.map((w) => (
                          <div key={w.id} className="workout-row">
                            <div className="workout-info">
                              <h4>{w.workoutName}</h4>
                              <span>{formatTime(w.date)}</span>
                            </div>

                            <div className="workout-actions">
                              <button
                                className={`mini-btn complete ${w.completed ? "active" : ""}`}
                                onClick={() => markCompleted(w.id)}
                                disabled={w.completed}
                              >
                                {w.completed ? "Completed" : "Complete"}
                              </button>

                              {!w.completed && (
                                <button
                                  className="mini-btn clear"
                                  onClick={() => clearWorkout(w.id)}
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
