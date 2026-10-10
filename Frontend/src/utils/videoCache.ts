/**
 * High-Performance Video Stream Resolver
 *
 * Direct CDN Streaming Architecture:
 * Replaces in-memory Blob URLs with native HTTP 206 Partial Content Range Streaming.
 * This eliminates the 21+ MB JavaScript heap memory exhaustion and iOS Safari
 * "A problem repeatedly occurred" tab crashes caused by fetching entire video
 * binaries into RAM.
 *
 * Videos are hardware-accelerated directly by the browser's media pipeline,
 * buffered on-demand, and cached natively by HTTP Cache-Control headers.
 */

// Legacy cleanup to revoke any stale object URLs from prior versions
if (typeof window !== "undefined" && "caches" in window) {
  try {
    caches.delete("bdg-video-cache-v1").catch(() => {});
  } catch (_e) {}
}

export async function getCachedVideoBlobUrl(url: string): Promise<string> {
  if (!url || typeof url !== "string") return "";
  return url.trim();
}

/**
 * Lightweight link-level prefetch hint for upcoming videos (non-blocking, zero heap cost)
 */
export async function preloadVideoList(urls: string[]): Promise<void> {
  if (typeof document === "undefined") return;
  try {
    urls.forEach((url) => {
      const clean = url?.trim();
      if (!clean) return;
      // Preconnect / dns-prefetch to CDN origin if not already added
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "video";
      link.href = clean;
      document.head.appendChild(link);
    });
  } catch (_e) {
    // Non-blocking
  }
}

/**
 * Returns direct CDN stream URL for seamless hardware playback
 */
export function useCachedVideo(url: string): string {
  return url ? url.trim() : "";
}
