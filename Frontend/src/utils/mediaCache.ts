import * as THREE from "three";

const inFlightPreloads = new Set<string>();
const preloadedUrls = new Set<string>();

// Centralized Three.js texture cache and in-flight promise tracker
const textureCache = new Map<string, THREE.Texture>();
const inFlightTexturePromises = new Map<string, Promise<THREE.Texture | null>>();

/**
 * Returns clean, resolved media URL.
 * Bypasses redundant manual fetch + Blob creation, allowing the browser's
 * highly-optimized HTTP network cache and Three.js ImageLoader to work directly.
 */
export async function getCachedMediaUrl(url?: string): Promise<string> {
  if (!url || typeof url !== "string") return "";
  const cleanUrl = url.trim();
  if (!cleanUrl) return "";
  return cleanUrl;
}

/**
 * Preload an image using the browser's native Image() preloader with CORS.
 * Uses browser HTTP cache directly without creating intermediate JS Blobs in memory.
 */
function preloadSingleImage(url: string): Promise<void> {
  if (!url || preloadedUrls.has(url)) return Promise.resolve();
  if (url.startsWith("data:") || url.startsWith("blob:")) return Promise.resolve();

  if (inFlightPreloads.has(url)) {
    return Promise.resolve();
  }

  inFlightPreloads.add(url);

  return new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";

    img.onload = () => {
      preloadedUrls.add(url);
      inFlightPreloads.delete(url);
      resolve();
    };

    img.onerror = () => {
      inFlightPreloads.delete(url);
      resolve(); // Non-blocking failure
    };

    img.src = url;
  });
}

export interface PreloadOptions {
  priority?: "high" | "low" | "idle";
  concurrency?: number;
}

/**
 * Preloads a list of media URLs with controlled concurrency (max 2 at a time by default)
 * and idle scheduling so initial rendering and 3D hero loading are never blocked.
 */
export async function preloadMediaList(
  urls: (string | undefined)[],
  options: PreloadOptions = {}
): Promise<void> {
  const { priority = "low", concurrency = 2 } = options;
  const validUrls = Array.from(
    new Set(
      urls
        .filter((u): u is string => typeof u === "string" && Boolean(u.trim()))
        .map((u) => u.trim())
    )
  ).filter((u) => !preloadedUrls.has(u) && !textureCache.has(u));

  if (validUrls.length === 0) return;

  const runQueue = async () => {
    let index = 0;
    const workers = Array.from({ length: Math.min(concurrency, validUrls.length) }, async () => {
      while (index < validUrls.length) {
        const currentUrl = validUrls[index++];
        if (currentUrl) {
          await preloadSingleImage(currentUrl);
        }
      }
    });
    await Promise.all(workers);
  };

  if (priority === "idle" && typeof window !== "undefined" && "requestIdleCallback" in window) {
    (window as any).requestIdleCallback(
      () => {
        runQueue();
      },
      { timeout: 3000 }
    );
  } else if (priority === "low") {
    setTimeout(() => {
      runQueue();
    }, 150);
  } else {
    await runQueue();
  }
}

/**
 * Synchronously retrieves a pre-cached Three.js texture if available.
 */
export function getLoadedTexture(url?: string): THREE.Texture | null {
  if (!url) return null;
  const cleanUrl = url.trim();
  return textureCache.get(cleanUrl) || null;
}

/**
 * Loads and caches a Three.js Texture with complete request deduplication and fallback.
 * Ensures textures are oriented right-side up (flipY = true) and filtered properly.
 */
export function loadSharedThreeTexture(url: string): Promise<THREE.Texture | null> {
  const cleanUrl = url.trim();
  if (!cleanUrl) return Promise.resolve(null);

  // 1. Memory Cache Hit
  const cached = textureCache.get(cleanUrl);
  if (cached) {
    return Promise.resolve(cached);
  }

  // 2. In-flight Request Deduplication
  const inFlight = inFlightTexturePromises.get(cleanUrl);
  if (inFlight) {
    return inFlight;
  }

  // 3. Initiate Single Controlled Texture Load
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");

  const promise = new Promise<THREE.Texture | null>((resolve) => {
    loader.load(
      cleanUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.flipY = true;
        tex.needsUpdate = true;

        textureCache.set(cleanUrl, tex);
        preloadedUrls.add(cleanUrl);
        inFlightTexturePromises.delete(cleanUrl);
        resolve(tex);
      },
      undefined,
      async () => {
        // Fallback: Fetch as Blob to bypass browser CORS / cache header quirks
        try {
          const res = await fetch(cleanUrl, { mode: "cors" });
          if (res.ok) {
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            loader.load(
              blobUrl,
              (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                tex.generateMipmaps = true;
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.flipY = true;
                tex.needsUpdate = true;

                textureCache.set(cleanUrl, tex);
                preloadedUrls.add(cleanUrl);
                inFlightTexturePromises.delete(cleanUrl);
                resolve(tex);
              },
              undefined,
              () => {
                inFlightTexturePromises.delete(cleanUrl);
                resolve(null);
              }
            );
            return;
          }
        } catch (_fetchErr) {
          // Both loaders failed
        }
        inFlightTexturePromises.delete(cleanUrl);
        resolve(null);
      }
    );
  });

  inFlightTexturePromises.set(cleanUrl, promise);
  return promise;
}

/**
 * Invalidates cached URLs in memory and tracking sets
 * (e.g. when an admin uploads a new version of an image).
 */
export async function invalidateMediaCache(targetUrl?: string): Promise<void> {
  if (targetUrl) {
    preloadedUrls.delete(targetUrl);
    inFlightPreloads.delete(targetUrl);
    const cachedTex = textureCache.get(targetUrl);
    if (cachedTex) {
      cachedTex.dispose();
      textureCache.delete(targetUrl);
    }
    inFlightTexturePromises.delete(targetUrl);
  } else {
    preloadedUrls.clear();
    inFlightPreloads.clear();
    textureCache.forEach((tex) => tex.dispose());
    textureCache.clear();
    inFlightTexturePromises.clear();
  }
}

/**
 * React hook to resolve media/image/poster URL directly.
 */
export function useCachedMedia(url?: string): string {
  return url ? url.trim() : "";
}

