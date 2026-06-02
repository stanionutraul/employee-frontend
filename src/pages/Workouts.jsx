import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Search, Plus } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import ScheduleModal from "./ScheduleModal";
import api from "../api/axios";

import "../styles/workouts.css";

export default function Workouts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // =========================
  // SCHEDULE MODAL STATE
  // =========================
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  // =========================
  // LOAD WORKOUTS
  // =========================
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/workouts");
        setWorkouts(res.data);
      } catch {
        setError("Failed to load workouts");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  if (authLoading) return <p className="muted">Loading user...</p>;
  if (!user) return <p className="muted">Please login</p>;

  const filtered = workouts.filter((w) =>
    `${w.name} ${w.description}`.toLowerCase().includes(query.toLowerCase()),
  );

  // =========================
  // DELETE
  // =========================
  const remove = async (id) => {
    try {
      await api.delete(`/workouts/${id}`);
      setWorkouts((p) => p.filter((w) => w.id !== id));
    } catch {
      setError("Delete failed");
    }
  };

  // =========================
  // EDIT
  // =========================
  const openEdit = (w) => {
    setEditing(w);
    setName(w.name);
    setDescription(w.description);
  };

  const saveEdit = async () => {
    try {
      const res = await api.put(`/workouts/${editing.id}`, {
        name,
        description,
      });

      setWorkouts((prev) =>
        prev.map((w) => (w.id === editing.id ? res.data : w)),
      );

      setEditing(null);
    } catch {
      setError("Update failed");
    }
  };

  // =========================
  // OPEN SCHEDULE MODAL
  // =========================
  const openSchedule = (w) => {
    setSelectedWorkout(w);
    setScheduleOpen(true);
  };

  return (
    <div className="page">
      {/* HEADER */}
      <div className="header">
        <div>
          <h1>Workouts</h1>
          <p className="muted">
            {user.role === "TRAINER"
              ? "Manage your training programs"
              : "Browse workouts and join sessions"}
          </p>
        </div>

        {user.role === "TRAINER" && (
          <button
            className="btn primary"
            onClick={() => navigate("/create-workout")}
          >
            <Plus size={16} />
            New workout
          </button>
        )}
      </div>

      {/* SEARCH */}
      <div className="search">
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search workouts..."
        />
      </div>

      {error && <p className="error">{error}</p>}

      {/* GRID */}
      {loading ? (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="muted">No workouts found</p>
      ) : (
        <div className="grid">
          {filtered.map((w) => (
            <div key={w.id} className="card">
              <div className="top">
                <span className="pill">
                  <Clock size={12} />
                  {w.duration ?? "—"}
                </span>

                <span className="muted">by {w.trainerName ?? "—"}</span>
              </div>

              <h3>{w.name}</h3>
              <p className="muted">{w.description}</p>

              <div className="actions">
                {/* ALL USERS CAN SCHEDULE */}
                <button className="btn primary" onClick={() => openSchedule(w)}>
                  Schedule
                </button>

                {/* TRAINER EXTRA ACTIONS */}
                {user.role === "TRAINER" && (
                  <>
                    <button className="btn ghost" onClick={() => openEdit(w)}>
                      Manage
                    </button>

                    <button className="btn danger" onClick={() => remove(w.id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          EDIT MODAL
      ========================= */}
      {editing && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit workout</h2>

            <input value={name} onChange={(e) => setName(e.target.value)} />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>

              <button className="btn primary" onClick={saveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          SCHEDULE MODAL
      ========================= */}
      <ScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        workout={selectedWorkout}
        user={user}
      />
    </div>
  );
}
