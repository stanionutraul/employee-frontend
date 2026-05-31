import api from "./axios";

// GET ALL WORKOUTS
export const getAllWorkouts = async () => {
  const res = await api.get("/workouts");
  return res.data;
};

// CREATE WORKOUT
export const createWorkout = async (data) => {
  const res = await api.post("/workouts", data);
  return res.data;
};

// MY WORKOUTS (dacă ai endpoint)
export const getMyWorkouts = async () => {
  const res = await api.get("/user-workouts");
  return res.data;
};
