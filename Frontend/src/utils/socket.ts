import { io, Socket } from "socket.io-client";
import { Socket_Url } from "./constants";

export const socket: Socket = io(Socket_Url, {
  withCredentials: true,
  autoConnect: true,
  transports: ["websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
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
