import api from "./axios";

export const getAllWorkouts = async () => {
  const response = await api.get("/workouts");
  return response.data;
};

export const createWorkout = async (data) => {
  const response = await api.post("/workouts", data);
  return response.data;
};

export const getMyWorkouts = async () => {
  const response = await api.get("/user-workouts");
  return response.data;
};
