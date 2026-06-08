import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import api from "../api/axios";
import "../styles/schedule-modal.css";

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getTodayDate() {
  return formatDate(new Date());
}

export default function ScheduleModal({ open, onClose, workout, user }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [existing, setExisting] = useState([]);
  const [error, setError] = useState(null);

  const todayDate = getTodayDate();

  useEffect(() => {
    if (!open || !user?.id) return;

    const fetch = async () => {
      try {
        setError(null);
        const res = await api.get(`/user-workouts/user/${user.id}`);
        setExisting(res.data);
      } catch {
        setError("Failed to load schedule");
      }
    };

    fetch();
  }, [open, user?.id]);

  useEffect(() => {
    if (!open) return;

    setDate("");
    setTime("18:00");
    setError(null);
  }, [open]);

  const hasConflict = useMemo(() => {
    if (!date || !time) return false;

    const selected = `${date}T${time}`;

    return existing.some((w) => w.date === selected);
  }, [date, time, existing]);

  const hasDailyLimit = useMemo(() => {
    if (!date) return false;

    const count = existing.filter((w) => w.date?.slice(0, 10) === date).length;

    return count >= 2;
  }, [date, existing]);

  const isPastDateTime = useMemo(() => {
    if (!date || !time) return false;

    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    return selectedDateTime < now;
  }, [date, time]);

  const handleSave = async () => {
    setError(null);

    if (!date) {
      setError("Please select a date.");
      return;
    }

    if (isPastDateTime) {
      setError("You cannot schedule a workout in the past.");
      return;
    }

    if (hasConflict) {
      setError("You already have a workout at this time.");
      return;
    }

    if (hasDailyLimit) {
      setError("You can schedule maximum 2 workouts per day.");
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

  if (!open || !workout) return null;

  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => addDays(today, i));

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Schedule Workout</h2>

          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="muted">{workout.name}</p>

        <div className="days-grid">
          {days.map((d) => {
            const dayDate = formatDate(d);
            const occupiedCount = existing.filter(
              (w) => w.date?.slice(0, 10) === dayDate,
            ).length;

            return (
              <button
                key={dayDate}
                type="button"
                className={`day-btn ${dayDate === date ? "active" : ""} ${
                  occupiedCount >= 2 ? "full" : ""
                }`}
                onClick={() => setDate(dayDate)}
              >
                <span>{d.toDateString().slice(0, 10)}</span>

                {occupiedCount > 0 && (
                  <small>{occupiedCount}/2 scheduled</small>
                )}
              </button>
            );
          })}
        </div>

        <input
          type="date"
          value={date}
          min={todayDate}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        {isPastDateTime && (
          <div className="warning">
            You cannot schedule a workout in the past.
          </div>
        )}

        {hasConflict && (
          <div className="warning">
            You already have a workout at this time.
          </div>
        )}

        {hasDailyLimit && (
          <div className="warning">
            You already have 2 workouts scheduled for this day.
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn primary"
            disabled={!date || hasConflict || hasDailyLimit || isPastDateTime}
            onClick={handleSave}
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
