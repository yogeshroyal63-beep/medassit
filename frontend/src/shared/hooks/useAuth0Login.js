/**
 * useAuth0Login
 *
 * Handles the Auth0 social login flow:
 *   1. Fetch Auth0 config from our backend (/api/auth/auth0/config)
 *   2. Redirect user to Auth0 Universal Login
 *   3. On callback, exchange the Auth0 token for our own access + refresh tokens
 *   4. Store tokens and update auth context via login()
 *
 * Usage:
 *   const { loginWithAuth0, loading, error } = useAuth0Login();
 *   <button onClick={() => loginWithAuth0("google-oauth2")}>Sign in with Google</button>
 *
 * HOW TO ENABLE:
 *   1. Create an Auth0 tenant at https://auth0.com
 *   2. Create a "Single Page Application"
 *   3. Add your callback URL: http://localhost:5173/auth0/callback
 *   4. Create an API with audience: https://medassist.api
 *   5. Add Social Connections (Google, GitHub, etc.) in Auth0 dashboard
 *   6. Set backend .env: AUTH0_DOMAIN, AUTH0_AUDIENCE, AUTH0_CLIENT_ID
 *   7. Install @auth0/auth0-spa-js in frontend: npm install @auth0/auth0-spa-js
 *
 * Without those steps this hook returns { enabled: false } and the
 * "Sign in with Google" button stays hidden — nothing breaks.
 */
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import api from "../utils/api";

export function useAuth0Login() {
  const { login } = useAuth();
  const [auth0Config, setAuth0Config] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  useEffect(() => {
    api.get("/auth/auth0/config")
      .then(r => setAuth0Config(r.data))
      .catch(() => setAuth0Config({ enabled: false }));
  }, []);

  const loginWithAuth0 = async (connection = "google-oauth2") => {
    if (!auth0Config?.enabled) {
      setError("Auth0 is not configured. Please use email/password login.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Dynamically import Auth0 SPA SDK (optional dependency)
      const { Auth0Client } = await import("@auth0/auth0-spa-js");

      const auth0Client = new Auth0Client({
        domain:       auth0Config.domain,
        clientId:     auth0Config.clientId,
        authorizationParams: {
          audience:     auth0Config.audience,
          redirect_uri: `${window.location.origin}/auth0/callback`,
          connection,
        },
      });

      // Redirect to Auth0 Universal Login
      await auth0Client.loginWithRedirect();

    } catch (err) {
      setError(err.message || "Auth0 login failed");
      setLoading(false);
    }
  };

  /**
   * Call this on the /auth0/callback page after Auth0 redirects back.
   * Exchanges the Auth0 token for our own access + refresh tokens.
   */
  const handleAuth0Callback = async () => {
    if (!auth0Config?.enabled) return;
    setLoading(true);
    setError(null);

    try {
      const { Auth0Client } = await import("@auth0/auth0-spa-js");

      const auth0Client = new Auth0Client({
        domain:   auth0Config.domain,
        clientId: auth0Config.clientId,
        authorizationParams: { audience: auth0Config.audience },
      });

      await auth0Client.handleRedirectCallback();
      const auth0Token = await auth0Client.getTokenSilently();

      // Exchange Auth0 token for our own tokens
      const { data } = await api.post("/auth/auth0/exchange", { auth0Token });
      login({ token: data.accessToken, user: data.user });

    } catch (err) {
      setError(err.message || "Auth0 callback failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    enabled:            auth0Config?.enabled === true,
    loginWithAuth0,
    handleAuth0Callback,
    loading,
    error,
  };
}
