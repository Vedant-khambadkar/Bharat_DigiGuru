import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LensText from "../components/LensText";

gsap.registerPlugin(ScrollTrigger);

interface SlideItem {
  id: "mission" | "vision" | "values";
  number: string;
  tag: string;
  backdropNumber: string;
  headlineWord1: string;
  headlineWord2?: string;
  aboutLabel: string;
  aboutText: string;
  imageUrl: string;
  imageAlt: string;
  rightMeta: string;
  highlights: string[];
}

const SLIDES: SlideItem[] = [
  {
    id: "mission",
    number: "01",
    tag: "01 // STRATEGIC PURPOSE",
    backdropNumber: "01",
    headlineWord1: "OUR MISSION",
    aboutLabel: "About Our Mission",
    aboutText:
      "To empower ambitious enterprises with top-tier digital media, photorealistic 3D visual marketing, and conversion-engineered web engineering. We tailor multi-disciplinary solutions that solve tangible business challenges—driving compounding brand equity and high-intent customer acquisition.",
    imageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Digital Power & Cinematic Landscape",
    rightMeta: "Bharat DigiGuru // Strategic Purpose",
    highlights: ["Data-Driven ROI", "Full-Funnel Growth", "Precision 3D Visuals"],
  },
  {
    id: "vision",
    number: "02",
    tag: "02 // FUTURE HORIZON",
    backdropNumber: "02",
    headlineWord1: "FUTURE",
    headlineWord2: "VISION",
    aboutLabel: "About Our Vision",
    aboutText:
      "We envision a digital frontier where visionary enterprises harness autonomous AI workflows, interactive 3D WebGL architectures, and frictionless digital media to establish sustainable, generational market leadership in an ever-evolving digital economy.",
    imageUrl:
      "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Future Crystal Cave Vision",
    rightMeta: "02 // Future Horizon & Leadership",
    highlights: ["AI Automation", "3D WebGL Frontiers", "Generational Scale"],
  },
  {
    id: "values",
    number: "03",
    tag: "03 // CORE ETHOS",
    backdropNumber: "03",
    headlineWord1: "CORE",
    headlineWord2: "VALUES",
    aboutLabel: "About Our Values",
    aboutText:
      "At Bharat DigiGuru, we champion uncompromising reliability, rapid sprint delivery, deep empathy, and bold creativity. By placing our clients' success at the absolute center, we build long-term partnerships engineered for mutual triumph.",
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Architectural Precision and Excellence",
    rightMeta: "03 // Core Ethos & Standards",
    highlights: ["Sprint Velocity", "Empathy-Led Craft", "Uncompromising Quality"],
  },
];

