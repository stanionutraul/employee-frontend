import api from "./axios";

export const getTrainerMembers = async () => {
  const res = await api.get("/trainer/members");
  return res.data;
};
