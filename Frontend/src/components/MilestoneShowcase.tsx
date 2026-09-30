import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import LensText from "./LensText";

import DigitalMedia1 from "../assets/DigitalMedia/DigitalMedia-1.webp";
import DigitalMedia2 from "../assets/DigitalMedia/DigitalMedia-2.webp";
import DigitalMedia3 from "../assets/DigitalMedia/DigitalMedia-3.webp";
import DigitalMedia4 from "../assets/DigitalMedia/DigitalMedia-4.webp";

export interface MilestoneItem {
  id: string;
  step: string;
  number: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  metric: string;
  metricLabel: string;
}

const MILESTONES: MilestoneItem[] = [
  {
    id: "milestone-1",
    step: "01",
    number: "(01)",
    title: "Apex Brand Architecture",
    subtitle: "Digital Identity & Market Launch",
    tag: "Campaign Reel",
    image: DigitalMedia1,
    metric: "+280%",
    metricLabel: "Lead Volume Growth",
  },
  {
    id: "milestone-2",
    step: "02",
    number: "(02)",
    title: "Omnichannel Scale & Reach",
    subtitle: "Performance Ad Optimization",
    tag: "Performance Ads",
    image: DigitalMedia2,
    metric: "4.8M+",
    metricLabel: "Verified Impressions",
  },
  {
    id: "milestone-3",
    step: "03",
    number: "(03)",
    title: "Viral Social Engagement",
    subtitle: "Content Engine & Retention",
    tag: "Social Velocity",
    image: DigitalMedia3,
    metric: "12.4x",
    metricLabel: "Organic Reach Multiplier",
  },
  {
    id: "milestone-4",
    step: "04",
    number: "(04)",
    title: "Search & SERP Dominance",
    subtitle: "Technical SEO & Authority",
    tag: "SEO Dominance",
    image: DigitalMedia4,
    metric: "Top 3",
    metricLabel: "Google Search Rankings",
  },
];

