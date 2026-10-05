import React, { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { useProgress } from "@react-three/drei";

interface Preloader3DProps {
  isReady?: boolean;
  onStartExit?: () => void;
  onComplete: () => void;
}

export const Preloader3D: React.FC<Preloader3DProps> = ({
  isReady = false,
  onStartExit,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const numberElRef = useRef<HTMLSpanElement>(null);
  const telemetryPercentRef = useRef<HTMLSpanElement>(null);
  const telemetryStatusRef = useRef<HTMLSpanElement>(null);

  const counterRef = useRef({ value: 0 });
  const isExitingRef = useRef(false);

  // Read Three.js asset loading progress directly from Drei
  const { progress: dreiProgress } = useProgress();

  const updateDisplay = (val: number) => {
    const formatted = val < 10 ? `00${val}` : val < 100 ? `0${val}` : `${val}`;
    if (numberElRef.current) numberElRef.current.textContent = formatted;
    if (telemetryPercentRef.current) telemetryPercentRef.current.textContent = `${val}%`;
    if (progressBarRef.current) progressBarRef.current.style.width = `${val}%`;
    if (telemetryStatusRef.current) {
      telemetryStatusRef.current.textContent =
        val < 100 ? "INITIALIZING 3D ASSETS & HARDWARE" : "3D ENVIRONMENT READY";
    }
  };

  const triggerExit = useCallback(() => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;

    // Immediately trigger page reveal callback
    onStartExit?.();

    if (!containerRef.current) {
      onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();
      },
    });

    // Fade out internal telemetry text
    if (contentRef.current) {
      tl.to(contentRef.current, {
        opacity: 0,
        y: -25,
        duration: 0.2,
        ease: "power2.inOut",
      });
    }

    // Smooth curtain slide-up reveal
    tl.to(
      containerRef.current,
      {
        yPercent: -100,
        opacity: 0,
        duration: 0.5,
        ease: "power3.inOut",
      },
      contentRef.current ? "-=0.05" : 0
    );
  }, [onStartExit, onComplete]);

  // Progress interpolation driven directly by Hero readiness
  useEffect(() => {
    let target = 45;
    if (isReady) {
      target = 100;
    } else if (dreiProgress > 0) {
      target = Math.min(90, Math.max(counterRef.current.value, Math.round(dreiProgress * 0.9)));
    } else {
      target = Math.max(counterRef.current.value, 40);
    }

    if (isReady || target >= 100) {
      const tween = gsap.to(counterRef.current, {
        value: 100,
        duration: 0.25,
        ease: "power2.out",
        onUpdate: () => {
          const val = Math.round(counterRef.current.value);
          updateDisplay(val);
        },
        onComplete: () => {
          updateDisplay(100);
          const timer = setTimeout(() => {
            triggerExit();
          }, 80);
          return () => clearTimeout(timer);
        },
      });
      return () => {
        tween.kill();
      };
    }

    const tween = gsap.to(counterRef.current, {
      value: target,
      duration: 0.4,
      ease: "power2.out",
      onUpdate: () => {
        const val = Math.round(counterRef.current.value);
        updateDisplay(val);
      },
    });

    return () => {
      tween.kill();
    };
  }, [dreiProgress, isReady, triggerExit]);

  // Safety fallback: Auto-reveal in 2.5s maximum guaranteeing zero infinite stall or black screen
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      updateDisplay(100);
      triggerExit();
    }, 2500);

    return () => clearTimeout(safetyTimer);
  }, [triggerExit]);

  // Keyboard shortcut & Click to bypass
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.code === "Enter" || e.code === "Escape") && !isExitingRef.current) {
        triggerExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerExit]);

  return (
    <div
      ref={containerRef}
      onClick={triggerExit}
      className="fixed inset-0 z-[9999] w-screen h-screen bg-[#050505] text-white flex flex-col justify-between p-6 sm:p-10 md:p-14 select-none overflow-hidden will-change-transform cursor-pointer"
    >
      {/* Subtle Background Grid Texture (Pure Monochrome) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Top Header Bar */}
      <div className="relative z-10 w-full flex items-center justify-between font-mono text-[10px] sm:text-xs tracking-widest text-neutral-400 uppercase">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span className="text-neutral-300 font-semibold">BDG // SYS.INIT</span>
        </div>
      </div>

      {/* Centerpiece Minimalist Hero */}
      <div ref={contentRef} className="relative z-10 my-auto flex flex-col items-center justify-center w-full max-w-xl mx-auto text-center pointer-events-none">
        {/* Massive Precision Monospace Percentage */}
        <div className="flex items-baseline justify-center gap-2 font-['Syne',sans-serif] font-black text-[22vw] sm:text-[14vw] md:text-[120px] lg:text-[140px] leading-none text-white tracking-tighter select-none">
          <span ref={numberElRef}>000</span>
          <span className="text-2xl sm:text-3xl md:text-4xl font-mono text-neutral-500 font-light">%</span>
        </div>

        {/* 1px Hairline Precision Progress Wire */}
        <div className="w-full max-w-sm sm:max-w-md h-[1px] bg-neutral-800 relative mt-4 sm:mt-6 overflow-hidden">
          <div
            ref={progressBarRef}
            className="h-full bg-white transition-[width] duration-75 ease-out"
            style={{ width: "0%" }}
          />
        </div>

        {/* Micro Telemetry Status Line */}
        <div className="flex items-center justify-between w-full max-w-sm sm:max-w-md mt-3 font-mono text-[9px] sm:text-[10px] text-neutral-500 uppercase tracking-widest">
          <span ref={telemetryStatusRef}>INITIALIZING 3D ASSETS & HARDWARE</span>
          <span ref={telemetryPercentRef} className="text-neutral-300 font-semibold">0%</span>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="relative z-10 w-full flex items-end justify-between font-mono text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider">
        <div className="flex flex-col gap-0.5 text-left">
          <span className="text-neutral-300 font-['Space_Grotesk',sans-serif] font-bold tracking-tight text-xs sm:text-sm">
            Bharat DigiGuru
          </span>
          <span className="text-[9px] sm:text-[10px] text-neutral-500">
            DIGITAL MEDIA & ENGINEERING
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-600 hidden sm:inline">[ CLICK OR SPACE TO ENTER ]</span>
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
          <span className="text-neutral-400">V2.4</span>
        </div>
      </div>
    </div>
  );
};

export default Preloader3D;
