import { useEffect, useState } from "react";
import { Clock, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { workouts } from "../lib/mockData";
import "../styles/workouts.css";

export default function Workouts() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = workouts.filter((w) =>
    (w.title + w.description + w.tags.join(" "))
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Workouts</h1>
          <p>
            {user?.role === "TRAINER"
              ? "Manage your training programs."
              : "Browse and join curated sessions."}
          </p>
        </div>

        {user?.role === "TRAINER" && (
          <button
            className="primary-btn"
            onClick={() => navigate("/create-workout")}
          >
            <Plus size={16} />
            New workout
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

      {/* CONTENT */}
      {loading ? (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <div className="grid">
          {filtered.map((w) => (
            <div key={w.id} className="card workout-card">
              <div className="card-top">
                <span className="pill">
                  <Clock size={12} />
                  {w.duration}
                </span>

                <span className="muted">by {w.trainer}</span>
              </div>

              <h3>{w.title}</h3>
              <p className="muted">{w.description}</p>

              <div className="tags">
                {w.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>

              <div className="card-actions">
                <button
                  className="ghost-btn"
                  onClick={() => alert("Details: " + w.title)}
                >
                  Details
                </button>

                <button
                  className="primary-btn"
                  onClick={() =>
                    user?.role === "TRAINER"
                      ? alert("Manage: " + w.title)
                      : alert("Joined: " + w.title)
                  }
                >
                  {user?.role === "TRAINER" ? "Manage" : "Join"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ query }) {
  return (
    <div className="empty">
      <Search size={20} />
      <h3>No workouts found</h3>
      <p>Nothing matches "{query}". Try another keyword.</p>
    </div>
  );
}
