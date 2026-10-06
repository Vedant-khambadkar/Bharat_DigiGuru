import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SkinnedPlane, { type PlaneItem } from "../components/SkinnedPlane";
import { userService } from "../services/service/userService";
import { onSocketEvent } from "../utils/socket";
import { getApiCache, setApiCache } from "../utils/apiCache";
import { preloadMediaList } from "../utils/mediaCache";

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

export const DEFAULT_PORTFOLIO_ITEMS: PlaneItem[] = [
  {
    id: "def-1",
    title: "Cybernetic Architecture",
    category: "3D CGI & ArchViz",
    textureUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    color: "#6c8ebb",
  },
  {
    id: "def-2",
    title: "Hyper-Real Automotive",
    category: "CGI Automotive",
    textureUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80",
    color: "#bb6c8e",
  },
  {
    id: "def-3",
    title: "Spatial Environment",
    category: "Virtual Reality",
    textureUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80",
    color: "#8ebb6c",
  },
  {
    id: "def-4",
    title: "Industrial Innovation",
    category: "Product Visualization",
    textureUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    color: "#e09050",
  },
  {
    id: "def-5",
    title: "Ethereal Worlds",
    category: "Immersive Experiences",
    textureUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    color: "#5080e0",
  },
];

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
 * Preload initial Portfolio metadata and only the active texture without saturating bandwidth
 */
export const preloadPortfolioAssets = async (): Promise<PlaneItem[]> => {
  try {
    let items: PlaneItem[] = [];
    const cached = getApiCache<PlaneItem[]>("portfolio_items");
    if (cached && cached.length > 0) {
      items = cached;
    } else {
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
        if (formatted.length > 0) {
          setApiCache("portfolio_items", formatted);
          items = formatted;
        }
      } catch (err) {
        console.warn("Portfolio API fetch notice during preload:", err);
      }
    }
    if (items.length === 0) {
      items = DEFAULT_PORTFOLIO_ITEMS;
    }
    // Only pre-warm the primary active texture, deferring remaining textures
    if (items[0]?.textureUrl) {
      preloadMediaList([items[0].textureUrl], { priority: "low", concurrency: 1 });
    }
    return items;
  } catch (err) {
    console.warn("Portfolio preload notice:", err);
    return DEFAULT_PORTFOLIO_ITEMS;
  }
};

/**
 * Progressive texture loading strategy:
 * Priority 1: Current active texture
 * Priority 2: Immediately adjacent neighbor textures
 * Priority 3: Remaining textures loaded during browser idle time
 */
const preloadProgressivePortfolio = (items: PlaneItem[], activeIndex = 0) => {
  if (!items || items.length === 0) return;
  const len = items.length;

  // Priority 1: Active texture
  const activeUrl = items[activeIndex]?.textureUrl;
  if (activeUrl) {
    preloadMediaList([activeUrl], { priority: "high", concurrency: 1 });
  }

  // Priority 2: Immediate carousel neighbors
  const prevIdx = (activeIndex - 1 + len) % len;
  const nextIdx = (activeIndex + 1) % len;
  const neighbors = [items[prevIdx]?.textureUrl, items[nextIdx]?.textureUrl].filter(Boolean);
  if (neighbors.length > 0) {
    preloadMediaList(neighbors, { priority: "low", concurrency: 2 });
  }

  // Priority 3: Remaining textures during browser idle time
  const remaining = items
    .filter((_, idx) => idx !== activeIndex && idx !== prevIdx && idx !== nextIdx)
    .map((p) => p.textureUrl)
    .filter(Boolean);
  if (remaining.length > 0) {
    preloadMediaList(remaining, { priority: "idle", concurrency: 2 });
  }
};

