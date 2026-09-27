import React from "react";
import { ArrowDown } from "lucide-react";

interface ScrollExploreBadgeProps {
  targetId?: string;
  className?: string;
}

export const ScrollExploreBadge: React.FC<ScrollExploreBadgeProps> = ({
  targetId = "services-list",
  className = "",
}) => {
  const handleClick = () => {
    const element = document.getElementById(targetId);
    if (element) {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(element, {
          duration: 1.4,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      aria-label="Scroll to explore services"
      className={`group relative flex items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none ${className}`}
    >
      {/* Outer Rotating Text Ring */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center animate-[spin_16s_linear_infinite] group-hover:[animation-play-state:paused]">
        <svg
          className="w-full h-full"
          viewBox="0 0 140 140"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            id="textPath-circle"
            d="M 70, 70 m -50, 0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0"
            fill="none"
          />
          <text className="fill-neutral-400 text-[10.5px] uppercase font-['Space_Grotesk',sans-serif] tracking-[0.24em] transition-colors duration-300 group-hover:fill-neutral-200">
            <textPath href="#textPath-circle" startOffset="0%">
              SCROLL TO EXPLORE • SCROLL TO EXPLORE •
            </textPath>
          </text>
        </svg>
      </div>

      {/* Center Inner Circle with Arrow */}
      <div className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-neutral-700/80 bg-neutral-900/90 backdrop-blur-sm flex items-center justify-center text-neutral-300 transition-all duration-300 group-hover:border-neutral-400 group-hover:bg-neutral-800 group-hover:text-white shadow-lg shadow-black/50">
        <ArrowDown className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5" />
      </div>
    </button>
  );
};

export default ScrollExploreBadge;
