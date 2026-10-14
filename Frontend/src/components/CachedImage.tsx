import React, { useState, useEffect, useRef } from "react";
import { getCachedMediaUrl } from "../utils/mediaCache";

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  fetchPriority?: "high" | "low" | "auto";
}

// Bounded in-memory record of loaded image URLs to prevent memory bloat on mobile
const MAX_RECORDED_SRCS = 120;
const globalLoadedSrcs = new Set<string>();

function recordLoadedSrc(url: string) {
  if (!url) return;
  if (globalLoadedSrcs.has(url)) return;
  if (globalLoadedSrcs.size >= MAX_RECORDED_SRCS) {
    const oldest = globalLoadedSrcs.values().next().value;
    if (oldest) globalLoadedSrcs.delete(oldest);
  }
  globalLoadedSrcs.add(url);
}

/**
 * Enhanced CachedImage component
 * Loads images with async decoding, prevents layout shifts via aspect ratio,
 * supports priority hinting (fetchPriority), bounds memory caches,
 * and maintains 60fps scrolling on mobile devices.
 */
export const CachedImage: React.FC<CachedImageProps> = ({
  src,
  fallbackSrc,
  alt = "",
  className = "",
  loading = "lazy",
  decoding = "async",
  aspectRatio,
  fetchPriority,
  style,
  ...props
}) => {
  const cleanSrc = src?.trim() || "";
  const [resolvedSrc, setResolvedSrc] = useState<string>(cleanSrc);
  const [isLoaded, setIsLoaded] = useState<boolean>(() => globalLoadedSrcs.has(cleanSrc));
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!cleanSrc) {
      setResolvedSrc("");
      setIsLoaded(false);
      return;
    }

    if (globalLoadedSrcs.has(cleanSrc)) {
      setResolvedSrc(cleanSrc);
      setIsLoaded(true);
      return;
    }

    let isMounted = true;
    getCachedMediaUrl(cleanSrc)
      .then((cached) => {
        if (isMounted && cached) {
          setResolvedSrc(cached);
          if (globalLoadedSrcs.has(cached)) {
            setIsLoaded(true);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setResolvedSrc(cleanSrc);
        }
      });

    return () => {
      isMounted = false;
      mountedRef.current = false;
    };
  }, [cleanSrc]);

  const combinedStyle = aspectRatio
    ? { aspectRatio, ...style }
    : style;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      style={combinedStyle}
      {...((fetchPriority ? { fetchpriority: fetchPriority } : {}) as any)}
      className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-90"} ${className}`}
      onLoad={(e) => {
        if (resolvedSrc) recordLoadedSrc(resolvedSrc);
        if (cleanSrc) recordLoadedSrc(cleanSrc);
        if (mountedRef.current) {
          setIsLoaded(true);
        }
        if (props.onLoad) props.onLoad(e);
      }}
      onError={(e) => {
        if (fallbackSrc && resolvedSrc !== fallbackSrc) {
          setResolvedSrc(fallbackSrc);
        }
        if (props.onError) props.onError(e);
      }}
      {...props}
    />
  );
};

export default CachedImage;
