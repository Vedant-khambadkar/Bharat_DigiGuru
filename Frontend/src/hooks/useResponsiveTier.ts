import { useState, useEffect } from "react";

export type DeviceTier = "mobile" | "tablet" | "desktop";

export interface ResponsiveTierState {
  tier: DeviceTier;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  prefersReducedMotion: boolean;
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

function getInitialState(): ResponsiveTierState {
  const tier = getInitialTier();
  const isTouch =
    typeof window !== "undefined"
      ? window.matchMedia?.("(pointer: coarse)").matches || "ontouchstart" in window
      : false;
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      : false;

  return {
    tier,
    isMobile: tier === "mobile",
    isTablet: tier === "tablet",
    isDesktop: tier === "desktop",
    isTouch,
    prefersReducedMotion,
    shouldRenderHero3D: tier === "desktop",
    shouldRenderTeam3D: tier === "desktop",
    shouldRenderPortfolio3D: tier === "desktop",
  };
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

      setState({
        tier: currentTier,
        isMobile: currentTier === "mobile",
        isTablet: currentTier === "tablet",
        isDesktop: currentTier === "desktop",
        isTouch: touchQuery.matches || "ontouchstart" in window,
        prefersReducedMotion: motionQuery.matches,
        // Desktop always renders full 3D experience.
        // Mobile replaces expensive 3D scenes with bespoke, lightweight, award-winning animated UI.
        shouldRenderHero3D: currentTier === "desktop",
        shouldRenderTeam3D: currentTier === "desktop",
        shouldRenderPortfolio3D: currentTier === "desktop",
      });
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
