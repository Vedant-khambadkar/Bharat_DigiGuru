import React, { useState, useEffect } from "react";
import { getCachedMediaUrl } from "../utils/mediaCache";

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
}

/**
 * Enhanced CachedImage component
 * Loads the image from the browser's persistent CacheStorage API / Blob cache.
 * Uses native async decoding and lazy loading for buttery smooth 60fps scrolling.
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
  const [resolvedSrc, setResolvedSrc] = useState<string>(src || "");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!src) {
      setResolvedSrc("");
      setIsLoaded(false);
      return;
    }

    let isMounted = true;
    getCachedMediaUrl(src)
      .then((cached) => {
        if (isMounted) {
          setResolvedSrc(cached || src);
        }
      })
      .catch(() => {
        if (isMounted) {
          setResolvedSrc(src);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-90"} ${className}`}
      onLoad={(e) => {
        setIsLoaded(true);
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
