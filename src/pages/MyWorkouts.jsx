import { CalendarClock } from "lucide-react";

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
          <div className="timeline-item">
            <div className="timeline-icon upcoming-icon">
              <CalendarClock size={18} />
            </div>

            <div className="timeline-card">
              <div className="timeline-card-top">
                <div>
                  <h3>No workouts yet</h3>

                  <p>
                    Your assigned workouts will appear here once the
                    user-workouts API is connected.
                  </p>
                </div>

                <span className="timeline-status timeline-status-upcoming">
                  Empty
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
