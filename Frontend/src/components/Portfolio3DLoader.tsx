import React, { useState, useEffect } from "react";

interface Portfolio3DLoaderProps {
  progress?: number;
  className?: string;
}

const LOADING_MESSAGES = [
  "INITIALIZING 3D SPATIAL ENGINE",
  "COMPUTING BONE SKELETON & WEIGHTS",
  "DECODING 4K TEXTURES & SHADERS",
  "SYNCHRONIZING INTERACTIVE CAROUSEL",
  "CALIBRATING VIEWPORT MATRICES",
];

export const Portfolio3DLoader: React.FC<Portfolio3DLoaderProps> = ({
  progress: externalProgress,
  className = "",
}) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [internalProgress, setInternalProgress] = useState(15);

  // Cycle through animated technical status messages
  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1400);

    return () => clearInterval(msgInterval);
  }, []);

  // Smoothly increment simulated loader progress if external progress is not provided
  useEffect(() => {
    if (externalProgress !== undefined) {
      setInternalProgress(externalProgress);
      return;
    }

    const timer = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 96) return prev;
        const inc = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + inc, 96);
      });
    }, 180);

    return () => clearInterval(timer);
  }, [externalProgress]);

  const activeProgress = externalProgress !== undefined ? externalProgress : internalProgress;

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-20 pointer-events-none transition-opacity duration-700 select-none ${className}`}
    >
      {/* 1. Futuristic Holographic 3D Geometric Ring Loader */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center mb-6">
        {/* Outer Pulsing Glow Aura */}
        <div className="absolute inset-0 rounded-full bg-[#ff3b30]/15 blur-xl animate-pulse" />

        {/* Outer Rotating Segmented Ring */}
        <div className="absolute inset-0 rounded-full border border-dashed border-[#ff3b30]/40 animate-[spin_8s_linear_infinite]" />

        {/* Main Clockwise High-Precision Ring */}
        <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-[#ff3b30] border-r-[#ff2d55]/80 animate-[spin_1.2s_cubic-bezier(0.4,0,0.2,1)_infinite]" />

        {/* Inner Counter-Clockwise Neon Cyan Ring */}
        <div className="absolute inset-3.5 rounded-full border-2 border-transparent border-b-cyan-400 border-l-cyan-400/50 animate-[spin_1.8s_linear_infinite_reverse]" />

        {/* Core Rotating 3D Diamond / Geometry Node */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="w-5 h-5 border border-white/80 bg-[#ff3b30]/20 rotate-45 animate-pulse shadow-[0_0_15px_rgba(255,59,48,0.8)]" />
          <div className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
        </div>

        {/* 4 Corner HUD Crosshair Marks */}
        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#ff3b30]" />
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#ff3b30]" />
        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#ff3b30]" />
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#ff3b30]" />
      </div>

      {/* 2. Technical HUD Title & Percentage */}
      <div className="flex items-center gap-2.5 mb-2">
        <span className="w-2 h-2 rounded-full bg-[#ff3b30] animate-ping" />
        <span className="font-mono text-xs sm:text-sm tracking-[0.25em] text-white font-semibold uppercase">
          LOADING 3D MODEL
        </span>
        <span className="font-mono text-xs text-[#ff3b30] font-bold">
          {Math.round(activeProgress)}%
        </span>
      </div>

      {/* 3. Animated Dynamic Status Messages with Fade/Slide Effect */}
      <div className="h-6 flex items-center justify-center overflow-hidden px-4 text-center max-w-sm">
        <p
          key={msgIndex}
          className="font-mono text-[10.5px] sm:text-xs tracking-[0.18em] text-stone-400 uppercase animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all"
        >
          {LOADING_MESSAGES[msgIndex]}
        </p>
      </div>

      {/* 4. Glowing Precision Progress Bar */}
      <div className="w-48 sm:w-56 h-[3px] bg-neutral-900/90 rounded-full mt-4 overflow-hidden border border-white/10 p-[1px] shadow-[0_0_10px_rgba(0,0,0,0.8)]">
        <div
          className="h-full bg-gradient-to-r from-[#ff2d55] via-[#ff3b30] to-[#ff9500] rounded-full transition-all duration-200 ease-out shadow-[0_0_12px_rgba(255,59,48,0.9)]"
          style={{ width: `${activeProgress}%` }}
        />
      </div>

      {/* 5. Micro Technical Matrix Telemetry */}
      <div className="flex items-center gap-4 mt-3 font-mono text-[9px] tracking-wider text-neutral-500 uppercase">
        <span>BUFFERS: ACTIVE</span>
        <span>•</span>
        <span>SKINNING: 30 SEG</span>
        <span>•</span>
        <span>GL: WEBGL2</span>
      </div>
    </div>
  );
};

export default Portfolio3DLoader;
