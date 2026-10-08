import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import { useCachedVideo, preloadVideoList } from "../utils/videoCache";

const CDN_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_CLOUDFRONT_URL) ||
  "https://d1mou18mn47yy7.cloudfront.net";

interface SlideItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly videoSrc: string;
}

const SLIDES: readonly SlideItem[] = [
  {
    id: "vision",
    name: "VISION",
    description:
      "To pioneer the future of digital commerce and brand storytelling by fusing next-generation AI intelligence, immersive 3D architectures, and hyper-scalable technologies that elevate businesses worldwide.",
    videoSrc: `${CDN_BASE}/assets/Videos/vission.webm`,
  },
  {
    id: "mission",
    name: "MISSION",
    description:
      "To empower visionary founders and enterprises through high-velocity creative engineering, data-backed growth systems, and robust digital ecosystems that consistently compound real enterprise value.",
    videoSrc: `${CDN_BASE}/assets/Videos/mission.webm`,
  },
  {
    id: "values",
    name: "VALUES",
    description:
      "We anchor every client partnership on unyielding transparency, creative mastery, agile sprint velocity, and measurable financial return on investment. If it doesn't move the business needle, we don't build it.",
    videoSrc: `${CDN_BASE}/assets/Videos/values.webm`,
  },
] as const;

