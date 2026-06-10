import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./components/AppShell";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import MyWorkoutsPage from "./pages/MyWorkouts";
import CreateWorkout from "./pages/CreateWorkout";
import Profile from "./pages/Profile";
import WorkoutDetails from "./pages/WorkoutDetails";

import { useAuth } from "./context/AuthContext";

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
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/workouts" element={<Workouts />} />

          <Route path="/my-workouts" element={<MyWorkoutsPage />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/workouts/:id" element={<WorkoutDetails />} />

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
