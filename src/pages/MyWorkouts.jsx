import { CheckCircle2, CalendarClock } from "lucide-react";

import { myWorkouts } from "../lib/mockData";

import "../styles/myWorkouts.css";

export default function MyWorkoutsPage() {
  return (
    <div className="my-workouts-page">
      <div className="my-workouts-header">
        <h1>My Workouts</h1>

        <p>Your training timeline at a glance.</p>
      </div>

      <div className="timeline-wrapper">
        <div className="timeline-line" />

        <div className="timeline-list">
          {myWorkouts.map((m) => {
            const completed = m.status === "completed";

            return (
              <div key={m.id} className="timeline-item">
                <div
                  className={`timeline-icon ${
                    completed ? "completed-icon" : "upcoming-icon"
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <CalendarClock size={18} />
                  )}
                </div>

                <div className="timeline-card">
                  <div className="timeline-card-top">
                    <div>
                      <h3>{m.title}</h3>
                      <p>{m.date}</p>
                    </div>

                    <span
                      className={`timeline-status ${
                        completed
                          ? "timeline-status-completed"
                          : "timeline-status-upcoming"
                      }`}
                    >
                      {completed ? "Completed" : "Upcoming"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
