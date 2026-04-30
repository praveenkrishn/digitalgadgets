import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../api/client.js";
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth
} from "../utils/storage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [loading, setLoading] = useState(Boolean(getStoredAuth()?.token));

  useEffect(() => {
    const bootstrap = async () => {
      const session = getStoredAuth();

      if (!session?.token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setAuth({ ...session, user: data.user });
      } catch {
        clearStoredAuth();
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const persistAuth = (payload, rememberMe = true) => {
    const nextAuth = { token: payload.token, user: payload.user };
    setStoredAuth(nextAuth, rememberMe);
    setAuth(nextAuth);
    return nextAuth;
  };

  const login = async (formData) => {
    const { data } = await api.post("/auth/login", formData);
    return persistAuth(data, formData.rememberMe);
  };

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    return persistAuth(data, true);
  };

  const logout = () => {
    clearStoredAuth();
    setAuth(null);
  };

  const value = useMemo(
    () => ({
      user: auth?.user || null,
      token: auth?.token || "",
      loading,
      login,
      register,
      logout,
      setAuth
    }),
    [auth, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
