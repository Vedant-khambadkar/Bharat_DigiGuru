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
    pingTimeout: 10000,
    pingInterval: 10000,
    connectTimeout: 20000,
  });

  io.on("connection", (socket: Socket) => {
    // Allow client to join admin room or general room
    socket.on("join:admin", () => {
      socket.join("admin_room");
    });

    // Handle client ping for live status verification
    socket.on("ping:status", () => {
      socket.emit("pong:status", { status: "ONLINE", timestamp: Date.now() });
    });

    // Allow direct client-to-server-to-client relay for all entities
    socket.on("service:created", (data) => socket.broadcast.emit("service:created", data));
    socket.on("service:updated", (data) => socket.broadcast.emit("service:updated", data));
    socket.on("service:deleted", (id) => socket.broadcast.emit("service:deleted", id));

    socket.on("portfolio:created", (data) => socket.broadcast.emit("portfolio:created", data));
    socket.on("portfolio:updated", (data) => socket.broadcast.emit("portfolio:updated", data));
    socket.on("portfolio:deleted", (id) => socket.broadcast.emit("portfolio:deleted", id));

    socket.on("threed:created", (data) => socket.broadcast.emit("threed:created", data));
    socket.on("threed:updated", (data) => socket.broadcast.emit("threed:updated", data));
    socket.on("threed:deleted", (id) => socket.broadcast.emit("threed:deleted", id));

    socket.on("team:created", (data) => socket.broadcast.emit("team:created", data));
    socket.on("team:updated", (data) => socket.broadcast.emit("team:updated", data));
    socket.on("team:deleted", (id) => socket.broadcast.emit("team:deleted", id));

    socket.on("blog:created", (data) => socket.broadcast.emit("blog:created", data));
    socket.on("blog:updated", (data) => socket.broadcast.emit("blog:updated", data));
    socket.on("blog:deleted", (id) => socket.broadcast.emit("blog:deleted", id));

    socket.on("inquiry:new", (data) => socket.broadcast.emit("inquiry:new", data));
    socket.on("inquiry:updated", (data) => socket.broadcast.emit("inquiry:updated", data));
    socket.on("inquiry:deleted", (id) => socket.broadcast.emit("inquiry:deleted", id));

    socket.on("admin:created", (data) => socket.broadcast.emit("admin:created", data));
    socket.on("admin:deleted", (id) => socket.broadcast.emit("admin:deleted", id));

    socket.on("disconnect", () => {});
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
  }
};
