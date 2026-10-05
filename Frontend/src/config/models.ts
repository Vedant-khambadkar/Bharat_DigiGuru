import { useGLTF } from "@react-three/drei";

const CDN_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_CLOUDFRONT_URL) ||
  "https://d1mou18mn47yy7.cloudfront.net";

export const MODEL_URLS = {
  businessman: `${CDN_BASE}/3d-assets/businessman-v1.glb`,
  mac: `${CDN_BASE}/3d-assets/mac-v1.glb`,
} as const;

export type ModelKey = keyof typeof MODEL_URLS;

// Initiate early parallel preload via Drei GLTF / THREE.Cache
if (typeof window !== "undefined") {
  if (!(window as any).__bdgMacStartTime) {
    (window as any).__bdgMacStartTime = performance.now();
  }
  if (!(window as any).__bdgBusinessmanStartTime) {
    (window as any).__bdgBusinessmanStartTime = performance.now();
  }
  try {
    useGLTF.preload(MODEL_URLS.mac);
    useGLTF.preload(MODEL_URLS.businessman);
  } catch (e) {
    if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
      console.debug("[3D] Preload notice:", e);
    }
  }
}

if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
  console.log("[3D] Mac URL:", MODEL_URLS.mac);
  console.log("[3D] Businessman URL:", MODEL_URLS.businessman);
}
