import React, { useState, useRef, useCallback } from "react";

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
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;
      if (overlayRef.current) {
        const mask = `radial-gradient(circle ${lensRadius}px at ${x}px ${y}px, black 0%, black calc(${lensRadius}px - 45px), transparent ${lensRadius}px)`;
        overlayRef.current.style.webkitMaskImage = mask;
        overlayRef.current.style.maskImage = mask;
      }
    },
    [lensRadius]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(true);
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;
      if (overlayRef.current) {
        const mask = `radial-gradient(circle ${lensRadius}px at ${x}px ${y}px, black 0%, black calc(${lensRadius}px - 45px), transparent ${lensRadius}px)`;
        overlayRef.current.style.webkitMaskImage = mask;
        overlayRef.current.style.maskImage = mask;
      }
    },
    [lensRadius]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden select-none cursor-crosshair ${containerClassName}`}
    >
      {/* Base Layer: Black and white by default */}
      <img
        src={src}
        alt={alt}
        className={`${className} grayscale contrast-115 brightness-90 transition-transform duration-700 ease-out group-hover:scale-105`}
        loading="lazy"
        decoding="async"
      />

      {/* Color Overlay Layer: Seamlessly reveals original color via soft optical blur feather */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out"
        style={{
          opacity: isHovered ? 1 : 0,
        }}
      >
        <img
          src={src}
          alt={alt}
          className={`${className} brightness-105 contrast-110 transition-transform duration-700 ease-out group-hover:scale-105`}
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
};

export default ColorLensImage;
