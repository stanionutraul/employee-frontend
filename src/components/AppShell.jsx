import { useState } from "react";
import {
  LayoutDashboard,
  Dumbbell,
  CalendarCheck,
  PlusCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import "../styles/app.css";

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
    to: "/create-workout",
    label: "Create Workout",
    icon: PlusCircle,
  },
];

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;

  const logout = () => {
    navigate("/login");
  };

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Dumbbell size={18} />
          </div>

          <div>
            <h2>Nexus Fit</h2>
            <span>INTELLIGENCE</span>
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
          <div className="avatar">IO</div>

          <div className="user-info">
            <h4>Ionut</h4>
            <span>TRAINER</span>
          </div>

          <button onClick={logout} className="logout-btn">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-layout">
        {/* MOBILE HEADER */}
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

        {/* CONTENT */}
        <main className="page-content">
          <Outlet />
        </main>

        {/* MOBILE BOTTOM NAV */}
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

      {/* MOBILE DRAWER */}
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
