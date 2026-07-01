import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  History,
  ListChecks,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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

const TABS = [
  { key: "weekly", label: "Weekly" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
];

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + 1;

  d.setDate(diff);
  d.setHours(0, 0, 0, 0);

  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(dateStr) {
  if (!dateStr) return "";

  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";

  return new Date(dateStr).toLocaleString([], {
    day: "2-digit",
    month: "short",
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

function getAccountWeekStart(user) {
  if (!user?.createdAt) {
    return startOfWeek(new Date());
  }

  return startOfWeek(new Date(user.createdAt));
}

function getStatus(item) {
  if (item.status) return item.status;
  return item.completed ? "COMPLETED" : "SCHEDULED";
}

export default function MyWorkoutsPage() {
  const { user } = useAuth();

  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [pendingReview, setPendingReview] = useState([]);
  const [activeTab, setActiveTab] = useState("weekly");
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState("");

  const accountWeekStart = useMemo(() => {
    return getAccountWeekStart(user);
  }, [user?.createdAt]);

  const cannotGoPrev = useMemo(() => {
    return weekStart.getTime() <= accountWeekStart.getTime();
  }, [weekStart, accountWeekStart]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/user-workouts/user/${user.id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load your workouts.");
      toast.error("Failed to load workouts");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReview = async () => {
    if (!user?.id) return;

    try {
      const res = await api.get(
        `/user-workouts/user/${user.id}/pending-review`,
      );
      setPendingReview(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const minWeekStart = getAccountWeekStart(user);

    setWeekStart((current) => {
      if (current.getTime() < minWeekStart.getTime()) {
        return minWeekStart;
      }

      return current;
    });

    fetchWorkouts();
    fetchPendingReview();

    const handler = () => {
      fetchWorkouts();
      fetchPendingReview();
    };

    window.addEventListener("user-workouts-updated", handler);

    return () => {
      window.removeEventListener("user-workouts-updated", handler);
    };
  }, [user?.id, user?.createdAt]);

  const markCompleted = async (id) => {
    try {
      const res = await api.put(`/user-workouts/${id}/complete`);

      setData((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, ...res.data, completed: true } : w,
        ),
      );

      setPendingReview((prev) => prev.filter((w) => w.id !== id));

      toast.success("Workout completed");

      window.dispatchEvent(new Event("user-workouts-updated"));
    } catch (err) {
      console.error(err);
      setError("Failed to complete workout.");
      toast.error("Failed to complete workout");
    }
  };

  const markMissed = async (id) => {
    try {
      setReviewLoading(true);

      const res = await api.put(`/user-workouts/${id}/missed`);

      setData((prev) => prev.map((w) => (w.id === id ? res.data : w)));

      setPendingReview((prev) => prev.filter((w) => w.id !== id));

      toast.success("Workout marked as missed");

      window.dispatchEvent(new Event("user-workouts-updated"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark workout as missed");
    } finally {
      setReviewLoading(false);
    }
  };

  const clearWorkout = async (id) => {
    try {
      await api.delete(`/user-workouts/${id}`);

      setData((prev) => prev.filter((w) => w.id !== id));
      setPendingReview((prev) => prev.filter((w) => w.id !== id));

      toast.success("Workout removed");

      window.dispatchEvent(new Event("user-workouts-updated"));
    } catch (err) {
      console.error(err);
      setError("Failed to clear workout.");
      toast.error("Failed to clear workout");
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

  const listItems = useMemo(() => {
    const now = new Date();

    if (activeTab === "upcoming") {
      return data
        .filter(
          (item) =>
            getStatus(item) === "SCHEDULED" && new Date(item.date) >= now,
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    if (activeTab === "completed") {
      return data
        .filter((item) => getStatus(item) === "COMPLETED")
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (activeTab === "all") {
      return [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return [];
  }, [activeTab, data]);

  const prevWeek = () => {
    if (cannotGoPrev) return;

    setWeekStart((current) => {
      const previous = addDays(current, -7);

      if (previous.getTime() < accountWeekStart.getTime()) {
        return accountWeekStart;
      }

      return previous;
    });
  };

  const nextWeek = () => {
    setWeekStart((current) => addDays(current, 7));
  };

  if (!user) return <p className="muted">Please login</p>;

  return (
    <div className="my-page">
      {pendingReview.length > 0 && (
        <div className="review-overlay">
          <div className="review-modal">
            <div className="review-icon">
              <AlertCircle size={24} />
            </div>

            <h2>Workout review</h2>

            <p>
              You have {pendingReview.length} past workout
              {pendingReview.length > 1 ? "s" : ""} waiting for review. Did you
              complete {pendingReview.length > 1 ? "them" : "it"}?
            </p>

            <div className="review-list">
              {pendingReview.map((item) => (
                <div key={item.id} className="review-item">
                  <div>
                    <h4>{item.workoutName}</h4>
                    <span>{formatDateTime(item.date)}</span>
                  </div>

                  <div className="review-actions">
                    <button
                      className="mini-btn complete"
                      disabled={reviewLoading}
                      onClick={() => markCompleted(item.id)}
                    >
                      Completed
                    </button>

                    <button
                      className="mini-btn missed"
                      disabled={reviewLoading}
                      onClick={() => markMissed(item.id)}
                    >
                      Missed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="my-header">
        <div>
          <h1>My Workouts</h1>
          <p>Your weekly schedule, upcoming sessions and completed history.</p>
        </div>
      </div>

      <div className="my-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`my-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="my-error">{error}</p>}

      {loading ? (
        <div className="timeline-skeleton" />
      ) : activeTab === "weekly" ? (
        <>
          <div className="week-bar">
            <button
              className="week-btn"
              onClick={prevWeek}
              disabled={cannotGoPrev}
              title={
                cannotGoPrev
                  ? "You cannot view weeks before your account was created."
                  : "Previous week"
              }
            >
              <ChevronLeft size={16} />
            </button>

            <div className="week-label">{formatWeekLabel(weekStart)}</div>

            <button className="week-btn" onClick={nextWeek}>
              <ChevronRight size={16} />
            </button>
          </div>

          {cannotGoPrev && (
            <p className="week-limit-note">
              You can view workouts starting from the week your account was
              created.
            </p>
          )}

          <div className="timeline">
            <div className="timeline-line" />

            <ul className="timeline-list">
              {weekDays.map((d, index) => {
                const hasWorkouts = d.workouts.length > 0;
                const allCompleted =
                  hasWorkouts &&
                  d.workouts.every((w) => getStatus(w) === "COMPLETED");

                return (
                  <li key={index} className="timeline-item">
                    <div
                      className={`timeline-icon ${
                        allCompleted
                          ? "completed"
                          : hasWorkouts
                            ? "planned"
                            : ""
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
                          {!hasWorkouts && (
                            <p className="rest-text">Rest day</p>
                          )}
                        </div>

                        {!hasWorkouts && (
                          <span className="status free">Free</span>
                        )}
                      </div>

                      {hasWorkouts && (
                        <div className="workout-list">
                          {d.workouts.map((w) => {
                            const status = getStatus(w);

                            return (
                              <div key={w.id} className="workout-row">
                                <div
                                  className="workout-info clickable"
                                  onClick={() =>
                                    navigate(`/workouts/${w.workoutId}`)
                                  }
                                >
                                  <h4>{w.workoutName}</h4>
                                  <span>{formatTime(w.date)}</span>
                                </div>

                                <div className="workout-actions">
                                  {status === "MISSED" && (
                                    <span className="mini-status missed">
                                      Missed
                                    </span>
                                  )}

                                  {status !== "MISSED" && (
                                    <button
                                      className={`mini-btn complete ${
                                        status === "COMPLETED" ? "active" : ""
                                      }`}
                                      onClick={() => markCompleted(w.id)}
                                      disabled={status === "COMPLETED"}
                                    >
                                      {status === "COMPLETED"
                                        ? "Completed"
                                        : "Complete"}
                                    </button>
                                  )}

                                  {status === "SCHEDULED" && (
                                    <button
                                      className="mini-btn clear"
                                      onClick={() => clearWorkout(w.id)}
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      ) : (
        <div className="history-panel">
          <div className="history-header">
            <div>
              <h3>
                {activeTab === "upcoming" && "Upcoming workouts"}
                {activeTab === "completed" && "Completed history"}
                {activeTab === "all" && "All workouts"}
              </h3>

              <p>
                {activeTab === "upcoming" &&
                  "Your future scheduled training sessions."}
                {activeTab === "completed" &&
                  "Workouts you already marked as completed."}
                {activeTab === "all" && "Your full workout activity timeline."}
              </p>
            </div>

            {activeTab === "completed" ? (
              <CheckCircle2 size={20} />
            ) : activeTab === "upcoming" ? (
              <CalendarClock size={20} />
            ) : (
              <History size={20} />
            )}
          </div>

          {listItems.length === 0 ? (
            <div className="history-empty">
              <ListChecks size={22} />
              <p>No workouts found here.</p>
            </div>
          ) : (
            <div className="history-list">
              {listItems.map((item) => {
                const status = getStatus(item);

                return (
                  <div key={item.id} className="history-item">
                    <div className="history-icon">
                      {status === "COMPLETED" ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <CalendarClock size={16} />
                      )}
                    </div>

                    <div
                      className="history-info clickable"
                      onClick={() => navigate(`/workouts/${item.workoutId}`)}
                    >
                      <h4>{item.workoutName}</h4>
                      <span>{formatDateTime(item.date)}</span>
                    </div>

                    <span className={`history-status ${status.toLowerCase()}`}>
                      {status === "COMPLETED" && "Completed"}
                      {status === "SCHEDULED" && "Scheduled"}
                      {status === "MISSED" && "Missed"}
                    </span>

                    {status === "SCHEDULED" && (
                      <div className="history-actions">
                        <button
                          className="mini-btn complete"
                          onClick={() => markCompleted(item.id)}
                        >
                          Complete
                        </button>

                        <button
                          className="mini-btn clear"
                          onClick={() => clearWorkout(item.id)}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
