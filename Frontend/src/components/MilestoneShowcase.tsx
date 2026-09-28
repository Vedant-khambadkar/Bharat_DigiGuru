import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ScrollText,
  ExternalLink,
} from "lucide-react";
import LensText from "./LensText";

import DigitalMedia1 from "../assets/DigitalMedia/DigitalMedia-1.jpg";
import DigitalMedia2 from "../assets/DigitalMedia/DigitalMedia-2.jpg";
import DigitalMedia3 from "../assets/DigitalMedia/DigitalMedia-3.jpg";
import DigitalMedia4 from "../assets/DigitalMedia/DigitalMedia-4.jpg";

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
  description: string;
  highlights: string[];
}

const MILESTONES: MilestoneItem[] = [
  {
    id: "milestone-1",
    step: "01",
    number: "(01)",
    title: "Apex Brand Architecture",
    subtitle: "Digital Identity & Market Inception",
    tag: "Campaign Reel",
    image: DigitalMedia1,
    metric: "+280%",
    metricLabel: "Lead Volume & ROI Acceleration",
    description:
      "Crafting high-converting visual branding, foundational meta ads strategy, and multi-channel lead funnels designed to capture immediate market share.",
    highlights: [
      "Custom Visual Identity & Creative Copies",
      "High-Converting Meta & Performance Ads",
      "Automated Multi-Channel Lead Ingestion",
    ],
  },
  {
    id: "milestone-2",
    step: "02",
    number: "(02)",
    title: "Omnichannel Scale & Growth",
    subtitle: "Meta & Performance Ad Optimization",
    tag: "Performance Ads",
    image: DigitalMedia2,
    metric: "4.8M+",
    metricLabel: "Verified Impressions Delivered",
    description:
      "Precision-targeted ad campaigns with algorithmic retargeting, continuous A/B creative testing, and reduced cost-per-acquisition across social ecosystems.",
    highlights: [
      "Cross-Platform Performance Campaigns",
      "Hyper-Targeted Audience Segmentation",
      "Dynamic Retargeting & Inbound Scale",
    ],
  },
  {
    id: "milestone-3",
    step: "03",
    number: "(03)",
    title: "Viral Engagement & Community",
    subtitle: "Content Engine & Audience Retention",
    tag: "Social Velocity",
    image: DigitalMedia3,
    metric: "12.4x",
    metricLabel: "Organic Engagement Multiplier",
    description:
      "High-cadence short-form content, viral video production, and structured community management that builds persistent authority and brand loyalty.",
    highlights: [
      "High-Retention Storytelling & Reels",
      "Active Brand Community Building",
      "Omnichannel Organic Reach Expansion",
    ],
  },
  {
    id: "milestone-4",
    step: "04",
    number: "(04)",
    title: "Organic Search & SERP Dominance",
    subtitle: "Data-Driven SEO & Brand Prestige",
    tag: "SEO Dominance",
    image: DigitalMedia4,
    metric: "Top 3",
    metricLabel: "Google SERP Ranking Placements",
    description:
      "Authoritative search rankings, comprehensive technical SEO, and online reputation management ensuring permanent inbound visibility.",
    highlights: [
      "Top Tier Organic Keyword Dominance",
      "Online Reputation & Trust Management",
      "Sustainable Long-Term Inbound Traffic",
    ],
  },
];