export const MissionVision: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hudSlideRef = useRef<HTMLSpanElement>(null);

  // GSAP Horizontal Pin & ScrollTrigger Scrub along X-Axis
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let lastActive = -1;

    const ctx = gsap.context(() => {
      const getScrollAmount = () => -(track.scrollWidth - window.innerWidth);

      const horizontalTween = gsap.to(track, {
        x: getScrollAmount,
        ease: "none",
        invalidateOnRefresh: true,
      });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.85,
        anticipatePin: 1,
        fastScrollEnd: true,
        animation: horizontalTween,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Update horizontal progress bar
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${self.progress * 100}%`;
          }

          // Compute active slide index for live HUD updates
          const numSlides = SLIDES.length;
          const idx = Math.min(numSlides - 1, Math.floor(self.progress * numSlides + 0.15));
          if (idx !== lastActive) {
            lastActive = idx;
            if (hudSlideRef.current) {
              hudSlideRef.current.textContent = `DISCIPLINE // 0${idx + 1} OF 0${numSlides}`;
            }
          }
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="mission-vision-section"
      ref={sectionRef}
      className="relative w-full h-screen bg-transparent text-white overflow-hidden select-none"
    >
      {/* Background Subtle Dot-Matrix Texture (Monochrome) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 z-0"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1.25px, transparent 1.25px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top Header Fixed Telemetry HUD with Progress Wire */}
      <div className="absolute top-0 inset-x-0 z-30 flex flex-col pointer-events-none p-4 sm:p-6 md:p-8">
        {/* 1.5px Horizontal Scroll Progress Wire */}
        <div className="w-full max-w-7xl mx-auto h-[1.5px] bg-white/10 relative mt-2.5 overflow-hidden rounded-full">
          <div
            ref={progressBarRef}
            className="h-full bg-white transition-[width] duration-75 ease-out rounded-full"
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* =========================================================================
          HORIZONTAL SCROLL TRACK (Glides along X-Axis on vertical scroll)
         ========================================================================= */}
      <div
        ref={trackRef}
        className="flex flex-row flex-nowrap h-full items-center will-change-transform z-10"
      >
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className="w-screen h-full shrink-0 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 pt-16 sm:pt-20 pb-20 sm:pb-24 relative"
          >
            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col justify-center">
              {/* Heading */}
              <div className="w-full mb-3 sm:mb-4 relative z-20 pointer-events-none text-left pl-1 sm:pl-2">
                <h2 className="font-neuropol text-2xl sm:text-3xl md:text-4xl lg:text-[44px] xl:text-[50px] uppercase tracking-tight text-white leading-tight">
                  {slide.headlineWord2 ? (
                    <>
                      <span className="text-white">{slide.headlineWord1} </span>
                      <span className="text-white">{slide.headlineWord2}</span>
                    </>
                  ) : (
                    <LensText text={slide.headlineWord1} strokeWidth="1.5px" strokeColor="#ffffff" />
                  )}
                </h2>
              </div>

              {/* Composition Stage: Clean Dark Glass Card + Floating Editorial Image */}
              <div className="relative w-full flex flex-col lg:flex-row items-center lg:items-stretch min-h-[340px] sm:min-h-[380px] md:min-h-[420px]">
                {/* 1. Clean Dark Luxury Glassmorphism Card (Zero colored tint) */}
                <div className="w-full lg:w-[62%] bg-[#101010]/90 border border-white/10 text-white p-6 sm:p-8 md:p-10 lg:pr-24 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col justify-between relative z-10 transition-colors duration-300 hover:border-white/20">
                  <div className="flex flex-col gap-3 max-w-full lg:max-w-md">
                    {/* Pillar Badge */}
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white/80" />
                      <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-neutral-400 font-semibold">
                        {slide.tag}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="font-['Space_Grotesk',sans-serif] text-base font-bold tracking-tight text-white">
                        {slide.aboutLabel}
                      </span>
                      <div className="w-9 h-[2px] rounded-full bg-white/40" />
                    </div>

                    <p className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm md:text-[15px] text-neutral-300 font-normal leading-relaxed mt-1">
                      {slide.aboutText}
                    </p>
                  </div>

                  {/* Highlights Pills Row */}
                  <div className="flex flex-wrap items-center gap-2 mt-5 pt-3.5 border-t border-white/[0.08]">
                    {slide.highlights.map((item, hIdx) => (
                      <span
                        key={hIdx}
                        className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-mono uppercase tracking-wider bg-white/[0.05] border border-white/[0.08] text-neutral-300"
                      >
                        ✦ {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Floating High-Resolution Image Card */}
                <div className="relative lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 w-full sm:w-[88%] lg:w-[50%] h-56 sm:h-68 md:h-80 lg:h-[360px] mt-4 lg:mt-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl z-20 border border-white/15 group bg-neutral-900">
                  <img
                    src={slide.imageUrl}
                    alt={slide.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-95 contrast-105"
                  />

                  {/* Subtle Slide Indicator Badge */}
                  <div className="absolute bottom-3.5 right-3.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 font-mono text-[9px] sm:text-[10px] text-white/90">
                    DISCIPLINE 0{idx + 1}
                  </div>
                </div>

                {/* 3. Giant Background Numeral Watermark */}
                <div className="hidden lg:block absolute right-[-1.5rem] bottom-[-2rem] font-neuropol text-[150px] xl:text-[180px] leading-none text-white/[0.035] select-none pointer-events-none z-0">
                  {slide.backdropNumber}
                </div>

                {/* 4. Right Vertical Metadata Label */}
                <div className="hidden xl:flex absolute right-[-4.5rem] top-1/2 -translate-y-1/2 flex-col items-center gap-3 [writing-mode:vertical-rl] font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase select-none">
                  <span>{slide.rightMeta}</span>
                  <div className="flex flex-col gap-1 items-center">
                    <div className="w-[1.5px] h-3 bg-neutral-700" />
                    <div className="w-[2px] h-6 rounded-full bg-white/60" />
                    <div className="w-[1.5px] h-3 bg-neutral-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Soft Fade Gradient for Seamless Section Transition */}
      <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] pointer-events-none z-20" />

      {/* Bottom Footer Fixed HUD Bar */}
      <div className="absolute bottom-0 inset-x-0 z-30 p-4 sm:p-6 md:p-8 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between font-mono text-[10px] sm:text-xs text-neutral-400 uppercase tracking-widest pt-3 border-t border-white/[0.06] pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold tracking-tight font-['Space_Grotesk',sans-serif] text-xs sm:text-sm">
              Bharat DigiGuru
            </span>
            <span className="text-neutral-600">/</span>
            <span ref={hudSlideRef} className="text-neutral-400">
              DISCIPLINE // 01 OF 0{SLIDES.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400">HORIZONTAL SCROLL</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
