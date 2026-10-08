import { io, Socket } from "socket.io-client";
import { Socket_Url } from "./constants";

export const socket: Socket = io(Socket_Url, {
  withCredentials: true,
  autoConnect: true,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

const checkAndJoinAdminRoom = () => {
  try {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) {
      socket.emit("join:admin");
    }
  } catch (_) {}
};

socket.on("connect", () => {
  checkAndJoinAdminRoom();
});

socket.on("reconnect", () => {
  checkAndJoinAdminRoom();
});

// Auto connect safely in browser environment
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Real-time helper subscriber with automatic cleanup return
export const onSocketEvent = (event: string, callback: (...args: any[]) => void) => {
  connectSocket();
  socket.on(event, callback);
  return () => {
    socket.off(event, callback);
  };
};

// Safe emitter
export const emitSocketEvent = (event: string, data?: any) => {
  connectSocket();
  socket.emit(event, data);
};
