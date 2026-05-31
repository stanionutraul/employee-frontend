import {
  Activity,
  CheckCircle2,
  CalendarClock,
  Users,
  TrendingUp,
  Plus,
  ArrowUpRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "../styles/dashboard.css";

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Not logged in</p>;

  return user.role === "TRAINER" ? (
    <TrainerDashboard name={user.name} />
  ) : (
    <UserDashboard name={user.name} />
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

function UserDashboard({ name }) {
  return (
    <div className="dashboard-page">
      <PageHeader
        title={`Hey, ${name.split(" ")[0]}`}
        subtitle="Today's overview of your training."
      />

      <div className="stats-grid">
        <StatCard icon={Activity} label="Active workouts" value="—" />

        <StatCard icon={CheckCircle2} label="Completed sessions" value="—" />

        <StatCard icon={CalendarClock} label="Next workout" value="—" />
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3>Workout Feed</h3>
        </div>

        <p>
          Dashboard integration will be connected after user-workouts API is
          wired.
        </p>
      </div>
    </div>
  );
}

function TrainerDashboard({ name }) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-page">
      <PageHeader
        title={`Welcome back, ${name.split(" ")[0]}`}
        subtitle="Your overview"
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

      <div className="stats-grid">
        <StatCard icon={Users} label="Members" value="—" />

        <StatCard icon={Activity} label="Workouts" value="—" />

        <StatCard icon={TrendingUp} label="Sessions" value="—" />
      </div>

      <div className="dashboard-card">
        <h3>Manage Workouts</h3>

        <p>Workout statistics will be loaded from the API.</p>
      </div>
    </div>
  );
}
