const http = require("http");
const { Server: SocketServer } = require("socket.io");

const app = require("./app");
const connectDb = require("./config/db");
const { port, frontendUrl } = require("./config/env");
const corsOptions = require("./config/cors");
const logger = require("./utils/logger");

// roomId -> Set of socket IDs currently in that room
const rooms = new Map();

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

  // ── WebRTC Signalling ──────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    logger.debug(`[WS] connected: ${socket.id}`);

    // Join a video room
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      if (!rooms.has(roomId)) rooms.set(roomId, new Set());
      rooms.get(roomId).add(socket.id);

      // Tell the new peer who else is already in the room
      const others = [...rooms.get(roomId)].filter((id) => id !== socket.id);
      socket.emit("room-peers", others);

      // Tell existing peers a new user joined
      socket.to(roomId).emit("peer-joined", socket.id);

      logger.debug(`[WS] ${socket.id} joined room ${roomId} (${rooms.get(roomId).size} peers)`);
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
  // Handles SIGTERM (Docker / Kubernetes stop) and SIGINT (Ctrl-C).
  // Stops accepting new connections, waits for in-flight requests to drain,
  // then exits cleanly so no requests are dropped during rolling deploys.
  function shutdown(signal) {
    logger.info(`[server] ${signal} received — shutting down gracefully`);
    httpServer.close(() => {
      logger.info("[server] HTTP server closed — exiting");
      process.exit(0);
    });

    // Force exit after 10 s if requests don't drain (avoids hanging deploys)
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
