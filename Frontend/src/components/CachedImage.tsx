import React, { useState, useEffect } from "react";
import { getCachedMediaUrl } from "../utils/mediaCache";

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
}

/**
 * CachedImage component
 * Loads the image from the browser's persistent CacheStorage API / Blob cache.
 * Eliminates redundant network requests to CloudFront CDN on page reloads.
 */
export const CachedImage: React.FC<CachedImageProps> = ({
  src,
  fallbackSrc,
  alt = "",
  className = "",
  ...props
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>(src || "");

  useEffect(() => {
    if (!src) {
      setResolvedSrc("");
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
      className={className}
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