export const MilestoneShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const activeMilestone = MILESTONES[activeIndex];

  // Pause Lenis & lock body scroll while modal is open
  useEffect(() => {
    if (selectedMilestone) {
      (window as any).lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      (window as any).lenis?.start();
      document.body.style.overflow = "";
    }

    return () => {
      (window as any).lenis?.start();
      document.body.style.overflow = "";
    };
  }, [selectedMilestone]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedMilestone) return;
      if (e.key === "Escape") {
        setSelectedMilestone(null);
      } else if (e.key === "ArrowRight") {
        const nextIdx = (MILESTONES.findIndex((m) => m.id === selectedMilestone.id) + 1) % MILESTONES.length;
        setSelectedMilestone(MILESTONES[nextIdx]);
      } else if (e.key === "ArrowLeft") {
        const curIdx = MILESTONES.findIndex((m) => m.id === selectedMilestone.id);
        const prevIdx = curIdx === 0 ? MILESTONES.length - 1 : curIdx - 1;
        setSelectedMilestone(MILESTONES[prevIdx]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMilestone]);

  // Subtle GSAP image fade transition on active index change
  useEffect(() => {
    if (!previewRef.current) return;
    gsap.fromTo(
      previewRef.current,
      { opacity: 0.6, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }
    );
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className="relative w-full pt-10 sm:pt-14 mt-8 sm:mt-12 text-white"
    >
      <div className="w-full flex flex-col gap-6 sm:gap-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div className="flex flex-col">
            <span className="font-['Cormorant_Garamond',serif] italic text-sm text-neutral-400 mb-1 tracking-wide">
              (Case Studies & Proven Impact)
            </span>
            <h2 className="font-neuropol font-normal text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider text-white leading-tight">
              <LensText text="DIGITAL MILESTONES" strokeWidth="1px" strokeColor="#ffffff" />
            </h2>
            <p className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Verified analytics, reach performance, and real business results executed for our clients.
            </p>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="font-mono text-xs text-neutral-400 tracking-widest">
              0{activeIndex + 1} / 04
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) => (prev === 0 ? MILESTONES.length - 1 : prev - 1))
                }
                aria-label="Previous Milestone"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev + 1) % MILESTONES.length)}
                aria-label="Next Milestone"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Minimal Milestone Selector Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {MILESTONES.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative text-left p-3.5 sm:p-4 rounded-xl transition-all duration-300 cursor-pointer flex flex-col justify-between gap-2 ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-[0_0_25px_rgba(255,255,255,0.06)]"
                    : "bg-[#0c0c0c]/90 text-neutral-400 hover:bg-neutral-900/60 hover:text-neutral-200"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-xs text-neutral-500 font-semibold">
                    {item.step}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white/10 text-neutral-300">
                    {item.metric}
                  </span>
                </div>

                <h4 className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm font-semibold truncate text-neutral-100">
                  {item.title}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Main Showcase Grid (Clean & Minimal) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start bg-[#080808] rounded-2xl p-6 sm:p-8">
          {/* Left Column (5 Cols): Only Essential Data Requested - Top Aligned */}
          <div className="lg:col-span-5 flex flex-col justify-start gap-6 pt-1">
            {/* Top Tag & Subtitle */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-blue-400 font-semibold">
                  {activeMilestone.tag}
                </span>
                <span className="text-neutral-600">•</span>
                <span className="text-xs text-neutral-400 font-['Space_Grotesk',sans-serif]">
                  {activeMilestone.subtitle}
                </span>
              </div>
              <h3 className="font-['Space_Grotesk',sans-serif] text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {activeMilestone.title}
              </h3>
            </div>

            {/* Hero Stat Box */}
            <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/80 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="font-['Space_Grotesk',sans-serif] text-2xl sm:text-3xl text-white font-bold tracking-tight leading-none">
                  {activeMilestone.metric}
                </div>
                <div className="text-xs sm:text-sm text-neutral-400 font-['Space_Grotesk',sans-serif] mt-1.5">
                  {activeMilestone.metricLabel}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setSelectedMilestone(activeMilestone)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-bold bg-white text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <span>View Full Analytics</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column (7 Cols): Sleek Interactive Dashboard Preview */}
          <div className="lg:col-span-7 flex flex-col">
            <div
              ref={previewRef}
              onClick={() => setSelectedMilestone(activeMilestone)}
              className="group relative w-full h-full min-h-[300px] bg-[#050505] rounded-xl transition-all duration-300 cursor-pointer overflow-hidden shadow-2xl flex flex-col justify-between"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d0d] text-neutral-400 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span className="font-mono text-[11px] text-neutral-300">
                    Live Verified Analytics
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 group-hover:text-white transition-colors">
                  <Maximize2 className="w-3.5 h-3.5" />
                  Click to Expand
                </span>
              </div>

              {/* Image Container */}
              <div className="relative w-full flex-1 p-3 sm:p-5 flex items-center justify-center bg-[#050505] overflow-hidden">
                <img
                  src={activeMilestone.image}
                  alt={activeMilestone.title}
                  className="w-full h-auto max-h-[380px] object-contain rounded-lg transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CLEAN HIGH-RES LIGHTBOX MODAL
         ========================================================================= */}
      {selectedMilestone && (
        <div
          onClick={() => setSelectedMilestone(null)}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#0c0c0c] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#0f0f0f]">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-blue-400 font-semibold">
                  {selectedMilestone.step}
                </span>
                <span className="text-neutral-600">•</span>
                <h3 className="font-['Space_Grotesk',sans-serif] text-sm font-bold text-white">
                  {selectedMilestone.title} — Analytics Report
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedMilestone.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-xs font-mono text-neutral-300 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Image</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  aria-label="Close"
                  className="w-8 h-8 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Body with Nav */}
            <div className="relative flex-1 bg-[#050505] p-3 sm:p-6 flex items-center justify-center overflow-auto min-h-[300px] max-h-[72vh]">
              {/* Prev Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const curIdx = MILESTONES.findIndex((m) => m.id === selectedMilestone.id);
                  const prevIdx = curIdx === 0 ? MILESTONES.length - 1 : curIdx - 1;
                  setSelectedMilestone(MILESTONES[prevIdx]);
                }}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/80 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all cursor-pointer shadow-xl backdrop-blur-sm"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextIdx =
                    (MILESTONES.findIndex((m) => m.id === selectedMilestone.id) + 1) %
                    MILESTONES.length;
                  setSelectedMilestone(MILESTONES[nextIdx]);
                }}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/80 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all cursor-pointer shadow-xl backdrop-blur-sm"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <img
                src={selectedMilestone.image}
                alt={selectedMilestone.title}
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-5 bg-[#0f0f0f] flex items-center justify-between text-xs text-neutral-400">
              <span className="font-medium text-white">{selectedMilestone.title}</span>
              <span className="font-mono text-blue-400 font-semibold shrink-0 ml-4">
                {selectedMilestone.metric} • {selectedMilestone.metricLabel}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneShowcase;
