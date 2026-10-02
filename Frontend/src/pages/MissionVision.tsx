import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CardItem {
  id: "vision" | "mission" | "values";
  number: string;
  title: string;
  subtitle: string;
  tag: string;
  description: string;
  highlights: string[];
  metrics: string;
  iconType: "sphere" | "globe" | "cylinder";
}

const CARDS: CardItem[] = [
  {
    id: "vision",
    number: "01",
    title: "OUR VISION",
    subtitle: "AI-DRIVEN TRANSFORMATION",
    tag: "FUTURE HORIZON",
    description:
      "To redefine the frontiers of digital commerce and brand storytelling by fusing next-generation AI intelligence, immersive cinematic design, and hyper-scalable cloud infrastructure.",
    highlights: ["Cognitive AI Marketing", "Omnichannel Leadership", "Predictive Analytics"],
    metrics: "2026-2030 Horizon // 100% Native AI",
    iconType: "sphere",
  },
  {
    id: "mission",
    number: "02",
    title: "OUR MISSION",
    subtitle: "HIGH-VELOCITY EXECUTION",
    tag: "SOP FLYWHEEL",
    description:
      "Empower visionary founders and enterprise leaders through disciplined agile sprints, data-backed conversion engineering, and relentlessly creative craftsmanship that compounds enterprise value.",
    highlights: ["7-14 Day Sprint Delivery", "Performance Funnels", "Continuous Optimization"],
    metrics: "99.4% Execution Accuracy // Rapid Deploy",
    iconType: "globe",
  },
  {
    id: "values",
    number: "03",
    title: "CORE VALUES",
    subtitle: "TRANSPARENCY & ROI",
    tag: "FOUNDATIONAL ETHOS",
    description:
      "We anchor every client partnership on unyielding transparency, creative mastery, agile sprint velocity, and measurable financial return on investment. If it doesn't move the business needle, we don't build it.",
    highlights: ["Radical Transparency", "Engineering Craft", "Measurable ROI"],
    metrics: "4.8X Avg ROAS // 96.8% Client Retention",
    iconType: "cylinder",
  },
];

