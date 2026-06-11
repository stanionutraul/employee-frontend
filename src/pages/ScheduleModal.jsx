import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Clock, X } from "lucide-react";
import toast from "react-hot-toast";
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

function formatDayLabel(date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
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
        setError("Failed to load schedule.");
        toast.error("Failed to load schedule");
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

  const occupiedCount = useMemo(() => {
    if (!date) return 0;
    return existing.filter((w) => w.date?.slice(0, 10) === date).length;
  }, [date, existing]);

  const hasDailyLimit = occupiedCount >= 2;

  const isPastDateTime = useMemo(() => {
    if (!date || !time) return false;

    return new Date(`${date}T${time}`) < new Date();
  }, [date, time]);

  const canSubmit = date && !hasConflict && !hasDailyLimit && !isPastDateTime;

  const handleSave = async () => {
    setError(null);

    if (!date) {
      setError("Please select a date.");
      toast.error("Please select a date");
      return;
    }

    if (isPastDateTime) {
      setError("You cannot schedule a workout in the past.");
      toast.error("You cannot schedule in the past");
      return;
    }

    if (hasConflict) {
      setError("You already have a workout at this time.");
      toast.error("You already have a workout at this time");
      return;
    }

    if (hasDailyLimit) {
      setError("You can schedule maximum 2 workouts per day.");
      toast.error("Daily workout limit reached");
      return;
    }

    try {
      await api.post("/user-workouts", {
        userId: user.id,
        workoutId: workout.id,
        date: `${date}T${time}`,
      });

      toast.success("Workout scheduled successfully");

      window.dispatchEvent(new Event("user-workouts-updated"));
      onClose();
    } catch {
      setError("Failed to schedule workout.");
      toast.error("Failed to schedule workout");
    }
  };

  if (!open || !workout) return null;

  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => addDays(today, i));

  return (
    <div className="schedule-overlay" onMouseDown={onClose}>
      <div className="schedule-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="schedule-header">
          <div>
            <div className="schedule-badge">
              <CalendarClock size={14} />
              <span>Schedule session</span>
            </div>

            <h2>{workout.name}</h2>
            <p>Pick a day and hour for this workout.</p>
          </div>

          <button className="schedule-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="quick-days">
          {days.map((d) => {
            const dayDate = formatDate(d);
            const count = existing.filter(
              (w) => w.date?.slice(0, 10) === dayDate,
            ).length;

            return (
              <button
                key={dayDate}
                type="button"
                className={`quick-day ${dayDate === date ? "active" : ""} ${
                  count >= 2 ? "full" : ""
                }`}
                onClick={() => setDate(dayDate)}
              >
                <span>{formatDayLabel(d)}</span>
                <small>{count > 0 ? `${count}/2 booked` : "Available"}</small>
              </button>
            );
          })}
        </div>

        <div className="schedule-fields">
          <label className="field-label">
            <span>Date</span>
            <input
              type="date"
              value={date}
              min={todayDate}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label className="field-label">
            <span>Time</span>
            <div className="time-input">
              <Clock size={15} />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </label>
        </div>

        {date && (
          <div className="schedule-summary">
            <span>{occupiedCount}/2 workouts scheduled on this day</span>
          </div>
        )}

        {isPastDateTime && (
          <div className="schedule-warning">
            You cannot schedule a workout in the past.
          </div>
        )}

        {hasConflict && (
          <div className="schedule-warning">
            You already have a workout at this exact time.
          </div>
        )}

        {hasDailyLimit && (
          <div className="schedule-warning">
            This day is full. You already have 2 workouts scheduled.
          </div>
        )}

        {error && <div className="schedule-error">{error}</div>}

        <div className="schedule-actions">
          <button className="schedule-btn ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="schedule-btn primary"
            disabled={!canSubmit}
            onClick={handleSave}
          >
            Schedule workout
          </button>
        </div>
      </div>
    </div>
  );
}
