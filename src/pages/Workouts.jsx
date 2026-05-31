import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Search, Plus } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getAllWorkouts } from "../api/workoutApi";

import "../styles/workouts.css";

export default function Workouts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================
  // LOAD WORKOUTS FROM API
  // =========================
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const data = await getAllWorkouts();
        setWorkouts(data);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Failed to load workouts");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  // =========================
  // WAIT FOR AUTH
  // =========================
  if (authLoading) return <p>Loading user...</p>;
  if (!user) return <p>Please login</p>;

  // =========================
  // FILTER
  // =========================
  const filtered = workouts.filter((w) =>
    `${w.name} ${w.description}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Workouts</h1>
          <p>
            {user.role === "TRAINER"
              ? "Manage your training programs."
              : "Browse available workouts."}
          </p>
        </div>

        {/* ONLY TRAINER CAN CREATE */}
        {user.role === "TRAINER" && (
          <button
            className="primary-btn"
            onClick={() => navigate("/create-workout")}
          >
            <Plus size={16} />
            Create Workout
          </button>
        )}
      </div>

      {/* SEARCH */}
      <div className="search-box">
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search workouts..."
        />
      </div>

      {/* ERROR */}
      {error && <p className="error">{error}</p>}

      {/* LOADING */}
      {loading ? (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p>No workouts found</p>
      ) : (
        <div className="grid">
          {filtered.map((w) => (
            <div key={w.id} className="card workout-card">
              <div className="card-top">
                <span className="pill">
                  <Clock size={12} />
                  {w.duration ?? "—"}
                </span>

                <span className="muted">by {w.trainerName ?? "Unknown"}</span>
              </div>

              <h3>{w.name}</h3>
              <p className="muted">{w.description}</p>

              <div className="card-actions">
                <button
                  className="ghost-btn"
                  onClick={() => alert("Details: " + w.name)}
                >
                  Details
                </button>

                <button
                  className="primary-btn"
                  onClick={() =>
                    user.role === "TRAINER"
                      ? alert("Manage: " + w.name)
                      : alert("Joined: " + w.name)
                  }
                >
                  {user.role === "TRAINER" ? "Manage" : "Join"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
