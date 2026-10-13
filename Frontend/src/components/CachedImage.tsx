import React, { useState, useEffect, useRef } from "react";
import { getCachedMediaUrl } from "../utils/mediaCache";

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
}

// Global in-memory record of successfully loaded image URLs
// Once an image is loaded, it remains immediately loaded across tab switches and re-renders
const globalLoadedSrcs = new Set<string>();

/**
 * Enhanced CachedImage component
 * Loads the image from memory cache, browser CacheStorage, or network.
 * Avoids opacity flicker, remembers loaded state across re-renders,
 * and maintains 60fps scrolling on mobile devices.
 */
export const CachedImage: React.FC<CachedImageProps> = ({
  src,
  fallbackSrc,
  alt = "",
  className = "",
  loading = "lazy",
  decoding = "async",
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

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-90"} ${className}`}
      onLoad={(e) => {
        if (resolvedSrc) {
          globalLoadedSrcs.add(resolvedSrc);
        }
        if (cleanSrc) {
          globalLoadedSrcs.add(cleanSrc);
        }
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
