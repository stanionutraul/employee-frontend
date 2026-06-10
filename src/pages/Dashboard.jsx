import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  CalendarClock,
  Users,
  Plus,
  ArrowUpRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

import "../styles/dashboard.css";

function formatDateTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) return <p className="muted">Loading...</p>;
  if (!user) return <p className="muted">Not logged in</p>;

  return user.role === "TRAINER" ? (
    <TrainerDashboard user={user} />
  ) : (
    <UserDashboard user={user} />
  );
}

function PageHeader({ title, subtitle, action }) {
  return (
    <div className="dashboard-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {action}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-icon">
          <Icon size={20} />
        </div>

        {hint && (
          <span className="stat-hint">
            <ArrowUpRight size={14} />
            {hint}
          </span>
        )}
      </div>

      <div className="stat-content">
        <h2>{value}</h2>
        <p>{label}</p>
      </div>
    </div>
  );
}

function UserDashboard({ user }) {
  const [items, setItems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setError("");

      const res = await api.get(`/user-workouts/user/${user.id}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    window.addEventListener("focus", fetchDashboard);
    window.addEventListener("user-workouts-updated", fetchDashboard);

    return () => {
      window.removeEventListener("focus", fetchDashboard);
      window.removeEventListener("user-workouts-updated", fetchDashboard);
    };
  }, [user.id]);

  const stats = useMemo(() => {
    const now = new Date();

    const ownItems = items.filter((item) => item.userId === user.id);

    const upcoming = ownItems
      .filter((item) => !item.completed && new Date(item.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const completed = ownItems.filter((item) => item.completed).length;

    const thisWeek = ownItems
      .filter((item) => {
        const d = new Date(item.date);
        const diff = d.getTime() - now.getTime();

        return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      upcomingCount: upcoming.length,
      completedCount: completed,
      nextWorkout: upcoming[0],
      thisWeek,
    };
  }, [items, user.id]);

  if (loadingData) return <p className="muted">Loading dashboard...</p>;

  return (
    <div className="dashboard-page">
      <PageHeader
        title={`Hey, ${user.name.split(" ")[0]}`}
        subtitle="Your training overview."
      />

      {error && <p className="error">{error}</p>}

      <div className="stats-grid">
        <StatCard
          icon={Activity}
          label="Upcoming workouts"
          value={stats.upcomingCount}
        />

        <StatCard
          icon={CheckCircle2}
          label="Completed sessions"
          value={stats.completedCount}
        />

        <StatCard
          icon={CalendarClock}
          label="Next workout"
          value={
            stats.nextWorkout ? formatDateTime(stats.nextWorkout.date) : "—"
          }
        />
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div>
            <h3>This week</h3>
            <p>Your next sessions for the coming days.</p>
          </div>
        </div>

        <div className="workout-feed">
          {stats.thisWeek.length === 0 ? (
            <div className="dashboard-empty">
              No workouts planned this week.
            </div>
          ) : (
            stats.thisWeek.map((item) => (
              <div key={item.id} className="workout-item">
                <div className="workout-info">
                  <h4>{item.workoutName}</h4>
                  <p>{formatDateTime(item.date)}</p>
                </div>

                <span className={`tag ${item.completed ? "" : "active"}`}>
                  {item.completed ? "Completed" : "Scheduled"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TrainerDashboard({ user }) {
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setError("");

      const [workoutsRes, sessionsRes] = await Promise.all([
        api.get("/workouts"),
        api.get("/user-workouts"),
      ]);

      setWorkouts(workoutsRes.data);
      setSessions(sessionsRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    window.addEventListener("focus", fetchDashboard);
    window.addEventListener("user-workouts-updated", fetchDashboard);

    return () => {
      window.removeEventListener("focus", fetchDashboard);
      window.removeEventListener("user-workouts-updated", fetchDashboard);
    };
  }, [user.id]);

  const stats = useMemo(() => {
    const now = new Date();

    const trainerWorkouts = workouts.filter(
      (workout) => workout.trainerId === user.id,
    );

    const trainerWorkoutIds = new Set(trainerWorkouts.map((w) => w.id));

    const trainerSessions = sessions.filter((session) =>
      trainerWorkoutIds.has(session.workoutId),
    );

    const uniqueMembers = new Set(
      trainerSessions
        .filter((session) => session.userId !== user.id)
        .map((session) => session.userId),
    );

    const topWorkouts = trainerWorkouts
      .map((workout) => {
        const workoutSessions = trainerSessions.filter(
          (session) => session.workoutId === workout.id,
        );

        return {
          ...workout,
          sessions: workoutSessions.length,
        };
      })
      .sort((a, b) => b.sessions - a.sessions);

    const myUpcoming = sessions
      .filter(
        (session) =>
          session.userId === user.id &&
          !session.completed &&
          new Date(session.date) >= now,
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      members: uniqueMembers.size,
      workoutCount: trainerWorkouts.length,
      topWorkouts,
      myUpcoming,
    };
  }, [workouts, sessions, user.id]);

  if (loadingData) return <p className="muted">Loading dashboard...</p>;

  return (
    <div className="dashboard-page">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Your trainer overview."
        action={
          <button
            className="primary-btn"
            onClick={() => navigate("/create-workout")}
          >
            <Plus size={16} />
            Create workout
          </button>
        }
      />

      {error && <p className="error">{error}</p>}

      <div className="stats-grid">
        <StatCard icon={Users} label="Members" value={stats.members} />

        <StatCard
          icon={Activity}
          label="Workout library"
          value={stats.workoutCount}
        />

        <StatCard
          icon={CalendarClock}
          label="My upcoming workouts"
          value={stats.myUpcoming.length}
        />
      </div>

      <div className="trainer-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h3>Most scheduled programs</h3>
              <p>Your workouts ranked by scheduled sessions.</p>
            </div>
          </div>

          <div className="manage-list">
            {stats.topWorkouts.length === 0 ? (
              <div className="dashboard-empty">No workout activity yet.</div>
            ) : (
              stats.topWorkouts.slice(0, 5).map((workout) => (
                <div key={workout.id} className="manage-item">
                  <div className="manage-icon">
                    <Activity size={18} />
                  </div>

                  <div className="manage-content">
                    <h4>{workout.name}</h4>
                    <span>{workout.sessions} scheduled sessions</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h3>My next workouts</h3>
              <p>Your personal training schedule.</p>
            </div>
          </div>

          <div className="manage-list">
            {stats.myUpcoming.length === 0 ? (
              <div className="dashboard-empty">
                No personal workouts scheduled.
              </div>
            ) : (
              stats.myUpcoming.slice(0, 5).map((item) => (
                <div key={item.id} className="manage-item">
                  <div className="manage-icon">
                    <CalendarClock size={18} />
                  </div>

                  <div className="manage-content">
                    <h4>{item.workoutName}</h4>
                    <span>{formatDateTime(item.date)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
