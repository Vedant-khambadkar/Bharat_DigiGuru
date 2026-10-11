/**
 * Parse comma-separated backend URLs from import.meta.env.VITE_API_URL
 * Handles single or multiple URLs, trims quotes/spaces, and strips trailing slashes.
 * Example: VITE_API_URL=http://localhost:5000,https://bharat-digiguru.vercel.app
 */
export const getBackendUrls = (): string[] => {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw || typeof raw !== "string") {
    return ["http://localhost:5000"];
  }

  const list = raw
    .split(",")
    .map((item) => item.trim().replace(/^['"]|['"]$/g, "").replace(/\/+$/, ""))
    .filter(Boolean);

  return list.length > 0 ? list : ["http://localhost:5000"];
};

/**
 * Automatically chooses the best backend URL from the comma-separated VITE_API_URL list:
 * 1. Localhost development (localhost / 127.0.0.1) -> selects local URL from list.
 * 2. Mobile LAN testing (192.168.x.x, 10.x.x.x) -> adapts localhost to connected phone LAN IP.
 * 3. Production / Deployed environment (Vercel, custom domain) -> selects production HTTPS URL.
 * 4. Fallback -> first URL in the list or http://localhost:5000.
 */
export const getBackendUrl = (): string => {
  const urls = getBackendUrls();

  if (typeof window !== "undefined" && window.location) {
    const { hostname } = window.location;

    // 1. Localhost development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      const localUrl = urls.find((u) => u.includes("localhost") || u.includes("127.0.0.1"));
      if (localUrl) return localUrl;
      return urls[0];
    }

    // 2. Mobile device or other device accessing via LAN IP
    const isLanIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.endsWith(".local");
    if (isLanIp) {
      const lanMatch = urls.find((u) => u.includes(hostname));
      if (lanMatch) return lanMatch;

      const localUrl = urls.find((u) => u.includes("localhost") || u.includes("127.0.0.1"));
      if (localUrl) {
        return localUrl.replace(/localhost|127\.0\.0\.1/, hostname);
      }
      return `http://${hostname}:5000`;
    }

    // 3. Production / Deployed environment (Vercel, custom domain, etc.)
    const domainMatch = urls.find((u) => {
      try {
        const parsed = new URL(u);
        return parsed.hostname === hostname || hostname.includes(parsed.hostname);
      } catch {
        return false;
      }
    });
    if (domainMatch) return domainMatch;

    // Pick first remote (non-localhost) URL
    const remoteUrl = urls.find(
      (u) =>
        !u.includes("localhost") &&
        !u.includes("127.0.0.1") &&
        !/^https?:\/\/(192\.168\.|10\.|172\.)/.test(u)
    );
    if (remoteUrl) return remoteUrl;
  }

  // 4. Fallback for SSR / production builds
  if (import.meta.env?.PROD) {
    const remoteUrl = urls.find(
      (u) =>
        !u.includes("localhost") &&
        !u.includes("127.0.0.1") &&
        !/^https?:\/\/(192\.168\.|10\.|172\.)/.test(u)
    );
    if (remoteUrl) return remoteUrl;
  }

  return urls[0] || "http://localhost:5000";
};

export const backendUrl = getBackendUrl();
export const Base_Url = `${backendUrl}/api`;
export const Socket_Url = backendUrl;
