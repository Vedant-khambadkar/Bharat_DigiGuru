import React, { useState, useRef, useCallback, useEffect } from "react";
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
  const [isHovered, setIsHovered] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => useCachedMedia(src) || src);

  useEffect(() => {
    let isMounted = true;
    if (src) {
      getCachedMediaUrl(src).then((cached) => {
        if (isMounted && cached) setResolvedSrc(cached);
      }).catch(() => {
        if (isMounted) setResolvedSrc(src);
      });
    }
    return () => {
      isMounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [src]);

  const updateMaskPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current || !overlayRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const mask = `radial-gradient(circle ${lensRadius}px at ${x}px ${y}px, black 0%, black calc(${lensRadius}px - 45px), transparent ${lensRadius}px)`;
        overlayRef.current.style.webkitMaskImage = mask;
        overlayRef.current.style.maskImage = mask;
      });
    },
    [lensRadius]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      updateMaskPosition(e.clientX, e.clientY);
    },
    [updateMaskPosition]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(true);
      updateMaskPosition(e.clientX, e.clientY);
    },
    [updateMaskPosition]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length > 0) {
        setIsHovered(true);
        updateMaskPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [updateMaskPosition]
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
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`group relative overflow-hidden select-none cursor-crosshair transform-gpu will-change-transform ${containerClassName}`}
    >
      {/* Base Layer: Black and white by default */}
      <img
        src={resolvedSrc || src}
        alt={alt}
        className={`${className} grayscale contrast-115 brightness-90 transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform`}
        loading="lazy"
        decoding="async"
      />

      {/* Color Overlay Layer: Seamlessly reveals original color via soft optical blur feather */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out will-change-[opacity,mask-image]"
        style={{
          opacity: isHovered ? 1 : 0,
        }}
      >
        <img
          src={resolvedSrc || src}
          alt={alt}
          className={`${className} brightness-105 contrast-110 transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform`}
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
};

export default ColorLensImage;
