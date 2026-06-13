import api from "./axios";

export const getProfile = async () => {
  const res = await api.get("/profile");
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put("/profile", data);
  return res.data;
};

export const changePassword = async (data) => {
  await api.put("/profile/password", data);
};

export const resetProgress = async () => {
  await api.delete("/profile/progress");
};

export const deleteAccount = async () => {
  await api.delete("/profile/account");
};
