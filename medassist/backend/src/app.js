const express        = require("express");
const cors           = require("cors");
const morgan         = require("morgan");

const corsOptions    = require("./config/cors");
const { helmetMiddleware, mongoSanitizeMiddleware } = require("./middleware/security.middleware");
const { apiLimiter, authLimiter } = require("./middleware/rateLimit.middleware");
const authMiddleware  = require("./middleware/auth.middleware");
const errorMiddleware    = require("./middleware/error.middleware");
const correlationId     = require("./middleware/correlationId.middleware");

const authRoutes        = require("./modules/auth/auth.routes");
const auth0Routes       = require("./modules/auth/auth0.routes");
const userRoutes        = require("./modules/users/user.routes");
const doctorRoutes      = require("./modules/doctors/doctor.routes");
const appointmentRoutes = require("./modules/appointments/appointment.routes");
const medicationRoutes  = require("./modules/medications/medication.routes");
const recordRoutes      = require("./modules/records/record.routes");
const triageRoutes      = require("./modules/triage/triage.routes");
const messageRoutes     = require("./modules/messaging/message.routes");
const videoRoutes       = require("./modules/video/video.routes");
const adminRoutes       = require("./modules/admin/admin.routes");

const app = express();

// ── Security headers (helmet) — must come before everything else ──────────────
app.use(helmetMiddleware);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors(corsOptions()));

// ── Request logging ───────────────────────────────────────────────────────────
app.use(morgan("dev"));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));

// ── Correlation ID — attach X-Request-Id to every request/response ────────────
app.use(correlationId);

// ── MongoDB injection sanitisation — strips $ and . from user input ───────────
app.use(mongoSanitizeMiddleware);

// ── Static uploads — auth-guarded so only authenticated users can fetch files ─
app.use("/uploads", authMiddleware, express.static("uploads"));

// ── Health check (no auth required) ──────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ── Versioned API router ──────────────────────────────────────────────────────
// All feature routes live under /api/v1 so future breaking changes can be
// introduced as /api/v2 without removing existing consumers.
const v1 = express.Router();

// Auth routes — tight rate limiter (10 req / 15 min)
v1.use("/auth/auth0", authLimiter, auth0Routes); // Auth0 exchange — must be BEFORE /auth
v1.use("/auth",       authLimiter, authRoutes);

// Feature routes — general rate limiter
v1.use("/users",        apiLimiter, userRoutes);
v1.use("/doctors",      apiLimiter, doctorRoutes);
v1.use("/appointments", apiLimiter, appointmentRoutes);
v1.use("/medications",  apiLimiter, medicationRoutes);
v1.use("/records",      apiLimiter, recordRoutes);
v1.use("/triage",       apiLimiter, triageRoutes);
v1.use("/messages",     apiLimiter, messageRoutes);
v1.use("/video",        apiLimiter, videoRoutes);
v1.use("/admin",        apiLimiter, adminRoutes);

app.use("/api/v1", v1);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
