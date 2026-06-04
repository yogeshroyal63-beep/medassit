const http = require("http");
const { Server: SocketServer } = require("socket.io");

const app = require("./app");
const connectDb = require("./config/db");
const { port, frontendUrl } = require("./config/env");
const corsOptions = require("./config/cors");
const logger = require("./utils/logger");
const { verifyToken } = require("./utils/jwt");
const Appointment = require("./modules/appointments/appointment.model");
const Doctor = require("./modules/doctors/doctor.model");

// roomId -> Set of socket IDs currently in that room
const rooms = new Map();

// Max peers per video room (1:1 consultations only)
const MAX_ROOM_SIZE = 2;

async function bootstrap() {
  await connectDb();

  const httpServer = http.createServer(app);

  const io = new SocketServer(httpServer, {
    cors: {
      // Use the same origin list as the REST API so WebSocket auth is consistent
      origin: corsOptions().origin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ── Socket.io JWT authentication middleware ────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Unauthorized: missing token"));
      }

      const payload = verifyToken(token);
      socket.user = payload; // attach decoded user to socket
      return next();
    } catch {
      return next(new Error("Unauthorized: invalid token"));
    }
  });
  // ──────────────────────────────────────────────────────────────────────────

  // ── WebRTC Signalling ──────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    logger.debug(`[WS] connected: ${socket.id} (user: ${socket.user?.id})`);

    // Join a video room — verify the user belongs to the appointment for this room
    socket.on("join-room", async (roomId) => {
      try {
        if (!roomId || typeof roomId !== "string") {
          socket.emit("error", { message: "Invalid roomId" });
          return;
        }

        // Enforce room size limit (1:1 video consultations only)
        if (rooms.has(roomId) && rooms.get(roomId).size >= MAX_ROOM_SIZE) {
          socket.emit("room-full", { message: "This room is full" });
          logger.warn(`[WS] ${socket.id} rejected from full room ${roomId}`);
          return;
        }

        // Verify the calling user is a participant in the appointment for this room.
        // Admin users bypass this check (e.g. for technical support).
        if (socket.user?.role !== "admin") {
          const userId = socket.user?.id;

          // Find doctor profile if caller is a doctor
          let doctorId = null;
          if (socket.user?.role === "doctor") {
            const doc = await Doctor.findOne({ userId }).select("_id").lean();
            doctorId = doc?._id;
          }

          const appointmentMatch = await Appointment.findOne({
            roomId,
            $or: [
              { patientId: userId },
              ...(doctorId ? [{ doctorId }] : []),
            ],
          }).lean();

          if (!appointmentMatch) {
            socket.emit("error", { message: "Not authorized to join this room" });
            logger.warn(`[WS] ${socket.id} (user ${userId}) denied entry to room ${roomId}`);
            return;
          }
        }

        socket.join(roomId);
        if (!rooms.has(roomId)) rooms.set(roomId, new Set());
        rooms.get(roomId).add(socket.id);

        // Tell the new peer who else is already in the room
        const others = [...rooms.get(roomId)].filter((id) => id !== socket.id);
        socket.emit("room-peers", others);

        // Tell existing peers a new user joined
        socket.to(roomId).emit("peer-joined", socket.id);

        logger.debug(`[WS] ${socket.id} joined room ${roomId} (${rooms.get(roomId).size} peers)`);
      } catch (err) {
        logger.error(`[WS] join-room error: ${err.message}`);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Relay WebRTC offer to a specific peer
    socket.on("offer", ({ to, offer }) => {
      io.to(to).emit("offer", { from: socket.id, offer });
    });

    // Relay WebRTC answer to a specific peer
    socket.on("answer", ({ to, answer }) => {
      io.to(to).emit("answer", { from: socket.id, answer });
    });

    // Relay ICE candidates to a specific peer
    socket.on("ice-candidate", ({ to, candidate }) => {
      io.to(to).emit("ice-candidate", { from: socket.id, candidate });
    });

    // Clean up on disconnect
    socket.on("disconnecting", () => {
      for (const roomId of socket.rooms) {
        if (rooms.has(roomId)) {
          rooms.get(roomId).delete(socket.id);
          if (rooms.get(roomId).size === 0) rooms.delete(roomId);
          socket.to(roomId).emit("peer-left", socket.id);
        }
      }
    });

    socket.on("disconnect", () => {
      logger.debug(`[WS] disconnected: ${socket.id}`);
    });
  });
  // ──────────────────────────────────────────────────────────────────────────

  httpServer.listen(port, () =>
    logger.info(`MedAssist API + WS running on port ${port}`)
  );

  // ── Graceful shutdown ──────────────────────────────────────────────────────
  function shutdown(signal) {
    logger.info(`[server] ${signal} received — shutting down gracefully`);
    httpServer.close(() => {
      logger.info("[server] HTTP server closed — exiting");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("[server] Graceful shutdown timed out — forcing exit");
      process.exit(1);
    }, 10_000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
  // ──────────────────────────────────────────────────────────────────────────
}

bootstrap().catch((e) => {
  logger.error(e);
  process.exit(1);
});
