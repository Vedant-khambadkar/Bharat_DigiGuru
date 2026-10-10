import React, { useState, useRef, useMemo } from "react";
import type { PlaneItem } from "../SkinnedPlane";
import { Sparkles, X, ExternalLink, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

interface MobilePortfolioDeckProps {
  planes: PlaneItem[];
  selectedPlane?: PlaneItem | null;
  onSelectPlane: (plane: PlaneItem) => void;
  onEnable3D?: () => void;
  is3DActive?: boolean;
}

export const MobilePortfolioDeck: React.FC<MobilePortfolioDeckProps> = ({
  planes,
  selectedPlane: _selectedPlane,
  onSelectPlane,
  onEnable3D: _onEnable3D,
  is3DActive: _is3DActive = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [detailModalPlane, setDetailModalPlane] = useState<PlaneItem | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    planes.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [planes]);

  // Filtered planes
  const filteredPlanes = useMemo(() => {
    if (activeCategory === "ALL") return planes;
    return planes.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());
  }, [planes, activeCategory]);

  const scrollTicking = useRef(false);

  const handleCardScroll = () => {
    if (scrollTicking.current) return;
    scrollTicking.current = true;
    requestAnimationFrame(() => {
      scrollTicking.current = false;
      const el = scrollContainerRef.current;
      if (!el || filteredPlanes.length === 0) return;
      const cardWidth = el.clientWidth * 0.84 || 320;
      const newIdx = Math.round(el.scrollLeft / cardWidth);
      const clamped = Math.max(0, Math.min(newIdx, filteredPlanes.length - 1));
      if (clamped !== activeIndex) {
        setActiveIndex(clamped);
      }
    });
  };

  const scrollToIndex = (idx: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const targetIdx = Math.max(0, Math.min(idx, filteredPlanes.length - 1));
    const cardWidth = el.clientWidth * 0.84 || 320;
    el.scrollTo({
      left: targetIdx * cardWidth,
      behavior: "smooth",
    });
    setActiveIndex(targetIdx);
    onSelectPlane(filteredPlanes[targetIdx]);
  };

  const handleOpenContact = () => {
    setDetailModalPlane(null);
    const target = document.getElementById("contact-section");
    if (target) {
      const lenis = (window as any).lenis;
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(target, { duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // const currentItem = filteredPlanes[activeIndex] || selectedPlane || planes[0];

  return (
    <div className="relative z-10 w-full min-h-[100svh] flex flex-col justify-between pt-20 pb-8 px-4 sm:px-6 select-none overflow-hidden">
      {/* Ambient Color Glow reacting to active card color */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full blur-[60px] pointer-events-none opacity-15"
      />

      {/* TOP HEADER & VIEW MODE CONTROLS */}
      <div className="w-full max-w-lg mx-auto flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <div className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-[0.25em] text-[#ff3b30] uppercase font-semibold">
            <Sparkles className="w-2.5 h-2.5" />
            <span>SELECTED COMMISSIONS</span>
          </div>
          <h2 className="font-['Neuropol_X',sans-serif] text-2xl sm:text-3xl text-white tracking-wider uppercase mt-1">
            PORTFOLIO
          </h2>
        </div>

      </div>

      {/* CATEGORY FILTER PILLS */}
      <div
        className="w-full max-w-lg mx-auto overflow-x-auto no-scrollbar py-2 my-1 flex items-center gap-1.5 touch-pan-x touch-pan-y"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
      >
        {categories.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setActiveIndex(0);
                if (scrollContainerRef.current) {
                  scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
                }
              }}
              className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-white text-black font-semibold shadow-md"
                  : "bg-white/[0.04] text-neutral-400 hover:text-white border border-white/10"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* HORIZONTAL SWIPING EDITORIAL MAGAZINE CARDS */}
      <div
        ref={scrollContainerRef}
        onScroll={handleCardScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-proximity py-3 no-scrollbar touch-pan-x touch-pan-y w-full max-w-lg mx-auto scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          overscrollBehaviorY: "auto",
        }}
      >
        {filteredPlanes.map((plane, idx) => {
          const isActive = idx === activeIndex;
          const displayIdx = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
          const totalCount = filteredPlanes.length < 10 ? `0${filteredPlanes.length}` : `${filteredPlanes.length}`;

          return (
            <div
              key={plane.id}
              onClick={() => {
                setActiveIndex(idx);
                onSelectPlane(plane);
              }}
              className={`flex-shrink-0 w-[84vw] max-w-[350px] snap-center rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                isActive
                  ? "border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_24px_rgba(255,59,48,0.2)] scale-[1.01]"
                  : "border-white/10 opacity-75 scale-[0.96] hover:opacity-90"
              } bg-[#0e0e12]/98 shadow-xl flex flex-col will-change-transform`}
            >
              {/* Media Still */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-neutral-900">
                {plane.textureUrl ? (
                  <img
                    src={plane.textureUrl}
                    alt={plane.title}
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-mono text-xs text-neutral-400"
                    style={{ backgroundColor: plane.color || "#111" }}
                  >
                    BDG STUDIO ARCHIVE
                  </div>
                )}

                {/* Overlaid Vignette Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/40 pointer-events-none" />

                {/* Top Badge: Category */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[8.5px] font-mono text-white uppercase tracking-wider font-medium">
                  {plane.category || "3D CGI & ARCHVIZ"}
                </div>

                {/* Top Badge: Number */}
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-mono text-neutral-300 font-bold">
                  {displayIdx} / {totalCount}
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="p-4 flex flex-col gap-1.5 bg-neutral-950/80">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#ff6633]">
                    FEATURED CASE
                  </span>
                  <span className="text-[8px] font-mono text-neutral-400 uppercase">
                    COMMERCIAL 4K
                  </span>
                </div>

                <h3 className="font-['Neuropol_X',sans-serif] text-base text-white tracking-wider uppercase truncate">
                  {plane.title}
                </h3>

                <p className="text-[11px] text-neutral-400 font-sans line-clamp-1">
                  High-fidelity photorealistic rendering, bespoke asset direction, and cinematic composition.
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM CONTROLS & PAGINATION RAIL */}
      <div className="w-full max-w-lg mx-auto flex flex-col gap-2 pt-2">
        {/* Progress Bar Line */}
        <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#ff3b30] to-[#ff6633] transition-all duration-300"
            style={{
              width: `${((activeIndex + 1) / Math.max(filteredPlanes.length, 1)) * 100}%`,
            }}
          />
        </div>

        {/* Counter & Thumb Navigation Buttons */}
        <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-neutral-400 uppercase">
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous project"
              className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 text-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex >= filteredPlanes.length - 1}
              aria-label="Next project"
              className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 text-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-white font-semibold">
            PROJECT {activeIndex + 1} OF {filteredPlanes.length}
          </span>
        </div>
      </div>

      {/* DETAILED PROJECT DOSSIER MODAL DRAWER */}
      {detailModalPlane && (
        <div
          data-lenis-prevent="true"
          className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-2xl flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fadeIn"
        >
          {/* Backdrop Click Dismiss */}
          <div
            onClick={() => setDetailModalPlane(null)}
            className="fixed inset-0 -z-10"
          />

          <div className="w-full max-w-lg bg-[#0e0e12] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-[0_-10px_50px_rgba(0,0,0,0.9)] text-white p-5 max-h-[90vh] overflow-y-auto flex flex-col gap-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono tracking-[0.2em] text-[#ff5500] uppercase">
                  CASE DOSSIER // {detailModalPlane.category || "3D CGI"}
                </span>
                <h3 className="font-['Neuropol_X',sans-serif] text-lg text-white uppercase tracking-wider mt-0.5">
                  {detailModalPlane.title}
                </h3>
              </div>
              <button
                onClick={() => setDetailModalPlane(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High-Resolution Project Media Frame */}
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-900 border border-white/10">
              <img
                src={detailModalPlane.textureUrl}
                alt={detailModalPlane.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Disciplines & Scope Breakdown */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                DISCIPLINES INVOLVED:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "3D CGI & ArchViz Modeling",
                  "Physically-Based Shading",
                  "Dynamic Studio Lighting",
                  "4K Master Composition",
                ].map((item) => (
                  <div
                    key={item}
                    className="p-2 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-1.5 text-[10px] text-neutral-300 font-mono"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#ff3b30] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={handleOpenContact}
                className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-[#ff3b30] to-[#ff5500] active:scale-95 text-white font-mono text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(255,59,48,0.4)] cursor-pointer"
              >
                <span>Initiate Similar Project</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDetailModalPlane(null)}
                className="py-3 px-4 rounded-full bg-white/[0.05] border border-white/15 text-neutral-300 font-mono text-[10px] uppercase tracking-widest cursor-pointer active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilePortfolioDeck;
