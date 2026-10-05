/**
 * High-Performance Client-Side Media & Texture Pipeline
 * 
 * Leverages native Browser HTTP Cache + CloudFront CDN directly,
 * eliminating the expensive CacheStorage -> Blob -> Object URL duplication.
 * 
 * Key Features:
 * 1. Direct, instant URL resolution (0ms overhead)
 * 2. In-flight request deduplication
 * 3. Controlled concurrency for background preloading (never saturates network)
 * 4. Progressive idle loading via requestIdleCallback
 * 5. Clean cache invalidation for Admin mutations
 */

const inFlightPreloads = new Set<string>();
const preloadedUrls = new Set<string>();

/**
 * Returns clean, resolved media URL.
 * Bypasses redundant manual fetch + Blob creation, allowing the browser's
 * highly-optimized HTTP network cache and Three.js ImageLoader to work directly.
 */
export async function getCachedMediaUrl(url?: string): Promise<string> {
  if (!url || typeof url !== "string") return "";
  const cleanUrl = url.trim();
  if (!cleanUrl) return "";

  // Data URLs, Blob URLs, or standard HTTP/HTTPS URLs resolve immediately
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
    }, 120);
  } else {
    await runQueue();
  }
}

/**
 * Invalidates cached URLs in memory and tracking sets
 * (e.g. when an admin uploads a new version of an image).
 */
export async function invalidateMediaCache(targetUrl?: string): Promise<void> {
  if (targetUrl) {
    preloadedUrls.delete(targetUrl);
    inFlightPreloads.delete(targetUrl);
  } else {
    preloadedUrls.clear();
    inFlightPreloads.clear();
  }
}

/**
 * React hook to resolve media/image/poster URL directly.
 */
export function useCachedMedia(url?: string): string {
  return url ? url.trim() : "";
}
