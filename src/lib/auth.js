import { useState } from "react";

export function useAuth() {
  const [user] = useState(() => {
    const stored = localStorage.getItem("user");

    return stored ? JSON.parse(stored) : null;
  });

  return { user };
}

export function setAuth(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("user");
}
