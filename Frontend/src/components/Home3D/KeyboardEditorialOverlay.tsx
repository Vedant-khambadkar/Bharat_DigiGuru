import React, { useEffect, useRef } from "react";

interface KeyboardEditorialOverlayProps {
  scrollProgressRef: React.RefObject<number>;
}

// 40 deterministic pseudo-random thresholds between 0.0 and 1.0
// Ensures letters throughout all lines dissolve in a non-linear, scattered random sequence
const CHAR_RANDOM_OFFSETS = [
  0.72, 0.15, 0.88, 0.32, 0.04, 0.95, 0.51, 0.22, 0.79,
  0.41, 0.08, 0.63, 0.91, 0.27, 0.83, 0.18, 0.57, 0.99, 0.36, 0.12, 0.74, 0.49,
  0.02, 0.68, 0.39, 0.85, 0.19, 0.94, 0.46, 0.61, 0.11, 0.77, 0.30, 0.54,
  0.89, 0.25, 0.70, 0.06, 0.44, 0.82
];

const HEADLINE_DATA = [
  ["ELEVATING"],
  ["BRANDS"],
  ["THROUGH"],
  ["DIGITAL", "MEDIA"],
  ["&", "3D", "CGI"],
];

const NARRATIVE_WORDS = [
  "Full-service", "digital", "media", "production,",
  "photorealistic", "3D", "CGI,", "viral", "marketing,", "and",
  "next-generation", "interactive", "web", "architectures",
  "engineered", "for", "visionary", "brands."
];