export const MissionVision: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCard, setActiveCard] = useState<"vision" | "mission" | "values">("vision");

  // GSAP scroll entrance animation
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".mv-header-elem",
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
          },
        }
      );

      gsap.fromTo(
        ".mv-grid-card",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 70%",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="mission-vision"
      ref={sectionRef}
      className="relative w-full min-h-[90vh] text-white py-20 sm:py-28 px-6 sm:px-10 lg:px-16 overflow-hidden select-none "
    >
      {/* Background Falling Meteor Streaks (Pure White/Monochrome) */}
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-40 overflow-hidden z-0">
        <div className="absolute top-6 right-16 w-24 h-[1px] bg-gradient-to-l from-white to-transparent rotate-[-35deg] opacity-70 animate-pulse" />
        <div className="absolute top-16 right-36 w-32 h-[1px] bg-gradient-to-l from-white to-transparent rotate-[-35deg] opacity-40" />
        <div className="absolute top-28 right-8 w-20 h-[1.5px] bg-gradient-to-l from-white to-transparent rotate-[-35deg] opacity-80 animate-pulse" />
        <div className="absolute top-44 right-28 w-40 h-[1px] bg-gradient-to-l from-white to-transparent rotate-[-35deg] opacity-50" />
      </div>

      {/* Subtle Monochrome Ambient Radial Glow */}
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[400px] bg-white/[0.02] blur-[160px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-8xl mx-auto flex flex-col justify-between h-full">
        
        {/* =========================================================================
            1. SECTION HEADER (Clean Monochrome Typography)
           ========================================================================= */}
        <div className="mb-14 sm:mb-18 text-left mv-header-elem">
          <h2 className="font-neuropol text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider text-white font-semibold leading-tight">
            THIS IS WHAT DRIVES US
          </h2>
          <p className="font-neuropol text-xs sm:text-sm md:text-[15px] text-neutral-400 mt-2 font-normal tracking-wide">
            Our strategic purpose, operational mission, and foundational values
          </p>
        </div>

        {/* =========================================================================
            2. THREE-CARD MINIMALIST ROW (Pure Black & White Theme)
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
          {CARDS.map((card) => {
            const isActive = activeCard === card.id;

            return (
              <div
                key={card.id}
                onClick={() => setActiveCard(card.id)}
                onMouseEnter={() => setActiveCard(card.id)}
                className={`mv-grid-card group relative cursor-pointer rounded-3xl p-7 sm:p-8 md:p-9 lg:p-10 flex flex-col justify-between min-h-[460px] sm:min-h-[500px] transition-all duration-500 ease-out  ${
                  isActive
                    ? "bg-gradient-to-b from-[#1c1c22]/95 via-[#121216]/95 to-[#09090b]  shadow-[0_0_35px_rgba(255,255,255,0.06)] scale-[1.01]"
                    : "bg-[#0b0b0e]/80  hover:bg-[#111116]/90"
                }`}
              >
                {/* Subtle Card Inner Top Rim Glow (Monochrome White) */}
                {isActive && (
                  <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                )}

                {/* Top Geometric Minimalist Wireframe Icon */}
                <div className="w-full flex items-start justify-between">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 relative flex items-center justify-center">
                    
                    {/* Icon 1: 3D Sphere Wireframe */}
                    {card.iconType === "sphere" && (
                      <svg viewBox="0 0 64 64" className="w-full h-full stroke-current" fill="none">
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke={isActive ? "#ffffff" : "rgba(255, 255, 255, 0.4)"}
                          strokeWidth="1.25"
                        />
                        <ellipse
                          cx="32"
                          cy="32"
                          rx="26"
                          ry="10"
                          stroke={isActive ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.3)"}
                          strokeWidth="1.25"
                        />
                        <ellipse
                          cx="32"
                          cy="32"
                          rx="10"
                          ry="26"
                          stroke={isActive ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.3)"}
                          strokeWidth="1.25"
                        />
                      </svg>
                    )}

                    {/* Icon 2: 3D Wireframe Globe with Lat/Long lines */}
                    {card.iconType === "globe" && (
                      <svg viewBox="0 0 64 64" className="w-full h-full stroke-current" fill="none">
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke={isActive ? "#ffffff" : "rgba(255, 255, 255, 0.4)"}
                          strokeWidth="1.25"
                        />
                        <line
                          x1="6"
                          y1="32"
                          x2="58"
                          y2="32"
                          stroke={isActive ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.3)"}
                          strokeWidth="1.25"
                        />
                        <line
                          x1="32"
                          y1="6"
                          x2="32"
                          y2="58"
                          stroke={isActive ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.3)"}
                          strokeWidth="1.25"
                        />
                        <ellipse
                          cx="32"
                          cy="32"
                          rx="16"
                          ry="26"
                          stroke={isActive ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.3)"}
                          strokeWidth="1.25"
                        />
                      </svg>
                    )}

                    {/* Icon 3: Stacked 3D Ellipses / Cylinder Wireframe */}
                    {card.iconType === "cylinder" && (
                      <svg viewBox="0 0 64 64" className="w-full h-full stroke-current" fill="none">
                        <ellipse
                          cx="32"
                          cy="18"
                          rx="24"
                          ry="8"
                          stroke={isActive ? "#ffffff" : "rgba(255, 255, 255, 0.4)"}
                          strokeWidth="1.25"
                        />
                        <ellipse
                          cx="32"
                          cy="32"
                          rx="24"
                          ry="8"
                          stroke={isActive ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.3)"}
                          strokeWidth="1.25"
                        />
                        <ellipse
                          cx="32"
                          cy="46"
                          rx="24"
                          ry="8"
                          stroke={isActive ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.3)"}
                          strokeWidth="1.25"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Card Number Badge */}
                  <span className="font-mono text-xs text-neutral-500 font-semibold">
                    {card.number}
                  </span>
                </div>

                {/* Bottom Content Area */}
                <div className="mt-auto pt-10">
                  
                  {/* Title */}
                  <h3 className="font-neuropol text-xl sm:text-2xl font-bold uppercase tracking-wide text-white leading-tight">
                    {card.title}
                  </h3>
                  <div className="font-mono text-[10px] sm:text-[11px] text-neutral-400 tracking-wider uppercase mt-1">
                    {card.subtitle}
                  </div>

                  {/* Thin Divider Line (Matching Image) */}
                  <div className="w-full h-[1px] bg-white/15 my-4 group-hover:bg-white/30 transition-colors" />

                  {/* Description */}
                  <p className="font-['Space_Grotesk',sans-serif] text-xs sm:text-[13px] text-neutral-300 leading-relaxed font-normal min-h-[72px]">
                    {card.description}
                  </p>

                  {/* Highlights Pills (Monochrome) */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {card.highlights.map((h, hIdx) => (
                      <span
                        key={hIdx}
                        className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono bg-white/[0.04]  text-neutral-300"
                      >
                        ✦ {h}
                      </span>
                    ))}
                  </div>

                  {/* Bottom Footer: Metric and Downward-Diagonal Arrow ↘ */}
                  <div className="flex items-center justify-between mt-6 pt-3 ">
                    <span className="font-mono text-[9px] sm:text-[10px] text-neutral-400 uppercase tracking-wider">
                      {card.metrics}
                    </span>

                    <svg
                      viewBox="0 0 24 24"
                      className={`w-6 h-6 stroke-current transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 ${
                        isActive ? "text-white" : "text-neutral-500"
                      }`}
                      fill="none"
                      strokeWidth="1.5"
                    >
                      <path d="M7 7L17 17" />
                      <path d="M7 17h10V7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
