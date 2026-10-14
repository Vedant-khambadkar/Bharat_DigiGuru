import { useState, useEffect } from "react";

export type DeviceTier = "mobile" | "tablet" | "desktop";
export type CapabilityTier = "high" | "medium" | "low"; // Tier A, B, C

export interface ResponsiveTierState {
  tier: DeviceTier;
  capabilityTier: CapabilityTier;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  prefersReducedMotion: boolean;
  maxDpr: number;
  maxSimultaneousVideos: number;
  enableComplexShaders: boolean;
  enableLenis: boolean;
  allowCardHoverEffects: boolean;
  shouldRenderHero3D: boolean;
  shouldRenderTeam3D: boolean;
  shouldRenderPortfolio3D: boolean;
}

function getInitialTier(): DeviceTier {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function evaluateCapability(prefersReducedMotion: boolean): CapabilityTier {
  if (typeof window === "undefined") return "high";
  if (prefersReducedMotion) return "low";

  // Check hardware concurrency (CPU cores hint)
  const concurrency = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;

  // Check device memory in GB (Chrome/Edge/Android hint)
  const memory = typeof navigator !== "undefined" ? (navigator as any).deviceMemory || 4 : 4;

  // Check Data Saver mode
  const saveData = typeof navigator !== "undefined" && Boolean((navigator as any).connection?.saveData);
  if (saveData) return "low";

  // WebGL hardware capabilities probe
  let webglTier: "high" | "medium" | "low" = "medium";
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) {
      return "low";
    }
    const maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 2048;
    if (maxTexSize < 4096) {
      webglTier = "low";
    } else if (maxTexSize >= 8192) {
      webglTier = "high";
    }
    // Clean up temporary context immediately
    const loseContext = gl.getExtension("WEBGL_lose_context");
    if (loseContext) loseContext.loseContext();
  } catch (_e) {
    webglTier = "medium";
  }

  // Tier C: Constrained CPU (<4 cores), constrained memory (<3GB), or low WebGL limit
  if (concurrency < 4 || memory < 3 || webglTier === "low") {
    return "low";
  }

  // Tier A: High-end device (>= 6 cores, >= 6GB RAM, WebGL >= 8192 texture size)
  if (concurrency >= 6 && memory >= 6 && webglTier === "high") {
    return "high";
  }

  // Tier B: Standard modern mobile device
  return "medium";
}

function buildTierState(tier: DeviceTier, isTouch: boolean, prefersReducedMotion: boolean): ResponsiveTierState {
  const isMobile = tier === "mobile";
  const isTablet = tier === "tablet";
  const isDesktop = tier === "desktop";

  const capabilityTier = isDesktop ? "high" : evaluateCapability(prefersReducedMotion);

  // Maximum device pixel ratio calibrated for performance and visual fidelity
  let maxDpr = 1.35;
  if (isMobile) {
    if (capabilityTier === "high") {
      maxDpr = 1.25;
    } else if (capabilityTier === "medium") {
      maxDpr = 1.1;
    } else {
      maxDpr = 1.0;
    }
  } else if (isTablet) {
    maxDpr = capabilityTier === "low" ? 1.0 : 1.2;
  }

  // Simultaneous video decoders policy: mobile hardware limits to 1 to prevent GPU exhaustion
  const maxSimultaneousVideos = isDesktop ? 3 : capabilityTier === "high" ? 2 : 1;

  // Lenis should strictly run on desktop mouse wheel; mobile uses native momentum scrolling
  const enableLenis = isDesktop && !isTouch;

  return {
    tier,
    capabilityTier,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    prefersReducedMotion,
    maxDpr,
    maxSimultaneousVideos,
    enableComplexShaders: isDesktop || capabilityTier === "high",
    enableLenis,
    allowCardHoverEffects: !isTouch && isDesktop,
    // Desktop renders full 3D interactive hero. Mobile uses bespoke award-winning MobileHeroShowcase.
    shouldRenderHero3D: isDesktop,
    // Team 3D scene renders on desktop and high/medium capability mobile when scrolled to
    shouldRenderTeam3D: isDesktop || (capabilityTier !== "low" && !prefersReducedMotion),
    // Portfolio 3D canvas is desktop-native; mobile uses responsive card deck with optional 3D toggle
    shouldRenderPortfolio3D: isDesktop,
  };
}

function getInitialState(): ResponsiveTierState {
  const tier = getInitialTier();
  const isTouch =
    typeof window !== "undefined"
      ? Boolean(window.matchMedia?.("(pointer: coarse)").matches || "ontouchstart" in window)
      : false;
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
      : false;

  return buildTierState(tier, isTouch, prefersReducedMotion);
}

export function useResponsiveTier(): ResponsiveTierState {
  const [state, setState] = useState<ResponsiveTierState>(getInitialState);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const tabletQuery = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touchQuery = window.matchMedia("(pointer: coarse)");

    const updateState = () => {
      let currentTier: DeviceTier = "desktop";
      if (mobileQuery.matches) {
        currentTier = "mobile";
      } else if (tabletQuery.matches) {
        currentTier = "tablet";
      }

      const isTouch = Boolean(touchQuery.matches || "ontouchstart" in window);
      const prefersReducedMotion = Boolean(motionQuery.matches);

      setState(buildTierState(currentTier, isTouch, prefersReducedMotion));
    };

    updateState();

    mobileQuery.addEventListener("change", updateState);
    tabletQuery.addEventListener("change", updateState);
    motionQuery.addEventListener("change", updateState);
    touchQuery.addEventListener("change", updateState);

    return () => {
      mobileQuery.removeEventListener("change", updateState);
      tabletQuery.removeEventListener("change", updateState);
      motionQuery.removeEventListener("change", updateState);
      touchQuery.removeEventListener("change", updateState);
    };
  }, []);

  return state;
}
