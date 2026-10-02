import React, { useState, useEffect, useRef } from "react";
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
  MoveVertical,
  ArrowUp,
  ArrowDown,
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
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isScrollable, setIsScrollable] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // GSAP image & text transition on active index change
  useEffect(() => {
    if (previewRef.current) {
      gsap.fromTo(
        previewRef.current,
        { opacity: 0.5, y: 10, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" }
      );
    }
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0.6, x: -8 },
        { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" }
      );
    }

    // Reset scroll position on active milestone change
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      setScrollProgress(0);
    }
  }, [activeIndex]);

  // Check scrollability on image load / resize
  const checkScrollable = () => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      setIsScrollable(scrollHeight > clientHeight + 15);
    }
  };

  const handleContainerScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      setScrollProgress(scrollTop / maxScroll);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrollProgress(val);
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      const maxScroll = scrollHeight - clientHeight;
      scrollContainerRef.current.scrollTop = val * maxScroll;
    }
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full pt-12 sm:pt-16 mt-10 sm:mt-14 font-['Plus_Jakarta_Sans',sans-serif] text-white"
    >
      <div className="w-full flex flex-col gap-6 sm:gap-8">
        {/* =========================================================================
            SECTION HEADER
           ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-neutral-800/60">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Case Studies & Proven Impact
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Digital Milestones & Analytics
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
              Real business metrics, reach performance, and verified data executed for our clients across digital channels.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-xs font-mono text-neutral-300">
              <span className="text-white font-bold">0{activeIndex + 1}</span>
              <span className="text-neutral-500">/</span>
              <span>0{MILESTONES.length}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) => (prev === 0 ? MILESTONES.length - 1 : prev - 1))
                }
                aria-label="Previous Milestone"
                className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 hover:border-neutral-700 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev + 1) % MILESTONES.length)}
                aria-label="Next Milestone"
                className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 hover:border-neutral-700 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MILESTONE SELECTOR TABS (CLEAN & MODERN)
           ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {MILESTONES.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative text-left p-4 rounded-xl transition-all duration-300 cursor-pointer flex flex-col justify-between gap-3 border ${
                  isActive
                    ? "bg-[#141416] border-neutral-600 shadow-[0_4px_20px_rgba(0,0,0,0.4)] ring-1 ring-white/10"
                    : "bg-[#0b0b0d] border-neutral-800/80 hover:bg-[#111114] hover:border-neutral-700 text-neutral-400"
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 rounded-full" />
                )}

                <div className="flex items-center justify-between w-full">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isActive ? "text-white" : "text-neutral-500"
                    }`}
                  >
                    {item.step}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-white text-black shadow-sm"
                        : "bg-neutral-800/90 text-neutral-300"
                    }`}
                  >
                    {item.metric}
                  </span>
                </div>

                <div>
                  <h4
                    className={`text-xs sm:text-sm font-semibold line-clamp-1 transition-colors ${
                      isActive ? "text-white" : "text-neutral-300"
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5 font-normal">
                    {item.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            MAIN SHOWCASE BENTO CARD
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start bg-[#0c0c0e] border border-neutral-800/80 rounded-2xl p-5 sm:p-7 md:p-8 shadow-2xl">
          {/* Left Column (5 Cols): Data, Metrics & Highlights */}
          <div
            ref={contentRef}
            className="lg:col-span-5 flex flex-col justify-between gap-6"
          >
            {/* Header info */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-neutral-800/80 text-neutral-200 border border-neutral-700/60">
                  <Layers className="w-3 h-3 text-blue-400" />
                  {activeMilestone.tag}
                </span>
                <span className="text-neutral-600">•</span>
                <span className="text-xs text-neutral-400 font-medium">
                  {activeMilestone.subtitle}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
                {activeMilestone.title}
              </h3>
            </div>

            {/* Primary Stat Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-neutral-900 to-[#121214] border border-neutral-800 flex items-center justify-between gap-4 shadow-inner">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl text-white font-extrabold tracking-tight leading-none">
                    {activeMilestone.metric}
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-300 font-semibold mt-1">
                    {activeMilestone.metricLabel}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {activeMilestone.metricSub}
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end shrink-0">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>

            {/* Supporting Micro KPIs */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {activeMilestone.kpis.map((kpi, kIdx) => (
                <div
                  key={kIdx}
                  className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 text-center"
                >
                  <div className="text-xs sm:text-sm font-bold text-white">
                    {kpi.value}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider font-medium truncate">
                    {kpi.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Campaign Highlights */}
            <div className="flex flex-col gap-2 pt-1 border-t border-neutral-800/60">
              <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
                Key Strategic Deliverables
              </span>
              <ul className="flex flex-col gap-2">
                {activeMilestone.highlights.map((item, hIdx) => (
                  <li
                    key={hIdx}
                    className="flex items-start gap-2.5 text-xs text-neutral-300 leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedMilestone(activeMilestone)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-98"
              >
                <span>Inspect Verified Proof</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) => (prev + 1) % MILESTONES.length)
                }
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition-all cursor-pointer"
              >
                <span>Next Case</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column (7 Cols): Dashboard Analytics Frame with Scroll & Slider */}
          <div className="lg:col-span-7 flex flex-col">
            <div
              ref={previewRef}
              className="group relative w-full bg-[#070709] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 hover:border-neutral-600"
            >
              {/* Window Titlebar */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#111114] border-b border-neutral-800 text-xs select-none">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 truncate">
                    verified-insights • {activeMilestone.title}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Quick Scroll Up/Down if scrollable */}
                  {isScrollable && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={scrollToTop}
                        title="Scroll to top"
                        className="w-6 h-6 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={scrollToBottom}
                        title="Scroll to bottom"
                        className="w-6 h-6 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedMilestone(activeMilestone)}
                    className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="text-[11px] font-mono hidden sm:inline-block">
                      Click to Enlarge
                    </span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Image Container with Lenis protection */}
              <div
                ref={scrollContainerRef}
                data-lenis-prevent
                onScroll={handleContainerScroll}
                className="relative w-full h-[440px] sm:h-[480px] overflow-y-auto bg-[#050507] select-none"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#333338 #0c0c0e",
                }}
              >
                <img
                  src={activeMilestone.image}
                  alt={activeMilestone.title}
                  onLoad={checkScrollable}
                  className="w-full h-auto block select-none cursor-grab active:cursor-grabbing transition-transform duration-500 ease-out"
                />

                {/* Floating scroll hint pill when image is long */}
                {isScrollable && scrollProgress < 0.15 && (
                  <div className="sticky bottom-3 inset-x-0 mx-auto w-fit z-10 pointer-events-none animate-bounce">
                    <div className="px-3.5 py-1.5 rounded-full bg-black/85 border border-white/20 text-white text-[11px] font-medium flex items-center gap-1.5 shadow-xl backdrop-blur-sm">
                      <MoveVertical className="w-3 h-3 text-blue-400" />
                      <span>Scroll or drag slider to explore full report</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Window Footer Bar with Interactive Slider Control */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0e0e11] border-t border-neutral-800/80 text-[11px] text-neutral-400 select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-neutral-300 hidden sm:inline">
                    Live Production Metric Snapshot
                  </span>
                  <span className="font-mono text-neutral-300 sm:hidden">
                    Snapshot
                  </span>
                </div>

             
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
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[92vh] bg-[#0d0d10] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-['Plus_Jakarta_Sans',sans-serif]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#121216] border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {selectedMilestone.step}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {selectedMilestone.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {selectedMilestone.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedMilestone.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Size</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  aria-label="Close"
                  className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Body with Nav */}
            <div
              data-lenis-prevent
              className="relative flex-1 bg-[#050507] p-3 sm:p-6 flex items-center justify-center overflow-auto min-h-[320px] max-h-[70vh]"
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
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all cursor-pointer shadow-xl border border-white/10 backdrop-blur-sm active:scale-95"
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
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all cursor-pointer shadow-xl border border-white/10 backdrop-blur-sm active:scale-95"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <img
                src={selectedMilestone.image}
                alt={selectedMilestone.title}
                className="max-h-[64vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-5 bg-[#121216] border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">
                  {selectedMilestone.metric} {selectedMilestone.metricLabel}
                </span>
              </div>
              <span className="font-mono text-neutral-400 shrink-0">
                {selectedMilestone.metricSub}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneShowcase;
