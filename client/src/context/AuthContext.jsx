import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("admin_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/profile")
      .then(({ data }) => {
        setAdmin(data.admin);
        localStorage.setItem("admin_user", JSON.stringify(data.admin));
      })
      .catch(() => {
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("admin_token", data.token);
    localStorage.setItem("admin_user", JSON.stringify(data.admin));
    setAdmin(data.admin);
    toast.success("Welcome back, Sarkar");
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // Token may already be expired; local cleanup is still correct.
    }
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setAdmin(null);
  }

  const value = useMemo(() => ({ admin, loading, isAuthenticated: Boolean(admin), login, logout }), [admin, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
