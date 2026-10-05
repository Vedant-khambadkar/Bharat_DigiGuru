/**
 * Centralized 3D Model Configuration
 * 
 * CloudFront CDN URLs for optimized 3D GLB assets.
 * Uses VITE_CLOUDFRONT_URL from environment variables if available,
 * falling back to the verified production CloudFront distribution.
 */

const CDN_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_CLOUDFRONT_URL) ||
  "https://d1mou18mn47yy7.cloudfront.net";

export const MODEL_URLS = {
  businessman: `${CDN_BASE}/3d-assets/businessman-v1.glb`,
  mac: `${CDN_BASE}/3d-assets/mac-v1.glb`,
} as const;

export type ModelKey = keyof typeof MODEL_URLS;

if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
  console.log("[3D] Mac URL:", MODEL_URLS.mac);
  console.log("[3D] Businessman URL:", MODEL_URLS.businessman);
}
