import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketIOServer | null = null;

export const initializeSocket = (httpServer: HttpServer, _corsOrigin?: any) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Dynamically reflect incoming origin to support credentials across localhost and all domains
        callback(null, origin || true);
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    },
    transports: ["websocket", "polling"],
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  io.on("connection", (socket: Socket) => {
    console.log(`⚡ [SOCKET.IO] Client connected: ${socket.id}`);

    // Allow client to join admin room or general room
    socket.on("join:admin", () => {
      socket.join("admin_room");
      console.log(`🛡️ [SOCKET.IO] Client ${socket.id} joined admin room`);
    });

    // Handle client ping for live status verification
    socket.on("ping:status", () => {
      socket.emit("pong:status", { status: "ONLINE", timestamp: Date.now() });
    });

    // Allow broadcasting updates sent directly through socket
    socket.on("service:created", (data) => socket.broadcast.emit("service:created", data));
    socket.on("service:updated", (data) => socket.broadcast.emit("service:updated", data));
    socket.on("service:deleted", (id) => socket.broadcast.emit("service:deleted", id));

    socket.on("portfolio:created", (data) => socket.broadcast.emit("portfolio:created", data));
    socket.on("portfolio:updated", (data) => socket.broadcast.emit("portfolio:updated", data));
    socket.on("portfolio:deleted", (id) => socket.broadcast.emit("portfolio:deleted", id));

    socket.on("threed:created", (data) => socket.broadcast.emit("threed:created", data));
    socket.on("threed:updated", (data) => socket.broadcast.emit("threed:updated", data));
    socket.on("threed:deleted", (id) => socket.broadcast.emit("threed:deleted", id));

    socket.on("blog:created", (data) => socket.broadcast.emit("blog:created", data));
    socket.on("blog:updated", (data) => socket.broadcast.emit("blog:updated", data));
    socket.on("blog:deleted", (id) => socket.broadcast.emit("blog:deleted", id));

    socket.on("disconnect", (reason) => {
      console.log(`🔌 [SOCKET.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => {
  return io;
};

// Helper to safely emit an event to all connected clients
export const emitEvent = (eventName: string, payload: any) => {
  if (io) {
    io.emit(eventName, payload);
    console.log(`📢 [SOCKET.IO EMIT] Event '${eventName}' broadcasted to clients.`);
  }
};
