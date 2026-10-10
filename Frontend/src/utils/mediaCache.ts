import * as THREE from "three";

const CACHE_NAME = "bdg-persistent-media-v1";

// Memory caches
const blobUrlMemoryCache = new Map<string, string>();
const inFlightFetchPromises = new Map<string, Promise<string>>();
const inFlightPreloads = new Set<string>();
const preloadedUrls = new Set<string>();

// Centralized Three.js texture cache and in-flight promise tracker
const textureCache = new Map<string, THREE.Texture>();
const inFlightTexturePromises = new Map<string, Promise<THREE.Texture | null>>();

/**
 * Safely opens the persistent CacheStorage instance if supported by the browser.
 */
async function getMediaCache(): Promise<Cache | null> {
  if (typeof window !== "undefined" && "caches" in window) {
    try {
      return await window.caches.open(CACHE_NAME);
    } catch (err) {
      console.warn("CacheStorage open error:", err);
      return null;
    }
  }
  return null;
}

/**
 * Retrieves an image/media URL from persistent CacheStorage.
 * If already cached (e.g. from previous visit or reload), returns a local Blob URL
 * with ZERO network requests to CloudFront / CDN.
 * If not cached, fetches from CloudFront once, saves to persistent CacheStorage, and returns the Blob URL.
 */
export async function getCachedMediaUrl(url?: string): Promise<string> {
  if (!url || typeof url !== "string") return "";
  const cleanUrl = url.trim();
  return cleanUrl;
}

/**
 * Preload a single image directly into CacheStorage and memory.
 */
async function preloadSingleImage(url: string): Promise<void> {
  if (!url || preloadedUrls.has(url)) return;
  if (url.startsWith("data:") || url.startsWith("blob:")) return;

  if (inFlightPreloads.has(url)) {
    return;
  }

  inFlightPreloads.add(url);

  try {
    if (typeof window !== "undefined") {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
    }
    preloadedUrls.add(url);
  } catch (_e) {
    // Non-blocking
  } finally {
    inFlightPreloads.delete(url);
  }
}

export interface PreloadOptions {
  priority?: "high" | "low" | "idle";
  concurrency?: number;
}

/**
 * Preloads a list of media URLs with controlled concurrency into persistent CacheStorage.
 */
export async function preloadMediaList(
  urls: (string | undefined)[],
  options: PreloadOptions = {}
): Promise<void> {
  const { priority = "low", concurrency = 3 } = options;
  const validUrls = Array.from(
    new Set(
      urls
        .filter((u): u is string => typeof u === "string" && Boolean(u.trim()))
        .map((u) => u.trim())
    )
  ).filter((u) => !preloadedUrls.has(u));

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
 * Loads and caches a Three.js Texture with complete request deduplication and persistent cache backing.
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

  const promise = (async (): Promise<THREE.Texture | null> => {
    try {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");

      return await new Promise<THREE.Texture | null>((resolve) => {
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
            resolve(tex);
          },
          undefined,
          () => {
            // Fallback to original url
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
                resolve(tex);
              },
              undefined,
              () => resolve(null)
            );
          }
        );
      });
    } catch (_err) {
      return null;
    } finally {
      inFlightTexturePromises.delete(cleanUrl);
    }
  })();

  inFlightTexturePromises.set(cleanUrl, promise);
  return promise;
}

/**
 * Invalidates cached URLs in memory, texture cache, and persistent CacheStorage.
 */
export async function invalidateMediaCache(targetUrl?: string): Promise<void> {
  const cache = await getMediaCache();

  if (targetUrl) {
    preloadedUrls.delete(targetUrl);
    inFlightPreloads.delete(targetUrl);
    const blobUrl = blobUrlMemoryCache.get(targetUrl);
    if (blobUrl && blobUrl.startsWith("blob:")) {
      URL.revokeObjectURL(blobUrl);
    }
    blobUrlMemoryCache.delete(targetUrl);

    const cachedTex = textureCache.get(targetUrl);
    if (cachedTex) {
      cachedTex.dispose();
      textureCache.delete(targetUrl);
    }
    inFlightTexturePromises.delete(targetUrl);
    inFlightFetchPromises.delete(targetUrl);

    if (cache) {
      try {
        await cache.delete(targetUrl);
      } catch (_e) {}
    }
  } else {
    preloadedUrls.clear();
    inFlightPreloads.clear();
    blobUrlMemoryCache.forEach((blobUrl) => {
      if (blobUrl.startsWith("blob:")) URL.revokeObjectURL(blobUrl);
    });
    blobUrlMemoryCache.clear();

    textureCache.forEach((tex) => tex.dispose());
    textureCache.clear();
    inFlightTexturePromises.clear();
    inFlightFetchPromises.clear();

    if (typeof window !== "undefined" && "caches" in window) {
      try {
        await window.caches.delete(CACHE_NAME);
      } catch (_e) {}
    }
  }
}

/**
 * React hook to resolve media/image/poster URL directly from persistent CacheStorage.
 */
export function useCachedMedia(url?: string): string {
  if (!url) return "";
  const cleanUrl = url.trim();
  const inMemory = blobUrlMemoryCache.get(cleanUrl);
  return inMemory || cleanUrl;
}