export const MilestoneShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  const activeMilestone = MILESTONES[activeIndex];

  // Pause Lenis & lock body scroll while modal is open
  useEffect(() => {
    if (selectedMilestone) {
      (window as any).lenis?.stop();
      document.body.style.overflow = "hidden";
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTop = 0;
      }
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
      { opacity: 0.7, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" }
    );
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className="relative w-full pt-10 sm:pt-14 mt-8 sm:mt-12 border-t border-neutral-800/90 text-white"
    >
      <div className="w-full flex flex-col gap-6 sm:gap-8">
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-5">
          <div className="flex flex-col">
            <span className="font-['Cormorant_Garamond',serif] italic text-sm text-neutral-400 mb-1 tracking-wide">
              (Case Studies & Proven Impact)
            </span>
            <h2 className="font-neuropol font-normal text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider text-white leading-tight">
              <LensText text="DIGITAL MILESTONES" strokeWidth="1px" strokeColor="#ffffff" />
            </h2>
            <p className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-400 uppercase tracking-wider mt-1.5 max-w-xl">
              Verified analytics, ad reach performance, and real growth executed for our clients.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
              0{activeIndex + 1} / 04
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) => (prev === 0 ? MILESTONES.length - 1 : prev - 1))
                }
                aria-label="Previous Milestone"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300 hover:text-white hover:border-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev + 1) % MILESTONES.length)}
                aria-label="Next Milestone"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300 hover:text-white hover:border-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Clean Minimal Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {MILESTONES.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative text-left p-3 sm:p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[72px] sm:min-h-[78px] ${
                  isActive
                    ? "bg-neutral-900 border-neutral-600 text-white shadow-sm"
                    : "bg-[#090909] border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="font-['Cormorant_Garamond',serif] italic text-xs sm:text-sm text-neutral-400">
                    {item.number}
                  </span>
                  <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                    {item.metric}
                  </span>
                </div>

                <h4 className="font-['Space_Grotesk',sans-serif] text-xs sm:text-xs uppercase tracking-wider font-semibold truncate">
                  {item.title}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Main Showcase Grid (Editorial Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column (5 Cols): Editorial Details */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5 sm:gap-6">
            <div className="flex flex-col gap-3.5 sm:gap-4">
              <div className="flex items-center gap-2.5">
                <span className="font-['Cormorant_Garamond',serif] italic text-base sm:text-lg text-neutral-300">
                  {activeMilestone.number}
                </span>
                <span className="text-neutral-700">—</span>
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                  {activeMilestone.tag}
                </span>
              </div>

              <div>
                <h3 className="font-['Space_Grotesk',sans-serif] text-lg sm:text-xl md:text-2xl uppercase font-bold text-white tracking-wide">
                  {activeMilestone.title}
                </h3>
                <p className="font-['Space_Grotesk',sans-serif] text-xs sm:text-xs text-neutral-400 uppercase tracking-wider mt-0.5">
                  {activeMilestone.subtitle}
                </p>
              </div>

              {/* Large Metric Stat */}
              <div className="py-2.5 sm:py-3 border-y border-neutral-800/80 flex items-baseline gap-3.5">
                <span className="font-neuropol text-2xl sm:text-3xl md:text-4xl text-white">
                  {activeMilestone.metric}
                </span>
                <span className="font-['Space_Grotesk',sans-serif] text-xs text-neutral-400 uppercase tracking-wider">
                  {activeMilestone.metricLabel}
                </span>
              </div>

              <p className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-300 leading-relaxed uppercase">
                {activeMilestone.description}
              </p>

              {/* Deliverable Checkpoints */}
              <div className="flex flex-col gap-2 pt-1">
                {activeMilestone.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 text-xs font-['Space_Grotesk',sans-serif] text-neutral-400 uppercase tracking-wide"
                  >
                    <span className="w-1 h-1 rounded-full bg-neutral-400 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 border-t border-neutral-800/80">
              <button
                type="button"
                onClick={() => setSelectedMilestone(activeMilestone)}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-bold bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <span>View Full Report</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <a
                href="#contact-section"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-bold bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer"
              >
                <span>Get In Touch</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column (7 Cols): Clean Monochrome Image Frame */}
          <div className="lg:col-span-7 flex flex-col gap-2.5">
            <div
              ref={previewRef}
              onClick={() => setSelectedMilestone(activeMilestone)}
              className="group relative w-full bg-[#080808] rounded-xl border border-neutral-800/80 hover:border-neutral-600 transition-colors cursor-pointer overflow-hidden"
            >
              {/* Top Frame Header Bar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-neutral-800/80 bg-[#0c0c0c] text-neutral-400">
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider truncate">
                  {activeMilestone.number} {activeMilestone.title} • Analytics Capture
                </span>

                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-neutral-400 group-hover:text-white transition-colors shrink-0">
                  <Maximize2 className="w-3 h-3" />
                  Expand View
                </span>
              </div>

              {/* Image Canvas Container */}
              <div className="relative w-full min-h-[260px] sm:min-h-[360px] max-h-[460px] p-3 sm:p-4 flex items-center justify-center bg-[#050505]">
                <img
                  src={activeMilestone.image}
                  alt={activeMilestone.title}
                  className="w-full h-auto max-h-[420px] object-contain rounded-md shadow-md opacity-95 group-hover:opacity-100 transition-opacity"
                />
              </div>

              {/* Bottom Subtle Bar */}
              <div className="px-3.5 py-2 border-t border-neutral-800/80 bg-[#0c0c0c] flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-neutral-400">
                <span>Verified Client Analytics</span>
                <span className="text-white font-semibold">{activeMilestone.metric}</span>
              </div>
            </div>

            {/* Hint */}
            <div className="flex items-center justify-between px-1 text-[10px] sm:text-[11px] font-['Space_Grotesk',sans-serif] text-neutral-500 uppercase tracking-wider">
              <span>Click image to open full vertical scroll report</span>
              <span>0{activeIndex + 1} of 04</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          EDITORIAL FULL-SCREEN MODAL (PURE MONOCHROME DARK)
         ========================================================================= */}
      {selectedMilestone && (
        <div
          onClick={() => setSelectedMilestone(null)}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          data-lenis-prevent="true"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-8 bg-black/95 backdrop-blur-xl animate-fade-in overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
            className="relative w-full max-w-[96vw] sm:max-w-6xl h-[94vh] bg-[#080808] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col overscroll-contain"
          >
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between px-5 sm:px-8 py-4 border-b border-neutral-900 bg-[#0c0c0c] z-40 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-['Cormorant_Garamond',serif] italic text-base text-neutral-400">
                  {selectedMilestone.number}
                </span>
                <span className="text-neutral-700">•</span>
                <h3 className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm uppercase tracking-wider font-bold text-white truncate">
                  {selectedMilestone.title}
                </h3>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={selectedMilestone.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 bg-[#050505] text-xs font-mono text-neutral-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Size</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  aria-label="Close"
                  className="w-8 h-8 rounded-lg border border-neutral-800 bg-[#050505] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Report Body */}
            <div
              ref={modalScrollRef}
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="relative flex-1 bg-[#050505] overflow-y-auto overflow-x-hidden select-none p-4 sm:p-8 flex flex-col items-center overscroll-contain"
            >
              {/* Prev / Next Buttons */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const curIdx = MILESTONES.findIndex((m) => m.id === selectedMilestone.id);
                  const prevIdx = curIdx === 0 ? MILESTONES.length - 1 : curIdx - 1;
                  setSelectedMilestone(MILESTONES[prevIdx]);
                }}
                className="fixed left-4 sm:left-10 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-[#111111] hover:bg-white hover:text-black text-white border border-neutral-800 flex items-center justify-center transition-all cursor-pointer shadow-xl"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextIdx =
                    (MILESTONES.findIndex((m) => m.id === selectedMilestone.id) + 1) %
                    MILESTONES.length;
                  setSelectedMilestone(MILESTONES[nextIdx]);
                }}
                className="fixed right-4 sm:right-10 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-[#111111] hover:bg-white hover:text-black text-white border border-neutral-800 flex items-center justify-center transition-all cursor-pointer shadow-xl"
                aria-label="Next Image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Scroll Instruction */}
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d0d0d] border border-neutral-800 text-[11px] font-mono text-neutral-400">
                <ScrollText className="w-3.5 h-3.5 text-neutral-400" />
                <span>Scroll down to view entire dashboard report</span>
              </div>

              {/* The Full High-Res Scrollable Image */}
              <div className="w-full max-w-4xl sm:max-w-5xl flex justify-center pb-8">
                <img
                  src={selectedMilestone.image}
                  alt={selectedMilestone.title}
                  className="w-full h-auto object-contain rounded-xl border border-neutral-900 shadow-2xl bg-[#080808]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 p-4 sm:p-6 bg-[#0c0c0c] border-t border-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-40">
              <div>
                <p className="text-xs sm:text-sm text-neutral-300 font-['Space_Grotesk',sans-serif] uppercase tracking-wide">
                  {selectedMilestone.description}
                </p>
                <span className="text-xs font-mono text-neutral-400 mt-1 inline-block">
                  Verified Result: {selectedMilestone.metric} — {selectedMilestone.metricLabel}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  className="px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer border border-neutral-800"
                >
                  Close
                </button>
                <a
                  href="#contact-section"
                  onClick={() => setSelectedMilestone(null)}
                  className="px-5 py-2 rounded-lg text-xs uppercase tracking-wider font-bold bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Start Project
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneShowcase;
