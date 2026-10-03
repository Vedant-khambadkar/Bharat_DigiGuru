import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SkinnedPlane, { type PlaneItem, preloadSkinnedTexture } from "../components/SkinnedPlane";
import Portfolio3DLoader from "../components/Portfolio3DLoader";
import { userService } from "../services/service/userService";
import { onSocketEvent } from "../utils/socket";
import { getApiCache, setApiCache } from "../utils/apiCache";

gsap.registerPlugin(ScrollTrigger);

// Helper to resolve full image URLs
export const getFullUrl = (url?: string): string => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  const cdnBase = import.meta.env.VITE_CLOUDFRONT_URL;
  if (cdnBase && (trimmed.startsWith("uploads/") || trimmed.startsWith("/uploads/"))) {
    const cleanKey = trimmed.replace(/^\/+/, "");
    return `${cdnBase.replace(/\/+$/, "")}/${cleanKey}`;
  }
  const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const cleanUrl = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${cleanUrl}`;
};

// Helper to format backend portfolio records to PlaneItem structure
export const formatPortfolioItem = (item: any, index: number): PlaneItem => {
  const rawImg = item.image || item.imageUrl || item.textureUrl || item.posterUrl || "";
  const imgUrl = getFullUrl(rawImg);

  return {
    id: item.id || item._id || index + 1,
    title: item.title || `Project 0${index + 1}`,
    category: item.category || item.subtitle || "3D CGI & ArchViz",
    textureUrl: imgUrl,
    color: item.color || "#6c8ebb",
  };
};

/**
 * Background preloader function: fetches portfolio items & pre-decodes Three.js textures in memory
 */
export const preloadPortfolioAssets = async (): Promise<PlaneItem[]> => {
  try {
    const cached = getApiCache<PlaneItem[]>("portfolio_items");
    if (cached && cached.length > 0) {
      // 0ms Cache Hit: Preload textures into Three.js memory cache directly without DB request
      cached.forEach((item) => {
        if (item.textureUrl) {
          preloadSkinnedTexture(item.textureUrl).catch(() => { });
        }
      });
      return cached;
    }

    const res = await userService.getPortfolio();
    const rawItems = Array.isArray(res)
      ? res
      : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
          ? res.data
          : [];

    const formatted: PlaneItem[] = rawItems.map(formatPortfolioItem);
    if (formatted.length > 0) {
      setApiCache("portfolio_items", formatted);
      // Preload Three.js textures in parallel in background memory
      formatted.forEach((item) => {
        if (item.textureUrl) {
          preloadSkinnedTexture(item.textureUrl).catch(() => { });
        }
      });
    }
    return formatted;
  } catch (err) {
    console.warn("Background portfolio preload error:", err);
    return [];
  }
};

export const Portfolio: React.FC = () => {
  const [planes, setPlanes] = useState<PlaneItem[]>(() => {
    const cached = getApiCache<PlaneItem[]>("portfolio_items");
    return cached && cached.length > 0 ? cached : [];
  });
  const [selectedPlane, setSelectedPlane] = useState<PlaneItem | null>(() => {
    const cached = getApiCache<PlaneItem[]>("portfolio_items");
    return cached && cached.length > 0 ? cached[0] : null;
  });
  const scrollProgressRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const cached = getApiCache<PlaneItem[]>("portfolio_items");
    return !(cached && cached.length > 0);
  });
  const [is3DReady, setIs3DReady] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleReady = React.useCallback(() => {
    setIs3DReady(true);
  }, []);

  const handleSelectPlane = React.useCallback((plane: PlaneItem) => {
    setSelectedPlane(plane);
  }, []);

  // Fetch Dynamic Portfolio directly from API / Database (with Cache Sync)
  useEffect(() => {
    const fetchPortfolioData = async () => {
      const cached = getApiCache<PlaneItem[]>("portfolio_items");
      if (cached && cached.length > 0) {
        setPlanes(cached);
        setIsLoading(false);
        cached.forEach((item) => {
          if (item.textureUrl) {
            preloadSkinnedTexture(item.textureUrl).catch(() => { });
          }
        });
        return; // Zero network call on page reload!
      }

      try {
        const res = await userService.getPortfolio();
        const rawItems = Array.isArray(res)
          ? res
          : Array.isArray(res?.items)
            ? res.items
            : Array.isArray(res?.data)
              ? res.data
              : [];

        const formatted: PlaneItem[] = rawItems.map(formatPortfolioItem);
        setPlanes(formatted);
        setApiCache("portfolio_items", formatted);

        // Preload any un-cached textures
        formatted.forEach((item) => {
          if (item.textureUrl) {
            preloadSkinnedTexture(item.textureUrl).catch(() => { });
          }
        });

        if (formatted.length > 0) {
          setSelectedPlane((current) => {
            if (current) {
              const matched = formatted.find((f: PlaneItem) => String(f.id) === String(current.id));
              return matched || formatted[0];
            }
            return formatted[0];
          });
        } else {
          setSelectedPlane(null);
        }
      } catch (err) {
        console.error("Error fetching database portfolio:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();

    // 2. Real-time Live Sync via WebSockets (Admin Dashboard Updates)
    const unsubscribeCreate = onSocketEvent("portfolio:created", (newCard: any) => {
      if (!newCard) return;
      setPlanes((prev) => {
        const formatted = formatPortfolioItem(newCard, prev.length);
        const exists = prev.some((p) => String(p.id) === String(formatted.id));
        if (exists) return prev;
        const updated = [formatted, ...prev];
        setApiCache("portfolio_items", updated);
        if (!selectedPlane) setSelectedPlane(formatted);
        return updated;
      });
    });

    const unsubscribeUpdate = onSocketEvent("portfolio:updated", (updatedCard: any) => {
      if (!updatedCard) return;
      setPlanes((prev) => {
        const updated = prev.map((p, idx) =>
          String(p.id) === String(updatedCard.id || updatedCard._id)
            ? formatPortfolioItem(updatedCard, idx)
            : p
        );
        setApiCache("portfolio_items", updated);
        return updated;
      });
      setSelectedPlane((current) =>
        current && String(current.id) === String(updatedCard.id || updatedCard._id)
          ? formatPortfolioItem(updatedCard, 0)
          : current
      );
    });

    const unsubscribeDelete = onSocketEvent("portfolio:deleted", (deletedId: any) => {
      setPlanes((prev) => {
        const filtered = prev.filter((p) => String(p.id) !== String(deletedId));
        setApiCache("portfolio_items", filtered);
        return filtered;
      });
      setSelectedPlane((current) => {
        if (current && String(current.id) === String(deletedId)) {
          return null;
        }
        return current;
      });
    });

    return () => {
      unsubscribeCreate();
      unsubscribeUpdate();
      unsubscribeDelete();
    };
  }, []);

  // GSAP ScrollTrigger Pin: Stay pinned on this section while rotating geometry 360 degrees
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=2200", // Distance user scrolls through while viewing the full 360° rotation
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        anticipatePin: 1,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scrollProgressRef.current = self.progress;
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${self.progress * 100}%`;
          }
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="portfolio-section"
      className="relative w-full h-screen min-h-[640px] overflow-hidden bg-transparent text-white font-['Italiana','Cormorant_Garamond',serif] select-none"
    >
      {/* Background Subtle Dot-Matrix Texture matching MissionVision */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15 z-0"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.22) 1.25px, transparent 1.25px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top Soft Fade Gradient for Seamless Section Blend */}
      <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#050505] via-[#050505]/75 to-transparent pointer-events-none z-10" />

      {/* 360° Rotation Progress Glowing Wire */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-30 pointer-events-none overflow-hidden">
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-[#ff2d55] via-[#ff3b30] to-[#ff6b00] shadow-[0_0_12px_rgba(255,59,48,0.9)] transition-all duration-75 ease-out"
          style={{ width: "0%" }}
        />
      </div>

      {/* 1. Upper Left Section: Giant PORTFOLIO Title */}
      <div className="absolute top-12 sm:top-16 md:top-20 left-4 sm:left-8 md:left-12 z-10 pointer-events-none flex items-start">
        <h1 className="font-neuropol text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-none tracking-wider text-white m-0 uppercase select-none">
          PORTFOLIO
        </h1>
      </div>

      {/* 2. Upper Right Section */}
      <div className="hidden lg:block absolute top-12 sm:top-16 md:top-20 right-12 max-w-[360px] text-right z-10 pointer-events-none">
        <h2 className="font-neuropol text-xl lg:text-[22px] font-normal leading-snug tracking-wide m-0 text-stone-200 uppercase">
          Shaping Your Vision
          <br />
          Into Immersive Reality.
        </h2>
      </div>

      {/* 3. Bottom Left Section: Descriptive Data */}
      <div className="absolute bottom-6 sm:bottom-8 md:bottom-12 left-4 sm:left-8 md:left-12 max-w-[280px] sm:max-w-[340px] md:max-w-[400px] z-10 pointer-events-none flex flex-col gap-1.5 sm:gap-2.5">
        <h2 className="font-neuropol text-base sm:text-xl md:text-2xl font-normal leading-[1.2] tracking-wide text-white uppercase m-0">
          Crafting Digital
          <br />
          Experiences That Speak.
        </h2>
        <p className="text-[10.5px] sm:text-xs md:text-[13px] leading-relaxed text-stone-300 m-0 tracking-[0.01em]">
          At Bharat DigiGuru, we engineer photorealistic 3D CGI, immersive visual media, and next-generation interactive architectures tailored for world-class enterprises.
        </p>
      </div>

      {/* 3. Center 3D Interactive SkinnedMesh Carousel */}
      <div className="absolute inset-0 z-[1]">
        {/* Futuristic 3D Model Animated Loader HUD */}
        {(!is3DReady || isLoading) && (
          <Portfolio3DLoader
            className={`transition-opacity duration-700 ${is3DReady ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
          />
        )}

        {planes.length > 0 ? (
          <Canvas
            camera={{
              position: [0, 0.4, 8.8],
              fov: 46,
              near: 0.1,
              far: 100,
            }}
          >
            {/* Dark Background matching website */}
            <color attach="background" args={["#050505"]} />

            {/* Crisp Studio Lights */}
            <ambientLight intensity={2.2} />
            <directionalLight position={[6, 8, 5]} intensity={2.5} color="#ffffff" />
            <directionalLight
              position={[-5, -4, -4]}
              intensity={1.4}
              color="#ffd8c2"
            />

            <SkinnedPlane
              planes={planes}
              selectedId={selectedPlane?.id}
              scrollProgressRef={scrollProgressRef}
              onSelectPlane={handleSelectPlane}
              onReady={handleReady}
            />
          </Canvas>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 pointer-events-none">
            {!isLoading && (
              <div className="text-stone-500 text-sm font-mono uppercase tracking-widest">
                No portfolio items available in the database.
              </div>
            )}
          </div>
        )}
      </div>

    </section>
  );
};

export default Portfolio;
