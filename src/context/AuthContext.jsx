import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

// =========================
// PROVIDER
// =========================
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      sessionStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (authResponse) => {
    sessionStorage.setItem("token", authResponse.token);
    await loadUser(); // 🔥 IMPORTANT
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
// =========================
// HOOK
// =========================
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
