/**
 * High-Performance Client-Side Media & Image Cache
 * 
 * Uses the browser's CacheStorage API (caches) and in-memory Blob URLs
 * to cache images, 3D textures, and media assets locally.
 * 
 * When a page reloads, assets are retrieved directly from the local browser
 * cache (0ms latency), completely avoiding repeated network requests to CloudFront CDN.
 */

const CACHE_NAME = "us-media-cache-v1";
const memoryBlobMap = new Map<string, string>();
const inFlightRequests = new Map<string, Promise<string>>();

/**
 * Checks if the browser supports the CacheStorage API
 */
const isCacheStorageSupported = (): boolean => {
  return typeof window !== "undefined" && "caches" in window;
};

/**
 * Retrieves a locally cached Object URL (Blob) for any media or image URL.
 * If not already cached, it fetches the asset from CloudFront/CDN once,
 * stores it in CacheStorage for future reloads, and returns the local Blob URL.
 */
export async function getCachedMediaUrl(url?: string): Promise<string> {
  if (!url || typeof url !== "string") return "";
  const cleanUrl = url.trim();
  if (!cleanUrl) return "";

  // Data URLs and existing Blob URLs don't need caching
  if (cleanUrl.startsWith("data:") || cleanUrl.startsWith("blob:")) {
    return cleanUrl;
  }

  // 1. Check Fast In-Memory Blob URL Cache (Instant 0ms)
  if (memoryBlobMap.has(cleanUrl)) {
    return memoryBlobMap.get(cleanUrl)!;
  }

  // 2. Prevent Duplicate In-Flight Network Requests for the same asset
  if (inFlightRequests.has(cleanUrl)) {
    return inFlightRequests.get(cleanUrl)!;
  }

  const fetchAndCachePromise = (async (): Promise<string> => {
    try {
      if (isCacheStorageSupported()) {
        const cache = await window.caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(cleanUrl);

        // 3. Cache Hit in Browser CacheStorage!
        if (cachedResponse && cachedResponse.ok) {
          const blob = await cachedResponse.blob();
          const blobUrl = URL.createObjectURL(blob);
          memoryBlobMap.set(cleanUrl, blobUrl);
          return blobUrl;
        }

        // 4. Cache Miss: Fetch from CloudFront CDN once and persist to CacheStorage
        try {
          const response = await fetch(cleanUrl, {
            mode: "cors",
            credentials: "omit",
          });

          if (response.ok) {
            // Clone response before consuming it for CacheStorage
            await cache.put(cleanUrl, response.clone());
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            memoryBlobMap.set(cleanUrl, blobUrl);
            return blobUrl;
          }
        } catch (fetchErr) {
          // If CORS or network prevents fetch, fallback to normal direct URL
          console.debug("[MediaCache] Direct fetch notice for:", cleanUrl, fetchErr);
        }
      }
    } catch (err) {
      console.warn("[MediaCache] CacheStorage read error:", err);
    }

    // Fallback: return original URL if caching could not be completed
    return cleanUrl;
  })();

  inFlightRequests.set(cleanUrl, fetchAndCachePromise);

  try {
    const finalUrl = await fetchAndCachePromise;
    return finalUrl;
  } finally {
    inFlightRequests.delete(cleanUrl);
  }
}

/**
 * Pre-caches a list of media or image URLs in the background
 * without blocking UI rendering.
 */
export async function preloadMediaList(urls: (string | undefined)[]): Promise<void> {
  const validUrls = urls.filter((u): u is string => typeof u === "string" && Boolean(u.trim()));
  if (validUrls.length === 0) return;

  // Process preloads in parallel
  await Promise.allSettled(validUrls.map((url) => getCachedMediaUrl(url)));
}

/**
 * Invalidates and removes a specific URL or the entire media cache
 * (e.g. when an admin uploads a new version of an image).
 */
export async function invalidateMediaCache(targetUrl?: string): Promise<void> {
  try {
    if (targetUrl) {
      if (memoryBlobMap.has(targetUrl)) {
        const oldBlob = memoryBlobMap.get(targetUrl);
        if (oldBlob && oldBlob.startsWith("blob:")) {
          URL.revokeObjectURL(oldBlob);
        }
        memoryBlobMap.delete(targetUrl);
      }
      if (isCacheStorageSupported()) {
        const cache = await window.caches.open(CACHE_NAME);
        await cache.delete(targetUrl);
      }
    } else {
      // Revoke all in-memory blob URLs
      memoryBlobMap.forEach((blobUrl) => {
        if (blobUrl.startsWith("blob:")) URL.revokeObjectURL(blobUrl);
      });
      memoryBlobMap.clear();

      if (isCacheStorageSupported()) {
        await window.caches.delete(CACHE_NAME);
      }
    }
  } catch (err) {
    console.error("[MediaCache] Invalidation error:", err);
  }
}

/**
 * React hook to automatically resolve and cache any media/image/poster URL.
 * Returns local Blob URL from CacheStorage when cached.
 */
import { useState, useEffect } from "react";

export function useCachedMedia(url?: string): string {
  const [cachedUrl, setCachedUrl] = useState<string>(() => {
    if (!url) return "";
    if (url.startsWith("data:") || url.startsWith("blob:")) return url;
    return memoryBlobMap.get(url) || url;
  });

  useEffect(() => {
    if (!url) {
      setCachedUrl("");
      return;
    }
    let isMounted = true;
    getCachedMediaUrl(url)
      .then((res) => {
        if (isMounted && res) {
          setCachedUrl(res);
        }
      })
      .catch(() => {
        if (isMounted) setCachedUrl(url);
      });

    return () => {
      isMounted = false;
    };
  }, [url]);

  return cachedUrl;
}
