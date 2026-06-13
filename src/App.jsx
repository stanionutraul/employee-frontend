import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AppShell from "./components/AppShell";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import MyWorkoutsPage from "./pages/MyWorkouts";
import CreateWorkout from "./pages/CreateWorkout";
import Profile from "./pages/Profile";
import WorkoutDetails from "./pages/WorkoutDetails";
import Members from "./pages/Members";
import { useAuth } from "./context/AuthContext";
import VerifyEmail from "./pages/VerifyEmail";

function TrainerRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user?.role !== "TRAINER") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2600,
          style: {
            background: "rgba(20, 20, 30, 0.95)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            backdropFilter: "blur(18px)",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#0f172a",
            },
          },
          error: {
            iconTheme: {
              primary: "#f87171",
              secondary: "#0f172a",
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/workouts" element={<Workouts />} />

          <Route path="/my-workouts" element={<MyWorkoutsPage />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/workouts/:id" element={<WorkoutDetails />} />

          <Route
            path="/members"
            element={
              <TrainerRoute>
                <Members />
              </TrainerRoute>
            }
          />

          <Route
            path="/create-workout"
            element={
              <TrainerRoute>
                <CreateWorkout />
              </TrainerRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
