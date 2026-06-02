import api from "./axios";

export const getUserWorkouts = async (userId) => {
  const res = await api.get(`/user-workouts/user/${userId}`);
  return res.data;
};

export const createUserWorkout = async (payload) => {
  const res = await api.post("/user-workouts", payload);
  return res.data;
};

export const deleteUserWorkout = async (id) => {
  await api.delete(`/user-workouts/${id}`);
};