const CachedVideoSlide: React.FC<{ slide: SlideItem; idx: number }> = ({ slide, idx }) => {
  const cachedSrc = useCachedVideo(slide.videoSrc);

  return (
    <div
      className={`bg-slide-${idx} absolute inset-0 w-full h-full pointer-events-none overflow-hidden will-change-[opacity,transform]`}
    >
      <video
        key={cachedSrc}
        src={cachedSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover select-none pointer-events-none"
      />

      {/* Clean Subtle Vignette Overlays allowing background video to play with rich brightness & high visibility */}
      <div className="absolute inset-0 bg-[#050505]/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-[#050505]/50" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#050505]/20 to-[#050505]/70" />
    </div>
  );
};

export const MissionVision: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Refresh and sort ScrollTriggers so pins above this section (Home, Portfolio) are accounted for
    ScrollTrigger.sort();

    const ctx = gsap.context(() => {
      const slideCount = SLIDES.length;
      const totalUnits = 100;
      const phaseDuration = totalUnits / slideCount; // ~33.33 units per slide
      const fillPortion = phaseDuration * 0.6; // 60% of phase time on letter wipe
      const transitionPortion = phaseDuration * 0.4; // 40% shifting to next slide

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: `+=${slideCount * 1200}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.8,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      // Horizontal Middle Progress Line (fills continuously along scroll)
      tl.fromTo(
        ".middle-progress-line",
        { scaleX: 0 },
        { scaleX: 1, duration: totalUnits, ease: "none" },
        0
      );

      // Set initial states for each title item
      SLIDES.forEach((_, idx) => {
        // Backgrounds
        gsap.set(`.bg-slide-${idx}`, {
          opacity: idx === 0 ? 1 : 0,
          scale: idx === 0 ? 1 : 1.05,
        });

        // Single Unified Title: idx 0 starts at active y: 0, others wait below
        gsap.set(`.title-item-${idx}`, {
          y: idx === 0 ? 0 : 120 * idx,
          opacity: idx === 0 ? 1 : 0,
        });

        // Letter wipe clipPath
        gsap.set(`.fill-layer-${idx}`, { clipPath: "inset(0 100% 0 0)" });

        // Descriptions & Subtitles
        gsap.set(`.desc-item-${idx}`, {
          opacity: idx === 0 ? 1 : 0,
          y: idx === 0 ? 0 : 25,
        });
      });

      // Build Scroll Progression
      SLIDES.forEach((_, idx) => {
        const phaseStart = idx * phaseDuration;

        // A. Letter-by-letter White Wipe Animation
        tl.fromTo(
          `.fill-layer-${idx}`,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            duration: fillPortion,
            ease: "none",
          },
          phaseStart
        );

        // B. Transition to Next Slide
        if (idx < slideCount - 1) {
          const transStart = phaseStart + fillPortion;
          const nextIdx = idx + 1;

          // Background crossfade
          tl.to(
            `.bg-slide-${idx}`,
            {
              opacity: 0,
              scale: 1.04,
              duration: transitionPortion,
              ease: "power2.inOut",
            },
            transStart
          );
          tl.to(
            `.bg-slide-${nextIdx}`,
            {
              opacity: 1,
              scale: 1,
              duration: transitionPortion,
              ease: "power2.inOut",
            },
            transStart
          );

          // 1. Move ALL past titles UP above the line into the ghost stack with clean gaps
          for (let past = 0; past <= idx; past++) {
            const stepsAbove = idx - past + 1;
            const targetY = -125 - (stepsAbove - 1) * 105;
            const targetOpacity = Math.max(0.18, 0.35 - (stepsAbove - 1) * 0.12);

            tl.to(
              `.title-item-${past}`,
              {
                y: targetY,
                opacity: targetOpacity,
                duration: transitionPortion,
                ease: "power2.inOut",
              },
              transStart
            );
          }

          // 2. Slide the NEXT title into the active position (y: 0, opacity: 1)
          tl.to(
            `.title-item-${nextIdx}`,
            {
              y: 0,
              opacity: 1,
              duration: transitionPortion,
              ease: "power2.inOut",
            },
            transStart
          );

          // 3. Switch descriptions (Right side)
          tl.to(
            `.desc-item-${idx}`,
            {
              opacity: 0,
              y: -20,
              duration: transitionPortion * 0.45,
              ease: "power2.inOut",
            },
            transStart
          );
          tl.to(
            `.desc-item-${nextIdx}`,
            {
              opacity: 1,
              y: 0,
              duration: transitionPortion * 0.65,
              ease: "power2.inOut",
            },
            transStart + transitionPortion * 0.35
          );
        }
      });

      // Final trailing hold
      tl.to({}, { duration: 15 }, totalUnits);
    }, el);

    // Refresh ScrollTrigger after DOM has fully settled
    const timer = setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, 300);

    const handleRefresh = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };

    window.addEventListener("start-hero-letters", handleRefresh);
    window.addEventListener("resize", handleRefresh);

    // Preload videos into CacheStorage persistently
    preloadVideoList(SLIDES.map((s) => s.videoSrc));

    return () => {
      clearTimeout(timer);
      window.removeEventListener("start-hero-letters", handleRefresh);
      window.removeEventListener("resize", handleRefresh);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="analytics-section"
      ref={sectionRef}
      aria-label="Corporate Vision, Mission, and Strategy Showcase"
      className="relative z-20 w-full h-screen min-h-[600px] overflow-hidden bg-[#050505] text-white select-none isolate font-['Outfit',sans-serif]"
    >
      {/* Background Video Layers with High-Contrast Vignette Overlays & Persistent Disk/Blob Cache */}
      {SLIDES.map((slide, idx) => (
        <CachedVideoSlide key={slide.id} slide={slide} idx={idx} />
      ))}

      {/* Ambient Geometric Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-40" />

      {/* Core Showcase Centered Wrapper */}
      <div className="relative z-20 w-full h-full max-w-8xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col justify-center">
        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">
          {/* Left Column: "OUR" + Single Title Stack */}
          <div className="lg:col-span-7 flex items-start gap-4 sm:gap-6 md:gap-8 relative">
            {/* 100% Edge-to-Edge Full Viewport Width Progress Line */}
            <div className="absolute top-[180px] left-1/2 -translate-x-1/2 w-screen z-10 pointer-events-none">
              <div className="relative w-full h-[1px] bg-white/20">
                <div className="middle-progress-line absolute top-0 left-0 h-full w-full bg-gradient-to-r from-white via-white to-white/70 origin-left will-change-transform" />
              </div>
            </div>

            {/* "OUR" Label positioned aligned with the active word */}
            <span className="text-[11px] md:text-xs tracking-[0.25em] font-extrabold uppercase text-white/90 select-none shrink-0 font-['Chakra_Petch',sans-serif] mt-[215px]">
              OUR
            </span>

            {/* Single Title Stack Container */}
            <div className="relative w-full h-[380px] overflow-visible">
              {/* SINGLE set of titles: each word translates up cleanly with spacing */}
              {SLIDES.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`title-item-${idx} absolute top-[200px] left-0 select-none will-change-[transform,opacity]`}
                >
                  <div className="relative inline-block">
                    {/* Base Muted Layer */}
                    <h2 className="text-[52px] sm:text-[70px] md:text-[84px] lg:text-[96px] leading-none font-black tracking-wider uppercase font-['Chakra_Petch',sans-serif] text-white/40 select-none">
                      {slide.name}
                    </h2>

                    {/* Top White Fill Layer (Wipes across letters on scroll) */}
                    <div
                      aria-hidden="true"
                      className={`fill-layer-${idx} absolute inset-0 overflow-hidden will-change-[clip-path] pointer-events-none`}
                    >
                      <span className="text-[52px] sm:text-[70px] md:text-[84px] lg:text-[96px] leading-none font-black tracking-wider uppercase font-['Chakra_Petch',sans-serif] text-white select-none whitespace-nowrap">
                        {slide.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Descriptions Stack (Anchored with proper spacing) */}
          <div className="lg:col-span-5 relative min-h-[220px] flex items-start lg:pl-8 mt-6 lg:mt-[200px]">
            {SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className={`desc-item-${idx} absolute left-0 right-0 will-change-[transform,opacity] space-y-4`}
              >

                <p className="text-base sm:text-lg md:text-xl lg:text-[22px] font-normal leading-relaxed text-zinc-100 drop-shadow-md">
                  {slide.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
