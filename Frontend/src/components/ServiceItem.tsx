import React, { useState, useRef } from "react";
import {
  ArrowUpRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Film,
  Image as ImageIcon,
  X,
  Maximize2,
  MessageSquare,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import LensText from "./LensText";

export interface ServiceWorkItem {
  id: string;
  title: string;
  type: "video" | "image";
  url: string;
  thumbnail?: string;
  tag: string;
  description?: string;
  metrics?: string;
}

export interface ServiceData {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  tag?: string;
  image?: string;
  works?: ServiceWorkItem[];
  details?: {
    deliverables: string[];
    timeline: string;
    description: string;
    chips?: string[];
  };
}

interface ServiceItemProps {
  service: ServiceData;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onHover?: (service: ServiceData) => void;
  onLeave?: () => void;
}

export const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  index: _index,
  isOpen,
  onToggle,
  onHover,
  onLeave,
}) => {
  // Modal / Lightbox for viewing active work sample
  const [activeModalWork, setActiveModalWork] = useState<ServiceWorkItem | null>(null);
  const [modalMuted, setModalMuted] = useState(false);
  const [modalPlaying, setModalPlaying] = useState(true);

  // Smooth scroll handler for CTA buttons
  const scrollToSection = (sectionId: string) => {
    const targetEl = document.querySelector(sectionId);
    if (!targetEl) return;

    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(targetEl as HTMLElement, {
        offset: 0,
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div
        onMouseEnter={() => {
          // Strictly do NOT show image preview if description is currently open
          if (!isOpen) {
            onHover?.(service);
          }
        }}
        onMouseLeave={() => onLeave?.()}
        className="group border-t border-neutral-800 transition-colors duration-300 hover:border-neutral-700"
      >
        <div
          onClick={() => {
            onToggle();
            if (!isOpen) {
              onLeave?.();
            }
          }}
          className="w-full text-left py-6 sm:py-8 md:py-6 px-2 sm:px-4 cursor-pointer transition-all duration-300 group-hover:bg-neutral-900/40 rounded-lg flex flex-col justify-between"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
            {/* Left Column: Number + Title + Subtitle */}
            <div className="flex flex-col">
              {/* Number in editorial font */}
              <span className="font-['Cormorant_Garamond',serif] italic text-sm sm:text-base md:text-lg text-neutral-400 mb-1.5 sm:mb-2 tracking-wide transition-colors duration-300 group-hover:text-neutral-200">
                {service.number}
              </span>

              {/* Main Service Title */}
              <h3 className="font-neuropol font-normal text-xl sm:text-2xl md:text-3xl lg:text-3xl tracking-wider text-white uppercase leading-tight sm:leading-[1.05] transition-transform duration-300 group-hover:translate-x-1 sm:group-hover:translate-x-2">
                <LensText text={service.title} strokeWidth="1px" strokeColor="#ffffff" />
              </h3>

              {/* Subtitle / Scope */}
              <p className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-400 tracking-wider uppercase mt-2 sm:mt-3">
                {service.subtitle}
              </p>
            </div>

            {/* Right Column: Optional Feature Tag & Animated Arrow indicator */}
            <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-6 mt-2 lg:mt-0 pt-2 lg:pt-0 border-t border-neutral-800/60 lg:border-t-0">
              {service.tag && (
                <span className="font-['Space_Grotesk',sans-serif] text-[11px] sm:text-xs md:text-sm text-neutral-400 tracking-wider uppercase transition-colors duration-300 group-hover:text-neutral-200">
                  {service.tag}
                </span>
              )}

              {/* Animated Action Circle with Rotating Arrow */}
              <div
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  onLeave?.();
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  if (!isOpen) {
                    onHover?.(service);
                  }
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                    if (!isOpen) {
                      onLeave?.();
                    }
                  }}
                  aria-label={`${isOpen ? "Close" : "Open"} ${service.title} details`}
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center transition-all duration-500 ease-out cursor-pointer ${
                    isOpen
                      ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                      : "border-neutral-800 text-neutral-400 group-hover:border-neutral-500 group-hover:text-white group-hover:bg-neutral-800"
                  }`}
                >
                  <ArrowUpRight
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-500 ease-out ${
                      isOpen
                        ? "rotate-90 translate-y-0.5 text-black"
                        : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Details Drawer */}
          {service.details && (
            <div
              className={`grid transition-all duration-500 ease-in-out overflow-hidden ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100 mt-6 pt-6 border-t border-neutral-800/80"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-8 text-sm text-neutral-300 bg-neutral-950/80 p-5 sm:p-8 rounded-2xl border border-neutral-800/90 shadow-2xl backdrop-blur-xl">
                  {/* Top Row: Overview & Service Delivery Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Column 1: Scope & Detailed Description */}
                    <div className="lg:col-span-2 flex flex-col gap-3">
                      <h4 className="text-xs font-['Space_Grotesk',sans-serif] uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                        Scope & Solution Overview
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-300 leading-loose sm:leading-relaxed uppercase font-['Space_Grotesk',sans-serif] tracking-wide sm:tracking-normal">
                        {service.details.description}
                      </p>

                      {/* Key Deliverables Checkpoints */}
                      {service.details.deliverables && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3">
                          {service.details.deliverables.map((item, dIdx) => (
                            <div
                              key={dIdx}
                              className="flex items-center gap-2 text-xs font-['Space_Grotesk',sans-serif] text-neutral-300/90"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Column 2: Service Delivery & Direct CTAs Card */}
                    <div className="flex flex-col justify-between gap-5 p-5 sm:p-6 rounded-xl bg-neutral-900/80 border border-neutral-800 shadow-lg relative overflow-hidden group/card">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-['Space_Grotesk',sans-serif] uppercase tracking-wider text-neutral-400 font-semibold">
                            Service Delivery
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Active Slot
                          </span>
                        </div>
                        <p className="text-neutral-100 font-medium font-['Space_Grotesk',sans-serif] text-sm sm:text-base">
                          {service.details.timeline}
                        </p>
                      </div>

                      {/* Action CTA Buttons */}
                      <div className="flex flex-col gap-2.5 pt-2">
                        {/* 1. View My Work CTA Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollToSection("#portfolio-section");
                          }}
                          className="group/btn relative inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-bold bg-neutral-800 text-white border border-neutral-700/80 hover:bg-neutral-700 hover:border-neutral-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 cursor-pointer overflow-hidden"
                        >
                          <Briefcase className="w-4 h-4 text-blue-400 transition-transform group-hover/btn:scale-110" />
                          <span>View My Work</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover/btn:text-white transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                        </button>

                        {/* 2. Get In Touch CTA Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollToSection("#contact-section");
                          }}
                          className="group/btn relative inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-bold bg-white text-black hover:bg-neutral-200 hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] transition-all duration-300 cursor-pointer overflow-hidden"
                        >
                          <MessageSquare className="w-4 h-4 text-black transition-transform group-hover/btn:scale-110" />
                          <span>Get In Touch</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-black transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* =========================================================================
                      ANIMATED WORK SHOWCASE (2 to 3 Images / Videos per Service)
                     ========================================================================= */}
                  {service.works && service.works.length > 0 && (
                    <div className="flex flex-col gap-4 pt-6 border-t border-neutral-800/80">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                          <h4 className="text-xs font-['Space_Grotesk',sans-serif] uppercase tracking-wider text-neutral-300 font-semibold flex items-center gap-2">
                            Featured Work & Live Showcase
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 hidden sm:inline-block">
                          {service.works.length} Animated Showcases • Click to Expand
                        </span>
                      </div>

                      {/* 2-3 Animated Interactive Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {service.works.map((work, wIdx) => (
                          <WorkCard
                            key={work.id || wIdx}
                            work={work}
                            index={wIdx}
                            onOpenModal={() => setActiveModalWork(work)}
                          />
                        ))}
                      </div>

                      {/* Bottom Quick Jump CTAs */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <p className="text-[11px] font-['Space_Grotesk',sans-serif] text-neutral-400">
                          Looking for custom deliverables tailored to your brand?
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              scrollToSection("#portfolio-section");
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <span>Explore Full Portfolio</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-neutral-700">•</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              scrollToSection("#contact-section");
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors cursor-pointer font-semibold"
                          >
                            <span>Start Direct Project</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Badges / Chips / Capabilities List */}
                  {service.details.chips && service.details.chips.length > 0 && (
                    <div className="pt-4 border-t border-neutral-800/80 flex flex-col gap-3">
                      <h4 className="text-[11px] font-['Space_Grotesk',sans-serif] uppercase tracking-widest text-neutral-400 font-medium">
                        Specializations & Integrated Platforms
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {service.details.chips.map((chip, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-md text-[11px] font-['Space_Grotesk',sans-serif] uppercase tracking-wider bg-neutral-900 border border-neutral-800 text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          THEATRE LIGHTBOX MODAL FOR WORK PREVIEW
         ========================================================================= */}
      {activeModalWork && (
        <div
          onClick={() => setActiveModalWork(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/90 backdrop-blur-2xl animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {activeModalWork.tag}
                </span>
                <h3 className="text-sm sm:text-base font-['Space_Grotesk',sans-serif] uppercase tracking-wider font-bold text-white">
                  {activeModalWork.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalWork(null)}
                aria-label="Close Preview"
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Media Display */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
              {activeModalWork.type === "video" ? (
                <>
                  <video
                    src={activeModalWork.url}
                    poster={activeModalWork.thumbnail}
                    autoPlay
                    loop
                    muted={modalMuted}
                    playsInline
                    className="w-full h-full object-cover"
                    ref={(el) => {
                      if (el) {
                        if (modalPlaying) el.play().catch(() => {});
                        else el.pause();
                      }
                    }}
                  />
                  {/* Floating Video Controls */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setModalPlaying((p) => !p)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        {modalPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalMuted((m) => !m)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        {modalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>
                    {activeModalWork.metrics && (
                      <span className="text-xs font-mono text-neutral-300">
                        {activeModalWork.metrics}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <img
                  src={activeModalWork.url}
                  alt={activeModalWork.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Modal Footer / CTAs */}
            <div className="p-6 bg-neutral-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-neutral-800">
              <div>
                <p className="text-xs sm:text-sm text-neutral-300 font-['Space_Grotesk',sans-serif]">
                  {activeModalWork.description ||
                    `High-impact visual execution delivered under ${service.title}.`}
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalWork(null);
                    scrollToSection("#portfolio-section");
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  View Portfolio
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalWork(null);
                    scrollToSection("#contact-section");
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-black" />
                  Get In Touch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// =========================================================================
// SUB-COMPONENT: WorkCard (Animated interactive showcase card)
// =========================================================================
interface WorkCardProps {
  work: ServiceWorkItem;
  index: number;
  onOpenModal: () => void;
}

const WorkCard: React.FC<WorkCardProps> = ({ work, index, onOpenModal }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (work.type === "video" && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (work.type === "video" && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        onOpenModal();
      }}
      className="group/work relative rounded-xl overflow-hidden border border-neutral-800/90 bg-neutral-900/90 shadow-lg hover:border-neutral-500/80 hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] transition-all duration-500 ease-out cursor-pointer flex flex-col transform hover:-translate-y-1"
      style={{
        animationDelay: `${index * 120}ms`,
      }}
    >
      {/* Animated Sheen / Glow Sweep */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-white/5 to-purple-500/0 opacity-0 group-hover/work:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />

      {/* Media Container */}
      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-black">
        {work.type === "video" ? (
          <>
            <video
              ref={videoRef}
              src={work.url}
              poster={work.thumbnail}
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover transition-transform duration-700 group-hover/work:scale-105"
            />
            {/* Live Animated Play Overlay */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? "opacity-0" : "opacity-90 bg-black/40"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg group-hover/work:scale-110 transition-transform">
                <Play className="w-4 h-4 text-white fill-white translate-x-0.5" />
              </div>
            </div>
          </>
        ) : (
          <img
            src={work.url}
            alt={work.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/work:scale-110"
            loading="lazy"
          />
        )}

        {/* Ambient Dark Gradient on bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-black/70 backdrop-blur-md border border-white/20 text-neutral-200">
            {work.type === "video" ? (
              <>
                <Film className="w-2.5 h-2.5 text-blue-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Motion
              </>
            ) : (
              <>
                <ImageIcon className="w-2.5 h-2.5 text-purple-400" />
                Visual
              </>
            )}
          </span>

          <span className="p-1 rounded-full bg-black/60 backdrop-blur-md text-white/80 opacity-0 group-hover/work:opacity-100 transition-opacity">
            <Maximize2 className="w-3 h-3" />
          </span>
        </div>

        {/* Bottom Tag */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
          <span className="text-[10px] font-mono uppercase tracking-wider text-blue-300/90 bg-blue-950/60 backdrop-blur-sm px-2 py-0.5 rounded border border-blue-800/40">
            {work.tag}
          </span>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-3.5 flex flex-col justify-between flex-grow bg-neutral-950/90">
        <div>
          <h5 className="text-xs sm:text-sm font-['Space_Grotesk',sans-serif] uppercase tracking-wider font-semibold text-white group-hover/work:text-blue-300 transition-colors line-clamp-1">
            {work.title}
          </h5>
          {work.description && (
            <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
              {work.description}
            </p>
          )}
        </div>

        {/* Action Link */}
        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-neutral-800/60 text-[10px] font-mono text-neutral-400 group-hover/work:text-white">
          <span>{work.metrics || "Interactive View"}</span>
          <span className="flex items-center gap-1 text-blue-400">
            Preview <ArrowUpRight className="w-3 h-3 transition-transform group-hover/work:translate-x-0.5 group-hover/work:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServiceItem;
