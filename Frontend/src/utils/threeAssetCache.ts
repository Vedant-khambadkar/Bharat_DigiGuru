import * as THREE from "three";

/**
 * 3D Asset & Three.js Cache System
 *
 * Enables THREE.Cache globally:
 * Native Three.js in-memory caching for all FileLoader, GLTFLoader,
 * RGBELoader, and TextureLoader instances. Prevents duplicate network
 * requests and re-parsing for GLB models, HDR environment maps, and Draco workers.
 *
 * Browser persistence is handled natively by CDN / HTTP Cache-Control headers.
 */

let isInitialized = false;

export function initThreeAssetCache(): void {
  if (isInitialized || typeof window === "undefined") return;
  isInitialized = true;

  // Enable Three.js native in-memory caching for all GLB, HDR, WASM & 3D textures
  THREE.Cache.enabled = true;
}
