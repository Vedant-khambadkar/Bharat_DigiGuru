import React, { useRef, useEffect } from "react";

interface LensTextProps {
  text: string;
  className?: string;
  strokeColor?: string;
  strokeWidth?: string;
  radius?: number;
}

export const LensText: React.FC<LensTextProps> = ({
  text,
  className = "",
  strokeColor = "#ffffff",
  strokeWidth = "1px",
  radius = 38,
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const strokeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Only run lens cursor mask calculations on desktop devices with fine mouse pointer
    const isFinePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches &&
      window.innerWidth >= 768;

    if (!isFinePointer) return;

    let lastX = -9999;
    let lastY = -9999;
    let rafId: number | null = null;
    let isVisible = false;
    let wasNear = false;
    let cachedRect: DOMRect | null = null;

    const container = containerRef.current;
    if (!container) return;

    const updateRect = () => {
      if (isVisible && container) {
        cachedRect = container.getBoundingClientRect();
      }
    };

    const updateMask = () => {
      if (!isVisible) return;

      const fill = fillRef.current;
      const stroke = strokeRef.current;
      if (!container || !fill || !stroke) return;

      if (!cachedRect) {
        cachedRect = container.getBoundingClientRect();
      }
      let rect = cachedRect;
      let localX = lastX - rect.left;
      let localY = lastY - rect.top;

      // When cursor is within proximity (< 60px outside box), refresh rect for sub-pixel accuracy against transforms
      const isPotentiallyNear =
        localX >= -radius - 60 &&
        localX <= rect.width + radius + 60 &&
        localY >= -radius - 60 &&
        localY <= rect.height + radius + 60;

      if (isPotentiallyNear) {
        rect = container.getBoundingClientRect();
        cachedRect = rect;
        localX = lastX - rect.left;
        localY = lastY - rect.top;
      }

      // Check if the circle touches this text bounding box
      const isNear =
        localX >= -radius &&
        localX <= rect.width + radius &&
        localY >= -radius &&
        localY <= rect.height + radius;

      if (isNear) {
        wasNear = true;
        // Cut out the solid fill strictly inside the circle area
        const fillMask = `radial-gradient(circle ${radius}px at ${localX}px ${localY}px, transparent calc(${radius}px - 1.5px), black ${radius}px)`;
        fill.style.webkitMaskImage = fillMask;
        fill.style.maskImage = fillMask;

        // Show the thin border stroke strictly inside the circle area
        const strokeMask = `radial-gradient(circle ${radius}px at ${localX}px ${localY}px, black calc(${radius}px - 1.5px), transparent ${radius}px)`;
        stroke.style.webkitMaskImage = strokeMask;
        stroke.style.maskImage = strokeMask;
        stroke.style.opacity = "1";
      } else if (wasNear) {
        // Instant clean up of both masks when cursor leaves
        fill.style.webkitMaskImage = "";
        fill.style.maskImage = "";
        stroke.style.webkitMaskImage = "";
        stroke.style.maskImage = "";
        stroke.style.opacity = "0";
        wasNear = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) return;
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateMask);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isVisible || e.touches.length === 0) return;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateMask);
    };

    let scrollRaf = false;
    const handleScroll = () => {
      if (!isVisible) return;
      if (scrollRaf) return;
      scrollRaf = true;
      requestAnimationFrame(() => {
        scrollRaf = false;
        updateRect();
        if (wasNear) {
          updateMask();
        }
      });
    };

    const bindListeners = () => {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchstart", handleTouchMove, { passive: true });
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", updateRect, { passive: true });
    };

    const unbindListeners = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateRect);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    // Only activate mask calculation when element is in the viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          cachedRect = container.getBoundingClientRect();
          bindListeners();
        } else {
          unbindListeners();
          if (wasNear) {
            const fill = fillRef.current;
            const stroke = strokeRef.current;
            if (fill && stroke) {
              fill.style.webkitMaskImage = "";
              fill.style.maskImage = "";
              stroke.style.webkitMaskImage = "";
              stroke.style.maskImage = "";
              stroke.style.opacity = "0";
            }
            wasNear = false;
          }
          cachedRect = null;
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
      unbindListeners();
    };
  }, [radius]);

  return (
    <span
      ref={containerRef}
      data-lens-text="true"
      className={`relative inline-block ${className}`}
    >
      {/* Base Solid Fill Layer - Inherits exact font & styling from parent container */}
      <span
        ref={fillRef}
        className="inline-block text-white select-none whitespace-normal"
        style={{
          font: "inherit",
          letterSpacing: "inherit",
          textTransform: "inherit",
        }}
      >
        {text}
      </span>

      {/* Thin Crisp Border Stroke Layer (ONLY visible inside the circle) */}
      <span
        ref={strokeRef}
        aria-hidden="true"
        className="absolute inset-0 inline-block pointer-events-none select-none text-transparent opacity-0 whitespace-normal"
        style={{
          WebkitTextStroke: `${strokeWidth} ${strokeColor}`,
          font: "inherit",
          letterSpacing: "inherit",
          textTransform: "inherit",
        }}
      >
        {text}
      </span>
    </span>
  );
};

export default LensText;
