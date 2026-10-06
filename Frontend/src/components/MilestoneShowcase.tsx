import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ExternalLink,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  Sparkles,
  Layers,
  ArrowUpRight,
} from "lucide-react";

import DigitalMedia1 from "../assets/DigitalMedia/DigitalMedia-1.webp";
import DigitalMedia2 from "../assets/DigitalMedia/DigitalMedia-2.webp";
import DigitalMedia3 from "../assets/DigitalMedia/DigitalMedia-3.webp";
import DigitalMedia4 from "../assets/DigitalMedia/DigitalMedia-4.webp";

export interface MilestoneKPI {
  label: string;
  value: string;
}

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
  metricSub: string;
  accentColor: string;
  kpis: MilestoneKPI[];
  highlights: string[];
}

const MILESTONES: MilestoneItem[] = [
  {
    id: "milestone-1",
    step: "01",
    number: "(01)",
    title: "Performance & Growth Analytics",
    subtitle: "Digital Identity & Market Launch",
    tag: "Campaign Analytics",
    image: DigitalMedia1,
    metric: "+280%",
    metricLabel: "Lead Volume Growth",
    metricSub: "Verified Meta Campaign Insights",
    accentColor: "from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30",
    kpis: [
      { label: "Total Views", value: "5.9M+" },
      { label: "Interactions", value: "1.1M+" },
      { label: "Watch Time", value: "285 Days" },
    ],
    highlights: [
      "Precision audience targeting generating sustained ROI",
      "Omnichannel conversion funnel scaling across platforms",
      "Real-time creative optimization and A/B ad validation",
    ],
  },
  {
    id: "milestone-2",
    step: "02",
    number: "(02)",
    title: "Omnichannel Scale & Reach",
    subtitle: "Performance Ad Optimization",
    tag: "Paid Acquisition",
    image: DigitalMedia2,
    metric: "4.8M+",
    metricLabel: "Verified Impressions",
    metricSub: "Meta & Google Ads Deployment",
    accentColor: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30",
    kpis: [
      { label: "Click Rate", value: "+340%" },
      { label: "ROAS Multiplier", value: "3.8x" },
      { label: "Cost Per Lead", value: "-42%" },
    ],
    highlights: [
      "Targeted retargeting frameworks reducing acquisition costs",
      "Multi-format ad creatives tested across dynamic feeds",
      "Continuous algorithmic budget pacing and bidder tuning",
    ],
  },
  {
    id: "milestone-3",
    step: "03",
    number: "(03)",
    title: "Viral Social Media Engagement",
    subtitle: "Content Engine & Audience Retention",
    tag: "Social Velocity",
    image: DigitalMedia3,
    metric: "12.4x",
    metricLabel: "Organic Reach Multiplier",
    metricSub: "Short-Form High-Retention Content",
    accentColor: "from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30",
    kpis: [
      { label: "Organic Shares", value: "52K+" },
      { label: "Audience Retention", value: "84%" },
      { label: "Profile Visits", value: "1.2M+" },
    ],
    highlights: [
      "Algorithmic hook mechanics crafted for maximum shareability",
      "Community-driven social storytelling driving high retention",
      "Cross-channel publishing cadence maximizing brand recall",
    ],
  },
  {
    id: "milestone-4",
    step: "04",
    number: "(04)",
    title: "Search & SERP Dominance",
    subtitle: "Technical SEO, SMO & Authority",
    tag: "Search Authority",
    image: DigitalMedia4,
    metric: "Top 3",
    metricLabel: "Google Search Rankings",
    metricSub: "High-Intent Commercial Keywords",
    accentColor: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30",
    kpis: [
      { label: "Inbound Traffic", value: "+420%" },
      { label: "Domain Rating", value: "+28 pts" },
      { label: "Indexed Keywords", value: "1,500+" },
    ],
    highlights: [
      "Complete semantic on-page and technical architecture revamp",
      "High-authority editorial backlinks and thought leadership content",
      "Local and national search dominance for high-intent queries",
    ],
  },
];

