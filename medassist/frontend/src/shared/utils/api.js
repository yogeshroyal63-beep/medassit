import axios from "axios";

const TOKEN_KEY   = "medassist_token";
const REFRESH_KEY = "medassist_refresh";
const USER_KEY    = "medassist_user";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
});

// ── Request: attach access token ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: silently refresh on 401, then retry once ───────────────────────
let isRefreshing = false;
let refreshQueue = []; // queued requests waiting for a new token

function processQueue(error, token = null) {
  refreshQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  refreshQueue = [];
}

/**
 * Allow the AuthContext to register its updateAccessToken callback here.
 * This avoids a circular import (providers -> api -> providers).
 */
let _updateAccessToken = null;
export function registerTokenUpdater(fn) {
  _updateAccessToken = fn;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Only attempt refresh on 401, and only once per request (_retry flag)
    if (error?.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(REFRESH_KEY);

    // No refresh token stored — go straight to login
    if (!refreshToken) {
      _clearAndRedirect();
      return Promise.reject(error);
    }

    // If a refresh is already in-flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing    = true;

    try {
      const { data } = await axios.post("/api/v1/auth/refresh", { refreshToken });
      const newAt = data.accessToken || data.token;
      const newRt = data.refreshToken;

      // Persist the new tokens
      localStorage.setItem(TOKEN_KEY, newAt);
      if (newRt) localStorage.setItem(REFRESH_KEY, newRt);

      // Sync the React AuthContext so it holds the latest token
      if (_updateAccessToken) _updateAccessToken(newAt);

      // Flush queued requests with the new token
      processQueue(null, newAt);

      // Retry the original request
      original.headers.Authorization = `Bearer ${newAt}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      _clearAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

function _clearAndRedirect() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export default api;
