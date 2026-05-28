import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/AppShell";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import CreateWorkout from "./pages/CreateWorkout";
import MyWorkoutsPage from "./pages/MyWorkouts";
import Workouts from "./pages/Workouts";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* layout wrapper */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-workout" element={<CreateWorkout />} />
          <Route path="/my-workouts" element={<MyWorkoutsPage />} />
          <Route path="/workouts" element={<Workouts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
