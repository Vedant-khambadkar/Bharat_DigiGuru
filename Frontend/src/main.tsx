import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initThreeAssetCache } from "./utils/threeAssetCache.ts";
import { initPerformanceMonitor } from "./utils/performanceMonitor.ts";

// Initialize Three.js asset caching and diagnostic telemetry once before React mounts
initThreeAssetCache();
initPerformanceMonitor();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element "#root" was not found.');
}

createRoot(rootElement).render(<App />);