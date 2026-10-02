import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useProgress } from "@react-three/drei";

interface Preloader3DProps {
  realProgress?: number;
  isReady?: boolean;
  onStartExit?: () => void;
  onComplete: () => void;
}

export const Preloader3D: React.FC<Preloader3DProps> = ({
  realProgress = 0,
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

  // Read Three.js asset loading progress from Drei
  const { progress: dreiProgress, active: dreiActive, loaded, total } = useProgress();

  const updateDisplay = (val: number) => {
    const formatted = val < 10 ? `00${val}` : val < 100 ? `0${val}` : `${val}`;
    if (numberElRef.current) numberElRef.current.textContent = formatted;
    if (telemetryPercentRef.current) telemetryPercentRef.current.textContent = `${val}%`;
    if (progressBarRef.current) progressBarRef.current.style.width = `${val}%`;
    if (telemetryStatusRef.current) {
      telemetryStatusRef.current.textContent = val < 100 ? "INITIALIZING 3D ENVIRONMENT" : "3D ENVIRONMENT INITIALIZED";
    }
  };

  const triggerExit = () => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;

    const tl = gsap.timeline({
      onStart: () => {
        onStartExit?.();
      },
      onComplete: () => {
        onComplete();
      },
    });

    // Fade out internal telemetry text
    tl.to(contentRef.current, {
      opacity: 0,
      y: -25,
      duration: 0.4,
      ease: "power2.inOut",
    });

    // Smooth curtain slide-up reveal
    tl.to(
      containerRef.current,
      {
        yPercent: -100,
        duration: 1.0,
        ease: "power3.inOut",
      },
      "-=0.2"
    );
  };

  // Progress interpolation driven by 3D asset loader + simulated minimum ramp
  useEffect(() => {
    const is3DFinished = (!dreiActive && (dreiProgress >= 99 || (total > 0 && loaded >= total))) || isReady;
    const calculatedTarget = is3DFinished ? 100 : Math.max(realProgress, dreiProgress);

    const target = Math.min(100, Math.max(counterRef.current.value, calculatedTarget));

    const tween = gsap.to(counterRef.current, {
      value: target,
      duration: target >= 100 ? 0.35 : 0.6,
      ease: "power2.out",
      onUpdate: () => {
        const val = Math.round(counterRef.current.value);
        updateDisplay(val);
      },
      onComplete: () => {
        if (counterRef.current.value >= 99.5 && !isExitingRef.current) {
          triggerExit();
        }
      },
    });

    return () => {
      tween.kill();
    };
  }, [realProgress, dreiProgress, dreiActive, isReady, loaded, total]);

  // Fail-safe & initial progressive counter ramp
  useEffect(() => {
    // Initial ramp to make the loader feel responsive immediately
    const rampTween = gsap.to(counterRef.current, {
      value: 90,
      duration: 1.8,
      ease: "power1.out",
      onUpdate: () => {
        const val = Math.round(counterRef.current.value);
        updateDisplay(val);
      },
    });

    // Safety timeout: Ensure page always reveals within 2.5s maximum
    const safetyTimeout = setTimeout(() => {
      gsap.to(counterRef.current, {
        value: 100,
        duration: 0.3,
        ease: "power2.out",
        onUpdate: () => {
          updateDisplay(100);
        },
        onComplete: () => {
          triggerExit();
        },
      });
    }, 2500);

    return () => {
      rampTween.kill();
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Space key to bypass
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isExitingRef.current) {
        isExitingRef.current = true;
        triggerExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] w-screen h-screen bg-[#050505] text-white flex flex-col justify-between p-6 sm:p-10 md:p-14 select-none overflow-hidden will-change-transform"
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
      <div ref={contentRef} className="relative z-10 my-auto flex flex-col items-center justify-center w-full max-w-xl mx-auto text-center">
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
          <span ref={telemetryStatusRef}>LOADING HARDWARE ASSETS</span>
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
          <span className="text-neutral-600 hidden sm:inline">[ SPACE TO BYPASS ]</span>
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
          <span className="text-neutral-400">V2.4</span>
        </div>
      </div>
    </div>
  );
};

export default Preloader3D;
