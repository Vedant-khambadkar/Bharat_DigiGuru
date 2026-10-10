/**
 * Bharat DigiGuru Performance & WebGL Diagnostic Telemetry Monitor
 * Tracks real-time FPS, long tasks, asset load latency, GPU info, and memory metrics.
 */

interface PerfTelemetry {
  navigationTiming: {
    ttfb: number;
    domContentLoaded: number;
    loadComplete: number;
  };
  metrics: {
    firstMeaningfulFrame: number | null;
    heroMacStartTime: number | null;
    heroMacReadyTime: number | null;
    businessmanReadyTime: number | null;
    longTaskCount: number;
    totalLongTaskDuration: number;
    activeTexturesCount: number;
  };
  gpuInfo?: {
    vendor?: string;
    renderer?: string;
  };
  getReport: () => void;
}

declare global {
  interface Window {
    __BDG_PERF__?: PerfTelemetry;
    __bdgMacStartTime?: number;
  }
}

export function initPerformanceMonitor() {
  if (typeof window === "undefined") return;

  const telemetry: PerfTelemetry = {
    navigationTiming: {
      ttfb: 0,
      domContentLoaded: 0,
      loadComplete: 0,
    },
    metrics: {
      firstMeaningfulFrame: null,
      heroMacStartTime: window.__bdgMacStartTime || null,
      heroMacReadyTime: null,
      businessmanReadyTime: null,
      longTaskCount: 0,
      totalLongTaskDuration: 0,
      activeTexturesCount: 0,
    },
    getReport: () => {
      console.group("%c[BDG Production Performance Report]", "color: #ff5500; font-weight: bold; font-size: 14px;");
      console.table({
        "TTFB (ms)": telemetry.navigationTiming.ttfb.toFixed(1),
        "DOM Content Loaded (ms)": telemetry.navigationTiming.domContentLoaded.toFixed(1),
        "Load Complete (ms)": telemetry.navigationTiming.loadComplete.toFixed(1),
        "First Meaningful Frame (ms)": telemetry.metrics.firstMeaningfulFrame?.toFixed(1) || "Pending",
        "Hero Mac Load Duration (ms)": telemetry.metrics.heroMacStartTime && telemetry.metrics.heroMacReadyTime
          ? (telemetry.metrics.heroMacReadyTime - telemetry.metrics.heroMacStartTime).toFixed(1)
          : "N/A",
        "Long Tasks (>50ms)": telemetry.metrics.longTaskCount,
        "Total Long Task Delay (ms)": telemetry.metrics.totalLongTaskDuration.toFixed(1),
      });
      if (telemetry.gpuInfo) {
        console.log("GPU Hardware:", telemetry.gpuInfo);
      }
      if ((performance as any).memory) {
        const mem = (performance as any).memory;
        console.log("Heap Memory:", {
          usedMB: (mem.usedJSHeapSize / 1048576).toFixed(1),
          totalMB: (mem.totalJSHeapSize / 1048576).toFixed(1),
          limitMB: (mem.jsHeapSizeLimit / 1048576).toFixed(1),
        });
      }
      console.groupEnd();
    },
  };

  window.__BDG_PERF__ = telemetry;

  // 1. Navigation Timing Metrics
  window.addEventListener("load", () => {
    setTimeout(() => {
      const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (navEntry) {
        telemetry.navigationTiming.ttfb = navEntry.responseStart;
        telemetry.navigationTiming.domContentLoaded = navEntry.domContentLoadedEventEnd;
        telemetry.navigationTiming.loadComplete = navEntry.loadEventEnd;
      }
    }, 100);
  });

  // 2. Track First Meaningful Frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      telemetry.metrics.firstMeaningfulFrame = performance.now();
    });
  });

  // 3. PerformanceObserver for Long Tasks (>50ms main-thread blocking)
  if (typeof PerformanceObserver !== "undefined") {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          telemetry.metrics.longTaskCount++;
          telemetry.metrics.totalLongTaskDuration += entry.duration;
        }
      });
      longTaskObserver.observe({ entryTypes: ["longtask"] });
    } catch {
      // Not supported in all environments
    }
  }

  // 4. Capture GPU Adapter details non-intrusively
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl && "getExtension" in gl) {
      const dbg = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
      if (dbg) {
        telemetry.gpuInfo = {
          vendor: (gl as WebGLRenderingContext).getParameter(dbg.UNMASKED_VENDOR_WEBGL),
          renderer: (gl as WebGLRenderingContext).getParameter(dbg.UNMASKED_RENDERER_WEBGL),
        };
      }
    }
    canvas.remove();
  } catch {
    // Non-blocking
  }
}

export function recordMacReadyTime() {
  if (typeof window !== "undefined" && window.__BDG_PERF__) {
    window.__BDG_PERF__.metrics.heroMacReadyTime = performance.now();
  }
}

export function recordBusinessmanReadyTime() {
  if (typeof window !== "undefined" && window.__BDG_PERF__) {
    window.__BDG_PERF__.metrics.businessmanReadyTime = performance.now();
  }
}