export const Portfolio: React.FC = () => {
  const [planes, setPlanes] = useState<PlaneItem[]>(() => {
    const cached = getApiCache<PlaneItem[]>("portfolio_items");
    return cached && cached.length > 0 ? cached : DEFAULT_PORTFOLIO_ITEMS;
  });
  const [selectedPlane, setSelectedPlane] = useState<PlaneItem | null>(() => {
    const cached = getApiCache<PlaneItem[]>("portfolio_items");
    return cached && cached.length > 0 ? cached[0] : DEFAULT_PORTFOLIO_ITEMS[0];
  });
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const sectionRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Dynamic Portfolio directly from API / Database (with Cache Sync)
  useEffect(() => {
    // Progressively pre-cache starting with active item and neighbors
    if (planes.length > 0) {
      preloadProgressivePortfolio(planes, 0);
    }

    const fetchPortfolioData = async () => {
      try {
        const res = await userService.getPortfolio();
        const rawItems = Array.isArray(res)
          ? res
          : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.data)
          ? res.data
          : [];

        if (rawItems.length > 0) {
          const formatted: PlaneItem[] = rawItems.map(formatPortfolioItem);
          setPlanes(formatted);
          setApiCache("portfolio_items", formatted);
          preloadProgressivePortfolio(formatted, 0);

          setSelectedPlane((current) => {
            if (current) {
              const matched = formatted.find((f: PlaneItem) => String(f.id) === String(current.id));
              return matched || formatted[0];
            }
            return formatted[0];
          });
        }
      } catch (err) {
        console.error("Error fetching database portfolio:", err);
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
        preloadMediaList([formatted.textureUrl], { priority: "low" });
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
        const updatedItem = formatPortfolioItem(updatedCard, 0);
        preloadMediaList([updatedItem.textureUrl], { priority: "low" });
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

  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;

  // IntersectionObserver to pause Portfolio 3D canvas when offscreen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting);
      },
      { rootMargin: "150px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
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
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
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
      className="relative w-full h-screen min-h-[640px] overflow-hidden bg-[#050505] text-white font-['Italiana','Cormorant_Garamond',serif] select-none"
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

      {/* 1. Upper Left Section */}
      <div className="absolute top-16 sm:top-20 md:top-[125px] left-4 sm:left-8 md:left-12 max-w-[270px] sm:max-w-[340px] md:max-w-[380px] z-10 pointer-events-none">
        <h1 className="font-neuropol text-lg sm:text-2xl md:text-[32px] font-normal leading-[1.2] tracking-wide mb-1.5 sm:mb-3 text-white uppercase">
          Crafting Digital
          <br />
          Experiences That Speak.
        </h1>
        <p className="text-[10.5px] sm:text-xs md:text-[13px] leading-relaxed text-stone-300 m-0 tracking-[0.01em]">
          At Bharat DigiGuru, we engineer photorealistic 3D CGI, immersive visual media, and next-generation interactive architectures tailored for world-class enterprises.
        </p>
      </div>

      {/* 2. Upper Right Section */}
      <div className="hidden lg:block absolute top-[125px] right-12 max-w-[360px] text-right z-10 pointer-events-none">
        <h2 className="font-neuropol text-xl lg:text-[22px] font-normal leading-snug tracking-wide m-0 text-stone-200 uppercase">
          Shaping Your Vision
          <br />
          Into Immersive Reality.
        </h2>
      </div>

      {/* 3. Center 3D Interactive SkinnedMesh Carousel */}
      <div className="absolute inset-0 z-[1] touch-pan-y">
        <Canvas
          frameloop={isSectionVisible ? "always" : "never"}
          dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, isMobile ? 1.15 : 1.5)]}
          gl={{
            antialias: !isMobile,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false,
          }}
          camera={{
            position: [0, 0.4, 8.8],
            fov: 46,
            near: 0.1,
            far: 100,
          }}
          style={{ touchAction: "pan-y" }}
          className="w-full h-full block touch-pan-y"
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
            scrollProgress={scrollProgress}
            onSelectPlane={setSelectedPlane}
          />
        </Canvas>
      </div>

      {/* 4. Bottom Left Display Branding */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-9 left-4 sm:left-8 md:left-12 flex items-end gap-3.5 z-10 pointer-events-none">
        <div className="font-neuropol text-6xl font-normal leading-[0.88] tracking-wider text-white m-0 uppercase select-none">
          PORTFOLIO
        </div>
      </div>
    </section>
  );
};

export default Portfolio;