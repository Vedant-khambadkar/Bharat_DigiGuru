import React, { useState, useEffect, useRef, Suspense } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface LazySectionProps {
  id?: string;
  minHeight?: string | number;
  rootMargin?: string;
  className?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * LazySection
 * High-performance viewport intersection observer wrapper.
 * Defers loading and rendering of below-the-fold sections, 3D WebGL canvases,
 * frame sequences, heavy animations, and videos until the user scrolls near them.
 */
export const LazySection: React.FC<LazySectionProps> = ({
  id,
  minHeight = "500px",
  rootMargin = "450px 0px",
  className = "",
  children,
  fallback,
}) => {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInView) return;

    const el = containerRef.current;
    if (!el) return;

    // Check if browser supports IntersectionObserver
    if (!("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0.01,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [isInView, rootMargin]);

  useEffect(() => {
    if (isInView) {
      // Synchronize Lenis & GSAP ScrollTrigger after the section renders
      const timer = setTimeout(() => {
        (window as any).lenis?.resize();
        ScrollTrigger.refresh();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={className}
      style={{
        minHeight: !isInView ? minHeight : undefined,
      }}
    >
      {isInView ? (
        <Suspense
          fallback={
            fallback || (
              <div
                style={{ minHeight }}
                className="w-full flex items-center justify-center bg-transparent py-16"
              >
                <div className="w-7 h-7 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
              </div>
            )
          }
        >
          {children}
        </Suspense>
      ) : (
        fallback || (
          <div
            style={{ minHeight }}
            className="w-full flex items-center justify-center bg-transparent"
          />
        )
      )}
    </div>
  );
};

export default LazySection;
