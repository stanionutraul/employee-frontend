import { useEffect, useMemo, useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";

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

// doar ora
function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 6 June – 14 June
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

  const fetchWorkouts = async () => {
    setLoading(true);
    const res = await api.get("/user-workouts");
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // COMPLETE
  const markCompleted = async (id) => {
    await api.put(`/user-workouts/${id}/complete`);
    fetchWorkouts();
  };

  // CLEAR
  const clearWorkout = async (id) => {
    await api.delete(`/user-workouts/${id}`);
    fetchWorkouts();
  };

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(weekStart, i);
      const dateStr = formatDate(date);

      const workoutsForDay = data
        .filter((w) => w.date?.slice(0, 10) === dateStr)
        .slice(0, 2); // MAX 2

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
        <h1>My Workouts</h1>
        <p className="muted">Weekly schedule</p>
      </div>

      {/* WEEK NAV */}
      <div className="week-bar">
        <button className="week-btn" onClick={prevWeek}>
          <ChevronLeft size={16} />
        </button>

        <div className="week-label">{formatWeekLabel(weekStart)}</div>

        <button className="week-btn" onClick={nextWeek}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* LIST */}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <ul className="timeline-list">
          {weekDays.map((d, index) => (
            <li key={index} className="timeline-item">
              <div className="timeline-icon">
                <CalendarClock size={16} />
              </div>

              <div className="timeline-card">
                <div className="timeline-top">
                  <div>
                    <div className="day">{d.day}</div>

                    {d.workouts.length === 0 && (
                      <div className="muted">Rest day</div>
                    )}

                    {d.workouts.map((w) => (
                      <div key={w.id} className="workout-item">
                        {w.workoutName} • {formatTime(w.date)}
                      </div>
                    ))}
                  </div>

                  <span className="status">
                    {d.workouts.length ? "Planned" : "Free"}
                  </span>
                  <div className="actions-right">
                    {d.workouts.map((w) => (
                      <div key={w.id} className="action-row">
                        <button
                          className={`btn-mini complete ${
                            w.completed ? "active" : ""
                          }`}
                          onClick={() => markCompleted(w.id)}
                        >
                          {w.completed ? "Completed" : "Complete"}
                        </button>

                        <button
                          className="btn-mini clear"
                          onClick={() => clearWorkout(w.id)}
                        >
                          Clear
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTIONS */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
