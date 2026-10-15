import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Sparkles } from "lucide-react";
import { userService } from "../services/service/userService";
import { onSocketEvent } from "../utils/socket";
import type { BrandCollaboration } from "../types/brand";

interface BrandCollaborationsProps {
  className?: string;
}

export const BrandCollaborations: React.FC<BrandCollaborationsProps> = ({ className = "" }) => {
  const [brands, setBrands] = useState<BrandCollaboration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const fetchActiveBrands = useCallback(async (forceRefresh = false) => {
    try {
      const res = await userService.getBrandCollaborations(forceRefresh);
      const items: BrandCollaboration[] = Array.isArray(res)
        ? res
        : res?.items || res?.data || [];
      // Ensure only active brands are shown and sorted by configured display order
      const activeList = items
        .filter((b) => b.isActive !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setBrands(activeList);
      setHasError(false);
    } catch (err: any) {
      console.warn("⚠️ Failed to load brand collaborations:", err.message);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveBrands();
  }, [fetchActiveBrands]);

  // Real-time synchronization via Socket.IO
  useEffect(() => {
    const unsubCreated = onSocketEvent("brand:created", () => fetchActiveBrands(true));
    const unsubUpdated = onSocketEvent("brand:updated", () => fetchActiveBrands(true));
    const unsubDeleted = onSocketEvent("brand:deleted", () => fetchActiveBrands(true));
    const unsubReordered = onSocketEvent("brands:reordered", () => fetchActiveBrands(true));

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
      unsubReordered();
    };
  }, [fetchActiveBrands]);

  // Create duplicated logo sets for seamless infinite loop along the X-axis
  // If we have fewer than 6 brands, repeat the sequence enough times so that
  // the continuous track spans wide displays without gaps.
  const displaySets = useMemo(() => {
    if (brands.length === 0) return [];

    let baseSet = brands;
    // Ensure base set has at least 8 elements for wide tracks
    while (baseSet.length < 8) {
      baseSet = [...baseSet, ...brands];
    }
    // Return 2 identical groups so translateX(-50%) creates an infinite seamless loop
    return [baseSet, baseSet];
  }, [brands]);

  // Consistent animation duration based on total logo count
  const animationDurationSeconds = useMemo(() => {
    const totalCount = displaySets[0]?.length || 10;
    // ~3.5 seconds per logo item produces a graceful, premium pace
    return Math.max(25, totalCount * 3.5);
  }, [displaySets]);

  const [isVisible, setIsVisible] = useState<boolean>(true);
  const sectionRef = useRef<HTMLElement>(null);

  // Pause continuous CSS marquee when offscreen to conserve GPU resources
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: "100px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Gracefully handle empty or error state without crashing the website
  if (!isLoading && (hasError || brands.length === 0)) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="brand-collaborations"
      aria-label="Brands Trust Us"
      className={`relative w-full py-16 sm:py-20 text-white overflow-hidden select-none ${className}`}
    >
      {/* Background Ambience Gradient */}
      <div className="absolute inset-0 pointer-events-none" />

      {/* Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 sm:mb-14 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-neutral-300 font-mono text-[11px] sm:text-xs uppercase tracking-widest mb-3">
          <Sparkles size={13} className="text-red-500 animate-pulse" />
          <span>Strategic Partnerships</span>
        </div>

        <h2 className="font-['Syne',sans-serif] font-bold text-2xl sm:text-4xl md:text-5xl text-white tracking-tight uppercase">
          Brands Trust Us
        </h2>

        <p className="font-['Syne',sans-serif] text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto mt-3">
          Powering visionary brands and global mobile enterprises with world-class CGI, commercial visuals, and digital strategy.
        </p>
      </div>

      {/* Marquee Track Container with Gradient Edge Fades */}
      <div
        className="relative w-full overflow-hidden brand-slider-container group"
        style={{ touchAction: "pan-y" }}
      >
        {/* Left Edge Luxury Gradient Fade Mask */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 md:w-48 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent z-10" />

        {/* Right Edge Luxury Gradient Fade Mask */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 md:w-48 bg-gradient-to-l from-[#050505] via-[#050505]/80 to-transparent z-10" />

        {/* Continuous Horizontal Track Moving on X-Axis */}
        <div
          className="brand-slider-track flex items-center py-4"
          style={
            {
              "--brand-slider-duration": `${animationDurationSeconds}s`,
              animationPlayState: isVisible ? "running" : "paused",
            } as React.CSSProperties
          }
        >
          {displaySets.map((set, setIndex) => (
            <div
              key={`brand-set-${setIndex}`}
              className="flex items-center gap-6 sm:gap-10 md:gap-14 shrink-0 pr-6 sm:pr-10 md:pr-14"
              aria-hidden={setIndex > 0 ? "true" : undefined}
            >
              {set.map((brand, brandIndex) => (
                <div
                  key={`brand-${setIndex}-${brand.id}-${brandIndex}`}
                  className="flex items-center justify-center h-20 sm:h-24 px-6 sm:px-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/20 transition-all duration-300 group/card shrink-0"
                >
                  <img
                    src={brand.logoUrl}
                    alt={setIndex === 0 ? brand.altText || `${brand.name} logo` : ""}
                    tabIndex={setIndex === 0 ? 0 : -1}
                    loading={brandIndex < 6 ? "eager" : "lazy"}
                    decoding="async"
                    className="max-h-9 sm:max-h-12 max-w-[130px] sm:max-w-[170px] w-auto h-auto object-contain filter grayscale contrast-125 opacity-70 group-hover/card:grayscale-0 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-300 drop-shadow-md"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandCollaborations;
