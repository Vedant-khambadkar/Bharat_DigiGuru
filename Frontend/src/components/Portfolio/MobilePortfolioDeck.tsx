import React, { useState, useRef } from "react";
import type { PlaneItem } from "../SkinnedPlane";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTicking = useRef(false);

  const handleCardScroll = () => {
    if (scrollTicking.current) return;
    scrollTicking.current = true;
    requestAnimationFrame(() => {
      scrollTicking.current = false;
      const el = scrollContainerRef.current;
      if (!el || planes.length === 0) return;
      const cardWidth = el.clientWidth * 0.84 || 320;
      const newIdx = Math.round(el.scrollLeft / cardWidth);
      const clamped = Math.max(0, Math.min(newIdx, planes.length - 1));
      if (clamped !== activeIndex) {
        setActiveIndex(clamped);
      }
    });
  };

  const scrollToIndex = (idx: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const targetIdx = Math.max(0, Math.min(idx, planes.length - 1));
    const cardWidth = el.clientWidth * 0.84 || 320;
    el.scrollTo({
      left: targetIdx * cardWidth,
      behavior: "smooth",
    });
    setActiveIndex(targetIdx);
    onSelectPlane(planes[targetIdx]);
  };

  return (
    <div className="relative z-10 w-full min-h-[100svh] flex flex-col justify-between pt-20 pb-8 px-4 sm:px-6 select-none overflow-hidden font-['DM_Sans']">
      {/* Ambient Color Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full blur-[70px] pointer-events-none opacity-20" />

      {/* TOP HEADER */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-between">
        <h2 className="font-['DM_Sans'] text-2xl sm:text-3xl font-bold text-white tracking-wider uppercase">
          PORTFOLIO
        </h2>
      </div>

      {/* HORIZONTAL SWIPING CARDS - PURE IMAGES */}
      <div
        ref={scrollContainerRef}
        onScroll={handleCardScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-proximity py-4 no-scrollbar touch-pan-x touch-pan-y w-full max-w-lg mx-auto scroll-smooth items-center"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          overscrollBehaviorY: "auto",
        }}
      >
        {planes.map((plane, idx) => {
          const isActive = idx === activeIndex;

          return (
            <div
              key={plane.id}
              onClick={() => {
                setActiveIndex(idx);
                onSelectPlane(plane);
                if (plane.textureUrl) {
                  setLightboxImage(plane.textureUrl);
                }
              }}
              className={`flex-shrink-0 w-[82vw] max-w-[340px] aspect-[4/5] snap-center rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                isActive
                  ? "border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_24px_rgba(255,59,48,0.25)] scale-[1.01]"
                  : "border-white/10 opacity-70 scale-[0.96] hover:opacity-90"
              } bg-[#0e0e12] shadow-xl relative will-change-transform`}
            >
              {plane.textureUrl ? (
                <img
                  src={plane.textureUrl}
                  alt=""
                  loading={idx === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: plane.color || "#111" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* BOTTOM CONTROLS & NAVIGATION RAIL */}
      <div className="w-full max-w-lg mx-auto flex flex-col gap-3 pt-2">
        {/* Progress Bar Line */}
        <div className="w-full h-[2.5px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#ff3b30] to-[#ff6633] transition-all duration-300"
            style={{
              width: `${((activeIndex + 1) / Math.max(planes.length, 1)) * 100}%`,
            }}
          />
        </div>

        {/* Minimal Navigation Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Previous image"
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white flex items-center justify-center disabled:opacity-25 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex >= planes.length - 1}
            aria-label="Next image"
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white flex items-center justify-center disabled:opacity-25 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PURE IMAGE LIGHTBOX (NO TEXT DATA) */}
      {lightboxImage && (
        <div
          data-lenis-prevent="true"
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 cursor-pointer select-none animate-fadeIn"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxImage(null);
            }}
            aria-label="Close image"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer active:scale-95 z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxImage}
            alt=""
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default MobilePortfolioDeck;
