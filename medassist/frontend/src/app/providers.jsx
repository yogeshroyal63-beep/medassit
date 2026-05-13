import React, { createContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { registerTokenUpdater } from "../shared/utils/api";

const TOKEN_KEY   = "medassist_token";
const REFRESH_KEY = "medassist_refresh";
const USER_KEY    = "medassist_user";

export const AuthContext = createContext(null);

export function Providers({ children }) {
  const [token,   setToken]   = useState(null);
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshTokenRef = useRef(null);

  useEffect(() => {
    try {
      const t  = localStorage.getItem(TOKEN_KEY);
      const rt = localStorage.getItem(REFRESH_KEY);
      const u  = localStorage.getItem(USER_KEY);
      if (t)  { setToken(t); refreshTokenRef.current = rt; }
      if (u)  setUser(JSON.parse(u));
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Called after login / register with the full server response */
  const login = ({ token: at, accessToken, refreshToken, user: nextUser }) => {
    const access  = at || accessToken;
    const refresh = refreshToken || null;
    setUser(nextUser);
    setToken(access);
    refreshTokenRef.current = refresh;
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(USER_KEY,  JSON.stringify(nextUser));
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  };

  /** Clears state AND tells the backend to blacklist the refresh token */
  const logout = async () => {
    const rt = refreshTokenRef.current || localStorage.getItem(REFRESH_KEY);
    if (rt) {
      axios.post("/api/v1/auth/logout", { refreshToken: rt }).catch(() => null);
    }
    setUser(null);
    setToken(null);
    refreshTokenRef.current = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  };

  /** Called by the axios interceptor when it gets a fresh access token */
  const updateAccessToken = (newAt) => {
    setToken(newAt);
    localStorage.setItem(TOKEN_KEY, newAt);
  };

  // Register the updater so api.js can call it without a circular import
  useEffect(() => {
    registerTokenUpdater(updateAccessToken);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, logout, refreshTokenRef, updateAccessToken }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
