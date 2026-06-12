import { useEffect, useMemo, useState } from "react";
import { Search, Users, Dumbbell } from "lucide-react";
import toast from "react-hot-toast";

import { getTrainerMembers } from "../api/memberApi";
import "../styles/members.css";

function formatDateTime(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Members() {
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTrainerMembers();
      setMembers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load members.");
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();

    window.addEventListener("user-workouts-updated", fetchMembers);
    window.addEventListener("focus", fetchMembers);

    return () => {
      window.removeEventListener("user-workouts-updated", fetchMembers);
      window.removeEventListener("focus", fetchMembers);
    };
  }, []);

  const filtered = useMemo(() => {
    return members.filter((member) =>
      `${member.name} ${member.email} ${member.workoutNames?.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [members, query]);

  const totals = useMemo(() => {
    return {
      members: members.length,
      mostPopularWorkout: members[0]?.mostPopularWorkout || "—",
    };
  }, [members]);

  return (
    <div className="members-page">
      <div className="members-header">
        <div>
          <h1>Members</h1>
          <p>Users who scheduled workouts from your training library.</p>
        </div>
      </div>

      <div className="members-stats compact">
        <div className="member-stat">
          <Users size={20} />
          <span>Members</span>
          <strong>{totals.members}</strong>
        </div>

        <div className="member-stat popular">
          <Dumbbell size={20} />
          <span>Most popular workout</span>
          <strong>{totals.mostPopularWorkout}</strong>
        </div>
      </div>

      <div className="members-toolbar">
        <div className="members-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members..."
          />
        </div>
      </div>

      {error && <p className="members-error">{error}</p>}

      {loading ? (
        <div className="members-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="member-skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="members-empty">
          <Users size={24} />
          <p>No members found yet.</p>
          <span>
            Members will appear here when users schedule your workouts.
          </span>
        </div>
      ) : (
        <div className="members-grid">
          {filtered.map((member) => (
            <div key={member.userId} className="member-card">
              <div className="member-top">
                <div className="member-avatar">
                  {member.name
                    ?.split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p>{member.email}</p>
                </div>
              </div>

              <div className="member-metrics">
                <div>
                  <span>Total</span>
                  <strong>{member.totalSessions}</strong>
                </div>

                <div>
                  <span>Completed</span>
                  <strong>{member.completedSessions}</strong>
                </div>

                <div>
                  <span>Upcoming</span>
                  <strong>{member.upcomingSessions}</strong>
                </div>
              </div>

              <div className="member-row">
                <span>Last activity</span>
                <strong>{formatDateTime(member.lastActivity)}</strong>
              </div>

              <div className="member-workouts">
                <span>Workouts used</span>

                <div className="member-tags">
                  {member.workoutNames?.length > 0 ? (
                    member.workoutNames.slice(0, 4).map((name) => (
                      <span key={name} className="member-tag">
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="member-muted">No workouts</span>
                  )}

                  {member.workoutNames?.length > 4 && (
                    <span className="member-tag more">
                      +{member.workoutNames.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