export const KeyboardEditorialOverlay: React.FC<KeyboardEditorialOverlayProps> = ({
  scrollProgressRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftWatermarkRef = useRef<HTMLDivElement>(null);
  const rightWatermarkRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const subContentRef = useRef<HTMLDivElement>(null);
  const narrativeRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const narrativeWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const mouseState = useRef({ x: 0, y: 0 });

  // 1. Mouse parallax tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseState.current.x = (e.clientX / window.innerWidth - 0.5) * 12;
      mouseState.current.y = (e.clientY / window.innerHeight - 0.5) * 12;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 2. High-Performance GPU Scrubbing Loop (Random Letter-by-Letter Opacity Dissolve)
  useEffect(() => {
    let rafId: number;
    let lastProgress = -1;
    let lastMx = -999;
    let lastMy = -999;

    const tick = () => {
      const progress = scrollProgressRef.current || 0;
      const { x: mx, y: my } = mouseState.current;

      const progressDiff = Math.abs(progress - lastProgress);
      const mouseDiff = Math.abs(mx - lastMx) + Math.abs(my - lastMy);

      if (progressDiff < 0.0002 && mouseDiff < 0.01) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      lastProgress = progress;
      lastMx = mx;
      lastMy = my;

      const currentFrame = progress * 176;

      // Dissolve frame range as laptop opens (Frame 50 to 84)
      const fadeStartFrame = 50;
      const fadeEndFrame = 84;
      const fadeWindow = fadeEndFrame - fadeStartFrame; // 34 frames span

      // Update Individual Letter Opacities (Zero movement, pure stochastic opacity fade)
      const charElements = charRefs.current;
      const totalChars = charElements.length;

      for (let i = 0; i < totalChars; i++) {
        const el = charElements[i];
        if (!el) continue;

        const randOffset = CHAR_RANDOM_OFFSETS[i % CHAR_RANDOM_OFFSETS.length];
        const charStart = fadeStartFrame + randOffset * (fadeWindow - 6);
        const charEnd = charStart + 6; // 6-frame smooth letter transition

        let charOpacity = 1;
        if (currentFrame <= charStart) {
          charOpacity = 1;
        } else if (currentFrame >= charEnd) {
          charOpacity = 0;
        } else {
          charOpacity = 1 - (currentFrame - charStart) / (charEnd - charStart);
        }

        el.style.opacity = charOpacity.toFixed(3);
      }

      // Update Narrative Paragraph Words Opacity (Stochastic Dissolve on Scroll)
      const narrativeWords = narrativeWordRefs.current;
      const totalNarrativeWords = narrativeWords.length;

      for (let i = 0; i < totalNarrativeWords; i++) {
        const el = narrativeWords[i];
        if (!el) continue;

        const randOffset = CHAR_RANDOM_OFFSETS[(i * 3 + 7) % CHAR_RANDOM_OFFSETS.length];
        const wordStart = fadeStartFrame + randOffset * (fadeWindow - 6);
        const wordEnd = wordStart + 6;

        let wordOpacity = 1;
        if (currentFrame <= wordStart) {
          wordOpacity = 1;
        } else if (currentFrame >= wordEnd) {
          wordOpacity = 0;
        } else {
          wordOpacity = 1 - (currentFrame - wordStart) / (wordEnd - wordStart);
        }

        el.style.opacity = wordOpacity.toFixed(3);
      }

      // Compute general overlay elements fade
      let generalOpacity = 1;
      if (currentFrame <= 28) {
        generalOpacity = 1;
      } else if (currentFrame >= 56) {
        generalOpacity = 0;
      } else {
        generalOpacity = 1 - (currentFrame - 28) / (56 - 28);
      }

      const isHeadlineHidden = currentFrame >= fadeEndFrame + 2;
      const isGeneralHidden = generalOpacity <= 0.001;

      // Update Left Headline Container
      if (leftContentRef.current) {
        leftContentRef.current.style.visibility = isHeadlineHidden ? "hidden" : "visible";
        leftContentRef.current.style.transform = `translate3d(${mx * 0.25}px, ${my * 0.25}px, 0)`;
      }

      // Update Sub-Headline, Tagline & Watch Showreel Button
      if (subContentRef.current) {
        subContentRef.current.style.opacity = generalOpacity.toFixed(3);
        subContentRef.current.style.visibility = isGeneralHidden ? "hidden" : "visible";
      }

      // Update Narrative Container Visibility
      if (narrativeRef.current) {
        narrativeRef.current.style.opacity = generalOpacity.toFixed(3);
        narrativeRef.current.style.visibility = isHeadlineHidden ? "hidden" : "visible";
      }

      // Update Background Translucent Watermarks
      if (leftWatermarkRef.current) {
        const wmOpacity = Math.max(0.02, 0.08 * (1 - progress * 0.8));
        leftWatermarkRef.current.style.opacity = wmOpacity.toString();
        leftWatermarkRef.current.style.transform = `translate3d(${mx * -0.3}px, ${my * -0.3}px, 0)`;
      }
      if (rightWatermarkRef.current) {
        const wmOpacity = Math.max(0.02, 0.08 * (1 - progress * 0.8));
        rightWatermarkRef.current.style.opacity = wmOpacity.toString();
        rightWatermarkRef.current.style.transform = `translate3d(${mx * 0.3}px, ${my * 0.3}px, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [scrollProgressRef]);

  // Compute global sequential index for ref registration
  let globalCharCounter = 0;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none font-['Inter',sans-serif] px-6 sm:px-10 md:px-12 lg:px-16"
    >
      <div className="relative w-full h-full">
        {/* =========================================================================
            1. MASSIVE TYPOGRAPHIC WATERMARKS (Neuropol X Futuristic Watermarks)
           ========================================================================= */}
        {/* Mid-Left "B D G" Brand Watermark */}
        <div
          ref={leftWatermarkRef}
          className="absolute left-0 top-[46%] -translate-y-1/2 font-['Neuropol_X',sans-serif] font-normal text-[15vw] sm:text-[13vw] md:text-[11vw] leading-none text-white/[0.08] tracking-wider uppercase pointer-events-none will-change-transform"
        >
          BDG
        </div>

        {/* Bottom-Right "26" Watermark */}
        <div
          ref={rightWatermarkRef}
          className="hidden sm:block absolute right-0 bottom-16 md:bottom-20 font-['Neuropol_X',sans-serif] font-normal text-[19vw] md:text-[16vw] leading-none text-white/[0.07] tracking-wider pointer-events-none will-change-transform"
        >
          26
        </div>

        {/* =========================================================================
            2. HERO MAIN EDITORIAL COLUMN (Left Side)
           ========================================================================= */}
        <div
          ref={leftContentRef}
          className="absolute left-0 top-20 sm:top-24 md:top-28 lg:top-32 max-w-[360px] sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl z-10 flex flex-col gap-3.5 sm:gap-4 will-change-[transform]"
        >
          {/* Top Pill / Discipline Tag */}
          <div ref={subContentRef} className="flex flex-col gap-3.5 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff3b30] shadow-[0_0_8px_#ff3b30] animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 font-semibold">
                SOCIAL &times; CREATIVE &times; TECHNOLOGY
              </span>
            </div>
          </div>

          {/* Headline in Neuropol X with Individual Character Dissolve Spans */}
          <h1 className="font-['Neuropol_X',sans-serif] tracking-wider text-white leading-[1.06] text-[1.85rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] xl:text-[3.8rem] uppercase flex flex-col gap-0.5">
            {HEADLINE_DATA.map((lineWords, lineIdx) => (
              <span key={lineIdx} className="flex flex-wrap items-center">
                {lineWords.map((word, wordIdx) => (
                  <span key={wordIdx} className="inline-flex whitespace-nowrap">
                    {word.split("").map((char) => {
                      const charIndex = globalCharCounter++;
                      return (
                        <span
                          key={charIndex}
                          ref={(el) => {
                            charRefs.current[charIndex] = el;
                          }}
                          className="inline-block transition-none will-change-[opacity]"
                        >
                          {char}
                        </span>
                      );
                    })}
                    {wordIdx < lineWords.length - 1 && (
                      <span className="inline-block whitespace-pre">&nbsp;</span>
                    )}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          {/* Sub-Headline Narrative with Word-by-Word Stochastic Dissolve */}
          <div ref={narrativeRef} className="flex flex-col gap-4 sm:gap-5 mt-1">
            <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed max-w-md lg:max-w-lg font-['Inter',sans-serif] flex flex-wrap gap-x-[0.35em] gap-y-[0.1em]">
              {NARRATIVE_WORDS.map((word, wordIdx) => (
                <span
                  key={wordIdx}
                  ref={(el) => {
                    narrativeWordRefs.current[wordIdx] = el;
                  }}
                  className="inline-block transition-none will-change-[opacity]"
                >
                  {word}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* =========================================================================
            3. BOTTOM-LEFT VERTICAL SCROLL INDICATOR
           ========================================================================= */}
        <div
          className="hidden sm:flex absolute left-0 bottom-8 sm:bottom-10 md:bottom-12 z-10 items-center gap-3 text-[10px] font-mono tracking-widest text-neutral-400 uppercase will-change-[opacity]"
        >
          <div className="w-[1.5px] h-7 bg-neutral-700 relative overflow-hidden">
            <div className="w-full h-1/2 bg-[#ff3b30] animate-bounce" />
          </div>
          <div className="flex gap-4 font-normal">
            <span className="text-neutral-400">SCROLL TO</span>
            <span className="text-white font-semibold">EXPLORE</span>
          </div>

        </div>

        {/* =========================================================================
            4. RIGHT SIDE EDITORIAL WIDGETS (Clean Vertical Side-Border Display)
           ========================================================================= */}
        {/* Top-Right Vertical Badge: EST. 2023 */}
        <div
          className="hidden md:flex absolute right-0 top-20 sm:top-24 md:top-28 z-10 flex-col items-center gap-3 [writing-mode:vertical-rl] text-[10px] font-mono tracking-[0.25em] text-neutral-400 uppercase will-change-[opacity]"
        >
          <span>EST. 2023</span>
          <div className="h-10 w-[1px] bg-neutral-600" />
        </div>

        {/* Mid-Right Widget: CREATIVE ─── TECH Slider */}
        <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 flex-col gap-2 w-56 lg:w-64 will-change-[opacity]">
          <div className="flex items-center gap-3 w-full text-white font-mono text-xs font-semibold tracking-wider">
            <span className="text-white">CREATIVE</span>
            <div className="flex-1 h-[1.5px] bg-neutral-700 relative">
              <div className="absolute left-0 top-0 h-full w-2/5 bg-[#ff3b30] shadow-[0_0_8px_#ff3b30]" />
            </div>
            <span className="text-neutral-400">TECH</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest text-right">
            01 // STUDIO
          </span>
        </div>

        {/* Bottom-Right Vertical Callout: LET'S CREATE TOGETHER */}
        <a
          href="#contact-section"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("contact-section");
            if (el) {
              const lenis = (window as any).lenis;
              if (lenis) {
                lenis.scrollTo(el, { duration: 1.5 });
              } else {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }
          }}
          className="pointer-events-auto hidden md:flex absolute right-0 bottom-8 sm:bottom-10 md:bottom-12 z-10 flex-col items-center gap-3 [writing-mode:vertical-rl] text-[11px] font-mono tracking-[0.25em] text-neutral-300 hover:text-white uppercase transition-all group cursor-pointer"
        >
          <span className="group-hover:text-white transition-colors">LET'S CREATE TOGETHER</span>
          <div className="h-10 w-[1.5px] bg-[#ff3b30] shadow-[0_0_8px_#ff3b30] group-hover:h-14 transition-all" />
        </a>
      </div>
    </div>
  );
};

export default KeyboardEditorialOverlay;