export const MilestoneShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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

  // Keyboard navigation for modal
  useEffect(() => {
    if (!selectedMilestone) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Progressive background pre-warming of the adjacent milestone image during idle time
  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextIndex = (activeIndex + 1) % MILESTONES.length;
    const nextImgUrl = MILESTONES[nextIndex]?.image;
    if (!nextImgUrl) return;

    const prewarm = () => {
      const img = new Image();
      img.decoding = "async";
      img.src = nextImgUrl;
    };

    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(prewarm, { timeout: 2000 });
      return () => (window as any).cancelIdleCallback?.(id);
    } else {
      const timer = setTimeout(prewarm, 400);
      return () => clearTimeout(timer);
    }
  }, [activeIndex]);

  // GSAP image & text transition on active index change with overwrite protection
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (previewRef.current) {
      gsap.fromTo(
        previewRef.current,
        { opacity: 0.5, y: 8, scale: 0.99 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        }
      );
    }
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0.6, x: -6 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        }
      );
    }

    return () => {
      if (previewRef.current) gsap.killTweensOf(previewRef.current);
      if (contentRef.current) gsap.killTweensOf(contentRef.current);
    };
  }, [activeIndex]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? MILESTONES.length - 1 : prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % MILESTONES.length);
  }, []);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (diff > minSwipeDistance) {
      handleNext();
    } else if (diff < -minSwipeDistance) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleModalTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null || !selectedMilestone) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (diff > minSwipeDistance) {
      const nextIdx = (MILESTONES.findIndex((m) => m.id === selectedMilestone.id) + 1) % MILESTONES.length;
      setSelectedMilestone(MILESTONES[nextIdx]);
    } else if (diff < -minSwipeDistance) {
      const curIdx = MILESTONES.findIndex((m) => m.id === selectedMilestone.id);
      const prevIdx = curIdx === 0 ? MILESTONES.length - 1 : curIdx - 1;
      setSelectedMilestone(MILESTONES[prevIdx]);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      ref={containerRef}
      id="milestone-showcase"
      className="relative w-full px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20 font-['Space_Grotesk',sans-serif] text-white overflow-hidden select-none"
    >
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-blue-600/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-indigo-600/[0.03] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8 md:gap-10">
        {/* =========================================================================
            SECTION HEADER
           ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 pb-4 border-b border-neutral-800/80">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-['Cormorant_Garamond',serif] italic text-sm sm:text-base text-neutral-400 tracking-wide">
                (Case Studies & Proven Impact)
              </span>
            </div>
            <h2 className="font-neuropol text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider text-white leading-tight">
              Digital Milestones &{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Analytics
              </span>
            </h2>
            <p className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed mt-1 font-normal">
              Real business metrics, reach performance, and verified data executed for our clients across digital channels.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-xs font-mono text-neutral-300">
              <span className="text-white font-bold">0{activeIndex + 1}</span>
              <span className="text-neutral-500">/</span>
              <span>0{MILESTONES.length}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Milestone"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 hover:border-neutral-700 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Milestone"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 hover:border-neutral-700 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MILESTONE SELECTOR TABS (RESPONSIVE GRID)
           ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
          {MILESTONES.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative text-left p-3 sm:p-4 rounded-xl transition-all duration-300 cursor-pointer flex flex-col justify-between gap-2.5 sm:gap-3.5 border ${
                  isActive
                    ? "bg-[#141416] border-neutral-600 shadow-[0_4px_24px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
                    : "bg-[#0b0b0d] border-neutral-800/80 hover:bg-[#111114] hover:border-neutral-700 text-neutral-400"
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute top-0 left-3 right-3 sm:left-4 sm:right-4 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 rounded-full" />
                )}

                <div className="flex items-center justify-between w-full gap-2">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isActive ? "text-white" : "text-neutral-500"
                    }`}
                  >
                    {item.step}
                  </span>
                  <span
                    className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold font-['Space_Grotesk',sans-serif] shrink-0 ${
                      isActive
                        ? "bg-white text-black shadow-sm"
                        : "bg-neutral-800/90 text-neutral-300"
                    }`}
                  >
                    {item.metric}
                  </span>
                </div>

                <div className="w-full overflow-hidden">
                  <h4
                    className={`font-neuropol text-xs sm:text-sm uppercase tracking-wider truncate transition-colors ${
                      isActive ? "text-white" : "text-neutral-300"
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p className="font-['Space_Grotesk',sans-serif] text-[10px] sm:text-[11px] text-neutral-500 truncate mt-0.5 font-normal">
                    {item.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            MAIN SHOWCASE SECTION (RESPONSIVE GRID)
           ========================================================================= */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 xl:gap-12 items-start"
        >
          {/* Left Column (5 Cols on desktop): Data, Metrics & Highlights */}
          <div
            ref={contentRef}
            className="lg:col-span-5 flex flex-col justify-between gap-5 sm:gap-6 order-2 lg:order-1"
          >
            {/* Header info */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-neutral-800/80 text-neutral-200 border border-neutral-700/60 font-['Space_Grotesk',sans-serif]">
                  <Layers className="w-3 h-3 text-blue-400" />
                  {activeMilestone.tag}
                </span>
                <span className="text-neutral-600 hidden sm:inline">•</span>
                <span className="text-xs text-neutral-400 font-medium font-['Space_Grotesk',sans-serif]">
                  {activeMilestone.subtitle}
                </span>
              </div>

              <h3 className="font-neuropol text-xl sm:text-2xl md:text-3xl uppercase tracking-wider text-white leading-snug">
                {activeMilestone.title}
              </h3>
            </div>

            {/* Primary Stat Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-neutral-900 to-[#121214] border border-neutral-800 flex items-center justify-between gap-3 sm:gap-4 shadow-inner">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <div>
                  <div className="font-neuropol text-2xl sm:text-3xl text-white tracking-wide leading-none">
                    {activeMilestone.metric}
                  </div>
                  <div className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm uppercase tracking-wider text-neutral-200 font-semibold mt-1">
                    {activeMilestone.metricLabel}
                  </div>
                  <div className="font-['Space_Grotesk',sans-serif] text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
                    {activeMilestone.metricSub}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 sm:px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider font-['Space_Grotesk',sans-serif]">
                  <Sparkles className="w-3 h-3" />
                  <span className="hidden xs:inline">Verified</span>
                </span>
              </div>
            </div>

            {/* Supporting Micro KPIs */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {activeMilestone.kpis.map((kpi, kIdx) => (
                <div
                  key={kIdx}
                  className="p-2.5 sm:p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 text-center"
                >
                  <div className="font-neuropol text-xs sm:text-sm md:text-base text-white tracking-wider truncate">
                    {kpi.value}
                  </div>
                  <div className="font-['Space_Grotesk',sans-serif] text-[9px] sm:text-[10px] text-neutral-400 mt-1 uppercase tracking-wider font-medium truncate">
                    {kpi.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Campaign Highlights */}
            <div className="flex flex-col gap-2 pt-1 border-t border-neutral-800/60">
              <span className="font-['Space_Grotesk',sans-serif] text-[11px] uppercase tracking-wider font-bold text-neutral-400">
                Key Strategic Deliverables
              </span>
              <ul className="flex flex-col gap-2">
                {activeMilestone.highlights.map((item, hIdx) => (
                  <li
                    key={hIdx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300 leading-relaxed font-['Space_Grotesk',sans-serif]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedMilestone(activeMilestone)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-98 font-['Space_Grotesk',sans-serif]"
              >
                <span>Inspect Verified Proof</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition-all cursor-pointer font-['Space_Grotesk',sans-serif]"
              >
                <span>Next Case</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column (7 Cols on desktop): Dashboard Analytics Frame */}
          <div className="lg:col-span-7 flex flex-col order-1 lg:order-2">
            <div
              ref={previewRef}
              className="group relative w-full bg-[#070709] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 hover:border-neutral-600"
            >
              {/* Window Titlebar */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-[#111114] border-b border-neutral-800 text-xs select-none">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 mr-1 sm:mr-2 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400 truncate">
                    verified-insights • {activeMilestone.title}
                  </span>
                </div>

                <div
                  onClick={() => setSelectedMilestone(activeMilestone)}
                  className="flex items-center gap-1.5 text-neutral-400 group-hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
                >
                  <span className="text-[10px] sm:text-[11px] font-mono hidden sm:inline-block">
                    Click to Enlarge
                  </span>
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Image Container - Natural Fit with Clean Responsiveness */}
              <div
                onClick={() => setSelectedMilestone(activeMilestone)}
                className="relative w-full overflow-hidden select-none cursor-pointer bg-neutral-950 flex items-center justify-center"
              >
                <img
                  src={activeMilestone.image}
                  alt={activeMilestone.title}
                  loading={activeIndex === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full h-auto max-h-[480px] lg:max-h-[520px] object-contain block select-none transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                />

                {/* Hover overlay hint for desktop & tap clue */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
                  <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black/90 border border-white/20 text-white text-[10px] sm:text-xs font-semibold flex items-center gap-2 shadow-2xl font-['Space_Grotesk',sans-serif] uppercase tracking-wider">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View High-Resolution Report</span>
                  </div>
                </div>
              </div>

              {/* Window Footer Bar */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0e0e11] border-t border-neutral-800/80 text-[10px] sm:text-[11px] text-neutral-400 select-none">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="font-mono text-neutral-300 truncate">
                    Live Production Metric Snapshot
                  </span>
                </div>
                <span className="font-mono text-neutral-400 font-semibold shrink-0 ml-2">
                  {activeMilestone.metric}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          HIGH-RESOLUTION LIGHTBOX MODAL
         ========================================================================= */}
      {selectedMilestone && (
        <div
          onClick={() => setSelectedMilestone(null)}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleModalTouchEnd}
            className="relative w-full max-w-5xl max-h-[94vh] bg-[#0d0d10] border border-neutral-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col font-['Space_Grotesk',sans-serif]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#121216] border-b border-neutral-800 gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                  {selectedMilestone.step}
                </span>
                <div className="min-w-0">
                  <h3 className="font-neuropol text-xs sm:text-sm md:text-base uppercase tracking-wider text-white truncate">
                    {selectedMilestone.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate">
                    {selectedMilestone.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedMilestone.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Size</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  aria-label="Close"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Body with Nav */}
            <div
              data-lenis-prevent
              className="relative flex-1 bg-[#050507] p-2 sm:p-4 md:p-6 flex items-center justify-center overflow-auto min-h-[240px] max-h-[68vh]"
            >
              {/* Prev Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const curIdx = MILESTONES.findIndex((m) => m.id === selectedMilestone.id);
                  const prevIdx = curIdx === 0 ? MILESTONES.length - 1 : curIdx - 1;
                  setSelectedMilestone(MILESTONES[prevIdx]);
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/80 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all cursor-pointer shadow-xl border border-white/10 backdrop-blur-sm active:scale-95"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
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
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/80 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all cursor-pointer shadow-xl border border-white/10 backdrop-blur-sm active:scale-95"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <img
                src={selectedMilestone.image}
                alt={selectedMilestone.title}
                decoding="async"
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 px-4 sm:px-5 bg-[#121216] border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white truncate">
                  {selectedMilestone.metric} {selectedMilestone.metricLabel}
                </span>
              </div>
              <span className="font-mono text-neutral-400 text-[11px] sm:text-xs truncate">
                {selectedMilestone.metricSub}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MilestoneShowcase;

