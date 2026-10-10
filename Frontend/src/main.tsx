import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initThreeAssetCache } from "./utils/threeAssetCache.ts";

// Initialize Three.js asset caching once before React mounts.
// This function should be synchronous, lightweight, and idempotent.
initThreeAssetCache();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element "#root" was not found.');
}

createRoot(rootElement).render(<App />);