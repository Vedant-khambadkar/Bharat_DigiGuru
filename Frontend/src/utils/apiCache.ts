/**
 * Stale-While-Revalidate API Cache with LocalStorage & Memory Persistence
 * 
 * Ensures public API data (like Services, Portfolio and 3D Projects) is displayed immediately
 * with 0ms loading spinners, while synchronizing with backend APIs & WebSockets in the background.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryStore = new Map<string, CacheEntry<any>>();
const CACHE_PREFIX = "us_api_cache_";
const MAX_LOCAL_STORAGE_BYTES = 512 * 1024; // 512KB limit per entry for localStorage

export function getApiCache<T>(key: string, maxAgeMs = 1000 * 60 * 60 * 24): T | null {
  try {
    const now = Date.now();

    // 1. Fast In-Memory Lookup
    const mem = memoryStore.get(key);
    if (mem) {
      if (now - mem.timestamp < maxAgeMs) {
        return mem.data as T;
      }
      memoryStore.delete(key);
    }

    // 2. LocalStorage Fallback (Promote to memory on hit)
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (stored) {
        const parsed: CacheEntry<T> = JSON.parse(stored);
        if (now - parsed.timestamp < maxAgeMs) {
          memoryStore.set(key, parsed);
          return parsed.data;
        }
        // Evict expired entry
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      }
    }
  } catch (err) {
    if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
      console.debug("[ApiCache] Read error:", err);
    }
  }
  return null;
}

export function setApiCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };

    // Always update fast in-memory store
    memoryStore.set(key, entry);

    if (typeof window !== "undefined" && window.localStorage) {
      const serialized = JSON.stringify(entry);

      // Protect localStorage quota: only store payloads under limit
      if (serialized.length <= MAX_LOCAL_STORAGE_BYTES) {
        localStorage.setItem(`${CACHE_PREFIX}${key}`, serialized);
      }
    }
  } catch (err) {
    // Graceful degradation on quota exceeded
    if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
      console.debug("[ApiCache] LocalStorage write skipped or quota full:", err);
    }
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

    // Remove exact match or prefix/substring matches from memory
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
    if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
      console.debug("[ApiCache] Invalidation error:", err);
    }
  }
}
