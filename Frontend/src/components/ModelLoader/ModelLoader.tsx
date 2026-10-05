import React from "react";
import { Html, useProgress } from "@react-three/drei";

interface ModelLoaderProps {
  label?: string;
  theme?: "dark" | "light";
}

/**
 * Non-blocking 3D Model Progress Loader
 * Renders directly inside React Three Fiber Canvas using Drei's Html helper
 */
export const ModelLoader: React.FC<ModelLoaderProps> = ({
  label = "Loading 3D Experience",
  theme = "dark",
}) => {
  const { progress, active } = useProgress();
  const displayProgress = Math.min(100, Math.max(0, Math.round(progress || 0)));

  if (!active && displayProgress >= 100) return null;

  return (
    <Html center zIndexRange={[50, 0]}>
      <div
        className={`pointer-events-none flex flex-col items-center justify-center gap-2 rounded-2xl px-5 py-3 select-none backdrop-blur-xl transition-opacity duration-300 shadow-2xl ${theme === "light"
            ? "bg-white/80 border border-black/10 text-black"
            : "bg-[#0c0c0c]/85 border border-white/15 text-white"
          }`}
        style={{ minWidth: "160px" }}
      >
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] shadow-[0_0_8px_#ff3b30] animate-pulse" />
          <span className={theme === "light" ? "text-neutral-700 font-semibold" : "text-neutral-300 font-semibold"}>
            {displayProgress > 0 ? `${displayProgress}%` : label}
          </span>
        </div>

        {/* 1px Hairline Precision Progress Bar */}
        <div
          className={`w-28 h-[2px] rounded-full overflow-hidden ${theme === "light" ? "bg-neutral-200" : "bg-neutral-800"
            }`}
        >
          <div
            className="h-full w-full bg-gradient-to-r from-[#ff3b30] to-[#ff6b00] transition-transform duration-150 ease-out origin-left"
            style={{ transform: `scaleX(${Math.max(displayProgress, 5) / 100})` }}
          />
        </div>
      </div>
    </Html>
  );
};

export default ModelLoader;
