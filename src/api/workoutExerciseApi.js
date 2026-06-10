import api from "./axios";

export const getWorkoutExercises = async (workoutId) => {
  const res = await api.get(`/workouts/${workoutId}/exercises`);
  return res.data;
};

export const addWorkoutExercise = async (workoutId, data) => {
  const res = await api.post(`/workouts/${workoutId}/exercises`, data);
  return res.data;
};

export const updateWorkoutExercise = async (id, data) => {
  const res = await api.put(`/workout-exercises/${id}`, data);
  return res.data;
};

export const deleteWorkoutExercise = async (id) => {
  await api.delete(`/workout-exercises/${id}`);
};
