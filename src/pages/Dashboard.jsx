import {
  Activity,
  CheckCircle2,
  CalendarClock,
  Users,
  TrendingUp,
  Plus,
  ArrowUpRight,
} from "lucide-react";

import { useAuth } from "../lib/auth";
import { workouts, myWorkouts } from "../lib/mockData";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

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
  const upcoming = myWorkouts.find((m) => m.status === "upcoming");

  return (
    <div className="dashboard-page">
      <PageHeader
        title={`Hey, ${name.split(" ")[0]}`}
        subtitle="Today's overview of your training rhythm."
      />

      <div className="stats-grid">
        <StatCard icon={Activity} label="Active workouts" value="3" />
        <StatCard icon={CheckCircle2} label="Completed sessions" value="18" />
        <StatCard
          icon={CalendarClock}
          label="Next workout"
          value={upcoming?.date ?? "—"}
        />
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3>Workout feed</h3>
        </div>

        {workouts.map((w) => (
          <div key={w.id} className="workout-item">
            <div>
              <h4>{w.title}</h4>
              <p>{w.description}</p>
            </div>
            <button className="primary-btn">Join</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrainerDashboard({ name }) {
  return (
    <div className="dashboard-page">
      <PageHeader
        title={`Welcome back, ${name.split(" ")[0]}`}
        subtitle="Your overview"
        action={
          <button className="primary-btn">
            <Plus size={16} /> Create workout
          </button>
        }
      />

      <div className="stats-grid">
        <StatCard icon={Users} label="Members" value="248" />
        <StatCard icon={Activity} label="Workouts" value={workouts.length} />
        <StatCard icon={TrendingUp} label="Sessions" value="126" />
      </div>

      <div className="dashboard-card">
        <h3>Manage workouts</h3>
        {workouts.slice(0, 4).map((w) => (
          <div key={w.id} className="workout-item">
            <h4>{w.title}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}
