/**
 * Stale-While-Revalidate API Cache with LocalStorage & Memory Persistence
 * 
 * Ensures public API data (like Portfolio and 3D Projects) is displayed immediately
 * on page reload with 0ms loading spinners, while synchronizing with the backend
 * and WebSockets in the background.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryStore = new Map<string, CacheEntry<any>>();
const CACHE_PREFIX = "us_api_cache_";

export function getApiCache<T>(key: string, maxAgeMs = 1000 * 60 * 60 * 24): T | null {
  try {
    // 1. Memory Check
    const mem = memoryStore.get(key);
    if (mem && Date.now() - mem.timestamp < maxAgeMs) {
      return mem.data as T;
    }

    // 2. LocalStorage Check
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (stored) {
        const parsed: CacheEntry<T> = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < maxAgeMs) {
          memoryStore.set(key, parsed);
          return parsed.data;
        }
      }
    }
  } catch (err) {
    console.debug("[ApiCache] Read error:", err);
  }
  return null;
}

export function setApiCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    memoryStore.set(key, entry);

    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    }
  } catch (err) {
    console.debug("[ApiCache] Write error:", err);
  }
}

export function invalidateApiCache(keyOrPrefix?: string | string[]): void {
  try {
    if (!keyOrPrefix) {
      memoryStore.clear();
      if (typeof window !== "undefined" && window.localStorage) {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith(CACHE_PREFIX)) {
            localStorage.removeItem(k);
          }
        });
      }
      return;
    }

    const targets = Array.isArray(keyOrPrefix) ? keyOrPrefix : [keyOrPrefix];

    // Remove exact match or prefix/substring matches
    Array.from(memoryStore.keys()).forEach((k) => {
      if (targets.some((target) => k === target || k.startsWith(target) || k.includes(target))) {
        memoryStore.delete(k);
      }
    });

    if (typeof window !== "undefined" && window.localStorage) {
      Object.keys(localStorage).forEach((k) => {
        if (
          k.startsWith(CACHE_PREFIX) &&
          targets.some(
            (target) =>
              k.startsWith(`${CACHE_PREFIX}${target}`) ||
              k.includes(target)
          )
        ) {
          localStorage.removeItem(k);
        }
      });
    }
  } catch (err) {
    console.debug("[ApiCache] Invalidation error:", err);
  }
}
