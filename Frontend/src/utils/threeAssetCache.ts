import * as THREE from "three";

/**
 * 3D Asset & Binary File Cache System
 *
 * 1. Enables THREE.Cache globally:
 *    Native Three.js in-memory caching for all FileLoader, GLTFLoader,
 *    RGBELoader, and TextureLoader instances. Prevents duplicate network
 *    requests and re-parsing for GLB models, HDR environment maps, and Draco workers.
 *
 * 2. Preloads & verifies 3D assets in browser CacheStorage.
 */

const THREE_CACHE_NAME = "us-3d-assets-v1";
let isInitialized = false;

export function initThreeAssetCache(): void {
  if (isInitialized || typeof window === "undefined") return;
  isInitialized = true;

  // Enable Three.js native in-memory caching for all GLB, HDR, WASM & 3D textures
  THREE.Cache.enabled = true;
}

export async function preload3DAsset(url: string): Promise<void> {
  if (!url || typeof window === "undefined" || !("caches" in window)) return;
  try {
    const cache = await window.caches.open(THREE_CACHE_NAME);
    const match = await cache.match(url);
    if (!match) {
      const res = await fetch(url, { mode: "cors" });
      if (res.ok) {
        await cache.put(url, res);
      }
    }
  } catch (err) {
    console.debug("[ThreeCache] Preload notice for:", url, err);
  }
}
