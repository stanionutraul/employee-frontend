import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/verify",
  "/auth/resend-verification",
  "/auth/forgot-password",
  "/auth/reset-password",
];

api.interceptors.request.use((config) => {
  const isPublicRoute = publicRoutes.some((route) =>
    config.url?.startsWith(route),
  );

  if (!isPublicRoute) {
    const token = sessionStorage.getItem("token");

    console.log("REQUEST URL:", config.url);
    console.log("TOKEN SENT:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
