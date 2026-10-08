import { useState, useEffect } from "react";

const VIDEO_CACHE_NAME = "bdg-video-cache-v1";
const videoBlobUrlCache = new Map<string, string>();
const inFlightVideoPromises = new Map<string, Promise<string>>();

/**
 * Returns a cached Blob URL for the given video URL.
 * Uses the browser Cache Storage API to store video bytes permanently on disk.
 * On subsequent visits / reloads, the video is decoded immediately from local disk/IndexedDB
 * as a blob: URL, with ZERO requests sent to CloudFront or S3.
 */
export async function getCachedVideoBlobUrl(url: string): Promise<string> {
  if (!url || typeof url !== "string") return "";
  const cleanUrl = url.trim();
  if (!cleanUrl) return "";

  // 1. In-memory blob URL cache hit (instant 0ms)
  if (videoBlobUrlCache.has(cleanUrl)) {
    return videoBlobUrlCache.get(cleanUrl)!;
  }

  // 2. In-flight fetch deduplication (prevents duplicate downloads)
  if (inFlightVideoPromises.has(cleanUrl)) {
    return inFlightVideoPromises.get(cleanUrl)!;
  }

  const fetchPromise = (async () => {
    try {
      if (typeof window !== "undefined" && "caches" in window) {
        const cache = await caches.open(VIDEO_CACHE_NAME);
        const cachedResponse = await cache.match(cleanUrl);

        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          const blobUrl = URL.createObjectURL(blob);
          videoBlobUrlCache.set(cleanUrl, blobUrl);
          return blobUrl;
        }

        // Fetch from CloudFront CDN once and store in Cache Storage
        const res = await fetch(cleanUrl, { mode: "cors" });
        if (res.ok) {
          await cache.put(cleanUrl, res.clone());
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          videoBlobUrlCache.set(cleanUrl, blobUrl);
          return blobUrl;
        }
      }
    } catch (err) {
      console.warn("[VideoCache] CacheStorage error for:", cleanUrl, err);
    }

    // Fallback: return clean URL if CacheStorage is unsupported/offline
    return cleanUrl;
  })();

  inFlightVideoPromises.set(cleanUrl, fetchPromise);
  return fetchPromise;
}

/**
 * Preload an array of video URLs into the persistent CacheStorage.
 */
export async function preloadVideoList(urls: string[]): Promise<void> {
  const valid = urls.filter((u) => typeof u === "string" && Boolean(u.trim()));
  await Promise.allSettled(valid.map((u) => getCachedVideoBlobUrl(u)));
}

/**
 * React Hook that seamlessly supplies the persistent Blob URL for any video.
 * Fallbacks to the CDN URL immediately if the blob is still downloading.
 */
export function useCachedVideo(url: string): string {
  const [blobSrc, setBlobSrc] = useState<string>(() => videoBlobUrlCache.get(url) || url);

  useEffect(() => {
    let isMounted = true;

    if (videoBlobUrlCache.has(url)) {
      setBlobSrc(videoBlobUrlCache.get(url)!);
      return;
    }

    getCachedVideoBlobUrl(url).then((resolvedUrl) => {
      if (isMounted && resolvedUrl) {
        setBlobSrc(resolvedUrl);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [url]);

  return blobSrc;
}
