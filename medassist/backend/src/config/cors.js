module.exports = function corsOptions() {
  // Build the allowed-origins list from env + safe localhost defaults for dev
  const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : [];

  const devOrigins =
    process.env.NODE_ENV !== "production"
      ? [
          "http://localhost:5173",
          "http://localhost:3000",
          "http://localhost:4173",
          "http://localhost:80",
          "http://localhost",
        ]
      : [];

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const origins = [...new Set([frontendUrl, ...envOrigins, ...devOrigins])];

  return {
    origin:      origins,
    credentials: true,
  };
};
