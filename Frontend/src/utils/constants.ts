const getBackendUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    // When accessing from mobile phone or other devices on local network,
    // adapt localhost to the phone's connected LAN hostname so the backend is reachable
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
        return `http://${hostname}:5000`;
      }
    }
  }
  return envUrl || "http://localhost:5000";
};

const backendUrl = getBackendUrl();
export const Base_Url = `${backendUrl}/api`;
export const Socket_Url = backendUrl;
