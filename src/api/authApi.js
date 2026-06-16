import api from "./axios";

export const loginRequest = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const registerRequest = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const verifyEmailRequest = async (token) => {
  const res = await api.get(`/auth/verify?token=${token}`);
  return res.data;
};

export const resendVerificationRequest = async (email) => {
  const res = await api.post(
    `/auth/resend-verification?email=${encodeURIComponent(email)}`,
  );

  return res.data;
};

export const forgotPasswordRequest = async (email) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPasswordRequest = async (token, newPassword) => {
  const res = await api.post("/auth/reset-password", {
    token,
    newPassword,
  });

  return res.data;
};
