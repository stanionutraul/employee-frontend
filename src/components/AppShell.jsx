import { useState } from "react";
import {
  LayoutDashboard,
  Dumbbell,
  CalendarCheck,
  PlusCircle,
  LogOut,
  Menu,
  X,
  UserCircle,
  Users,
} from "lucide-react";

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "../styles/app.css";

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;

  const nav = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/workouts",
      label: "Workouts",
      icon: Dumbbell,
    },
    {
      to: "/my-workouts",
      label: "My Workouts",
      icon: CalendarCheck,
    },
    {
      to: "/profile",
      label: "Profile",
      icon: UserCircle,
    },

    ...(user?.role === "TRAINER"
      ? [
          {
            to: "/members",
            label: "Members",
            icon: Users,
          },
          {
            to: "/create-workout",
            label: "Create Workout",
            icon: PlusCircle,
          },
        ]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Dumbbell size={18} />
          </div>

          <div>
            <h2>Nexus Fit</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-link ${path === item.to ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="user-card">
          <div className="avatar">
            {user?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>

          <div className="user-info">
            <h4>{user?.name}</h4>
            <span>{user?.role}</span>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="main-layout">
        <header className="mobile-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="mobile-brand">
            <div className="brand-icon small">
              <Dumbbell size={15} />
            </div>

            <span>Nexus Fit</span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>

        <nav className="bottom-nav">
          {nav.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`bottom-link ${path === item.to ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
          <aside
            className="mobile-sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-sidebar-top">
              <div className="brand">
                <div className="brand-icon">
                  <Dumbbell size={18} />
                </div>

                <div>
                  <h2>Nexus Fit</h2>
                  <span>INTELLIGENCE</span>
                </div>
              </div>

              <button onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <nav className="sidebar-nav">
              {nav.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`sidebar-link ${
                      path === item.to ? "active" : ""
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
