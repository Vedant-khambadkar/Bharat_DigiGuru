import React, { useRef, useCallback, useEffect, useState } from "react";
import { getCachedMediaUrl, useCachedMedia } from "../utils/mediaCache";

interface ColorLensImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  lensRadius?: number;
}

export const ColorLensImage: React.FC<ColorLensImageProps> = ({
  src,
  alt,
  className = "w-full h-full object-cover",
  containerClassName = "relative w-full h-full overflow-hidden",
  lensRadius = 100,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const rectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const isInteractingRef = useRef<boolean>(false);
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => useCachedMedia(src) || src);

  useEffect(() => {
    let isMounted = true;
    if (src) {
      getCachedMediaUrl(src)
        .then((cached) => {
          if (isMounted && cached) setResolvedSrc(cached);
        })
        .catch(() => {
          if (isMounted) setResolvedSrc(src);
        });
    }
    return () => {
      isMounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [src]);

  // Measure container dimensions once on interaction start, not on every touchmove/mousemove
  const measureContainer = useCallback(() => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    rectRef.current = {
      left: r.left + window.scrollX,
      top: r.top + window.scrollY,
      width: r.width,
      height: r.height,
    };
  }, []);

  const updateMaskPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current || !overlayRef.current) return;
        if (!rectRef.current) {
          measureContainer();
        }
        const rect = rectRef.current;
        if (!rect) return;

        // Calculate offset relative to the element without forcing synchronous reflow
        const pageX = clientX + window.scrollX;
        const pageY = clientY + window.scrollY;
        const x = Math.max(0, Math.min(rect.width, pageX - rect.left));
        const y = Math.max(0, Math.min(rect.height, pageY - rect.top));

        const mask = `radial-gradient(circle ${lensRadius}px at ${x}px ${y}px, black 0%, black calc(${lensRadius}px - 45px), transparent ${lensRadius}px)`;
        overlayRef.current.style.webkitMaskImage = mask;
        overlayRef.current.style.maskImage = mask;
      });
    },
    [lensRadius, measureContainer]
  );

  const handlePointerEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      isInteractingRef.current = true;
      measureContainer();
      if (overlayRef.current) overlayRef.current.style.opacity = "1";
      updateMaskPosition(e.clientX, e.clientY);
    },
    [measureContainer, updateMaskPosition]
  );

  const handlePointerLeave = useCallback(() => {
    isInteractingRef.current = false;
    rectRef.current = null;
    if (overlayRef.current) overlayRef.current.style.opacity = "0";
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isInteractingRef.current) return;
      updateMaskPosition(e.clientX, e.clientY);
    },
    [updateMaskPosition]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length > 0) {
        isInteractingRef.current = true;
        measureContainer();
        if (overlayRef.current) overlayRef.current.style.opacity = "1";
        updateMaskPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [measureContainer, updateMaskPosition]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length > 0) {
        updateMaskPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [updateMaskPosition]
  );

  const handleTouchEnd = useCallback(() => {
    isInteractingRef.current = false;
    rectRef.current = null;
    if (overlayRef.current) overlayRef.current.style.opacity = "0";
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ touchAction: "pan-y" }}
      className={`group relative overflow-hidden select-none cursor-crosshair ${containerClassName}`}
    >
      {/* Base Layer: Black and white by default */}
      <img
        src={resolvedSrc || src}
        alt={alt}
        className={`${className} grayscale contrast-115 brightness-90 transition-transform duration-500 ease-out`}
        loading="lazy"
        decoding="async"
      />

      {/* Color Overlay Layer: Reveals original color via hardware accelerated mask */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-200 ease-out"
        style={{ opacity: 0 }}
      >
        <img
          src={resolvedSrc || src}
          alt={alt}
          className={`${className} brightness-105 contrast-110 transition-transform duration-500 ease-out`}
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
};

export default ColorLensImage;
