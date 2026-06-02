import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { X } from "lucide-react";

import "../styles/schedule-modal.css";
function formatDate(d) {
  return d.toISOString().split("T")[0];
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function ScheduleModal({ open, onClose, workout, user }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [existing, setExisting] = useState([]);
  const [error, setError] = useState(null);

  // =========================
  // LOAD EXISTING SCHEDULES
  // =========================
  useEffect(() => {
    if (!open) return;

    const fetch = async () => {
      try {
        const res = await api.get("/user-workouts");
        setExisting(res.data);
      } catch {
        setError("Failed to load schedule");
      }
    };

    fetch();
  }, [open]);

  // =========================
  // CHECK CONFLICT
  // =========================
  const hasConflict = useMemo(() => {
    if (!date || !time) return false;

    const selected = `${date}T${time}`;

    return existing.some((w) => w.date === selected);
  }, [date, time, existing]);

  // =========================
  // SUBMIT
  // =========================
  const handleSave = async () => {
    setError(null);

    if (hasConflict) {
      setError("You already have a workout at this time!");
      return;
    }

    try {
      await api.post("/user-workouts", {
        userId: user.id,
        workoutId: workout.id,
        date: `${date}T${time}`,
      });

      window.dispatchEvent(new Event("user-workouts-updated"));

      onClose();
    } catch {
      setError("Failed to schedule workout");
    }
  };

  if (!open) return null;

  // =========================
  // NEXT 7 DAYS (quick picker)
  // =========================
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => addDays(today, i));

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        {/* HEADER */}
        <div className="modal-header">
          <h2>Schedule Workout</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="muted">{workout.name}</p>

        {/* QUICK DAYS */}
        <div className="days-grid">
          {days.map((d) => (
            <button
              key={d}
              className={`day-btn ${formatDate(d) === date ? "active" : ""}`}
              onClick={() => setDate(formatDate(d))}
            >
              {d.toDateString().slice(0, 10)}
            </button>
          ))}
        </div>

        {/* DATE INPUT */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* TIME INPUT */}
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        {/* CONFLICT WARNING */}
        {hasConflict && (
          <div className="warning">
            ⚠ You already have a workout at this time
          </div>
        )}

        {/* ERROR */}
        {error && <div className="error">{error}</div>}

        {/* ACTIONS */}
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn primary"
            disabled={!date || hasConflict}
            onClick={handleSave}
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
