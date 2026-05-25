import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import MyWorkouts from "./pages/MyWorkouts";
import CreateWorkout from "./pages/CreateWorkout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/my-workouts" elemen={<MyWorkouts />} />
        <Route path="/create-workout" elemen={<CreateWorkout />} />
      </Routes>
    </BrowserRouter>
  );
}
