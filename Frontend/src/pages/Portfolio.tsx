import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SkinnedPlane, { type PlaneItem, type SkinnedPlaneIntroState } from "../components/SkinnedPlane";
import { userService } from "../services/service/userService";
import { onSocketEvent } from "../utils/socket";

import MobilePortfolioDeck from "../components/Portfolio/MobilePortfolioDeck";
import { useResponsiveTier } from "../hooks/useResponsiveTier";
import { backendUrl } from "../utils/constants";
import { getApiCache } from "../utils/apiCache";

gsap.registerPlugin(ScrollTrigger);

// Helper to resolve full image URLs across local development and mobile network IP
const getFullUrl = (url?: string): string => {
  if (!url || typeof url !== "string") return "";
  let trimmed = url.trim();
  if (!trimmed) return "";

  // Adapt localhost to active LAN hostname for mobile devices
  if (typeof window !== "undefined" && window.location.hostname && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    trimmed = trimmed.replace("localhost:5000", `${window.location.hostname}:5000`).replace("127.0.0.1:5000", `${window.location.hostname}:5000`);
  }

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
  const base = backendUrl;
  const cleanUrl = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${cleanUrl}`;
};

// Helper to format backend portfolio records to PlaneItem structure
const formatPortfolioItem = (item: any, index: number): PlaneItem => {
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

export const Portfolio: React.FC = () => {
  const [planes, setPlanes] = useState<PlaneItem[]>(() => {
    const cached = getApiCache<any[]>("portfolio_items");
    if (Array.isArray(cached) && cached.length > 0) {
      return cached.map((item, idx) => formatPortfolioItem(item, idx));
    }
    return [];
  });
  const [selectedPlane, setSelectedPlane] = useState<PlaneItem | null>(() => {
    const cached = getApiCache<any[]>("portfolio_items");
    if (Array.isArray(cached) && cached.length > 0) {
      return formatPortfolioItem(cached[0], 0);
    }
    return null;
  });
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(() => planes.length === 0);
  const sectionRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const introAnimRef = useRef<SkinnedPlaneIntroState>({
    y: -4.2,
    rotation: Math.PI * 0.75,
    scale: 0.5,
  });
  const { shouldRenderPortfolio3D, isMobile, maxDpr } = useResponsiveTier();
  const [mobile3DMode, setMobile3DMode] = useState<boolean>(false);

  // 1. Fetch Dynamic Portfolio directly from API / Database with graceful fallback
  useEffect(() => {
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
          const formatted = rawItems.map(formatPortfolioItem);
          setPlanes(formatted);
          setSelectedPlane(formatted[0]);
        }
      } catch (err) {
        console.warn("Could not fetch database portfolio, using default portfolio items:", err);
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
        if (!selectedPlane) setSelectedPlane(formatted);
        return updated;
      });
    });

    const unsubscribeUpdate = onSocketEvent("portfolio:updated", (updatedCard: any) => {
      if (!updatedCard) return;
      setPlanes((prev) =>
        prev.map((p, idx) =>
          String(p.id) === String(updatedCard.id || updatedCard._id)
            ? formatPortfolioItem(updatedCard, idx)
            : p
        )
      );
      setSelectedPlane((current) =>
        current && String(current.id) === String(updatedCard.id || updatedCard._id)
          ? formatPortfolioItem(updatedCard, 0)
          : current
      );
    });

    const unsubscribeDelete = onSocketEvent("portfolio:deleted", (deletedId: any) => {
      setPlanes((prev) => {
        const filtered = prev.filter((p) => String(p.id) !== String(deletedId));
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

  const [isSectionVisible, setIsSectionVisible] = useState<boolean>(false);

  // IntersectionObserver to pause 3D Canvas WebGL rendering when Portfolio is offscreen (3D mode only)
  useEffect(() => {
    if (!shouldRenderPortfolio3D && !mobile3DMode) return;
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
  }, [shouldRenderPortfolio3D, mobile3DMode]);

  // GSAP ScrollTrigger Pin: Stay pinned on this section while rotating geometry 360 degrees (Desktop or Opt-in 3D)
  useEffect(() => {
    if (!shouldRenderPortfolio3D && !mobile3DMode) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: isMobile ? "+=1000" : "+=2200", // Responsive pinning distance for mobile touch
        pin: true,
        pinSpacing: true,
        scrub: isMobile ? 0.35 : 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${self.progress * 100}%`;
          }
        },
      });

      // 3D Card Canvas Entrance Animation using GSAP ScrollTrigger:
      // When reaching this section: animates from bottom to center with rotation and from scale 0.5 to 1.0
      gsap.fromTo(
        introAnimRef.current,
        {
          y: -6.2,
          rotation: Math.PI * 6.75,
          scale: 0,
        },
        {
          y: 0,
          rotation: 0,
          scale: 1,
          delay:0.5,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Smooth opacity fade-in for 3D Canvas container
      if (canvasContainerRef.current) {
        gsap.fromTo(
          canvasContainerRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1.0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Entrance animation for header and branding labels
      gsap.fromTo(
        [".portfolio-header-text", ".portfolio-tagline-text", ".portfolio-desc-text"],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [shouldRenderPortfolio3D, mobile3DMode, isMobile]);

  return (
    <section
      ref={sectionRef}
      id="portfolio-section"
      className="relative w-full min-h-[100svh] md:h-screen md:min-h-[640px] overflow-x-clip md:overflow-hidden  text-white font-['DM_Sans'] select-none"
    >
      {/* Mobile Experience: Dedicated, Responsive Card Deck */}
      {!shouldRenderPortfolio3D && !mobile3DMode ? (
        <MobilePortfolioDeck
          planes={planes}
          selectedPlane={selectedPlane}
          onSelectPlane={setSelectedPlane}
          onEnable3D={() => setMobile3DMode(true)}
          is3DActive={false}
        />
      ) : (
        <>
          {/* 1. Upper Left Section: PORTFOLIO Header */}
          <div className="portfolio-header-text absolute top-16 sm:top-20 md:top-[110px] lg:top-[125px] left-4 sm:left-8 md:left-12 z-10 pointer-events-none select-none">
            <div className="font-['DM_Sans'] text-5xl md:text-6xl font-bold leading-[0.88] tracking-wider text-white m-0 uppercase">
              PORTFOLIO
            </div>
          </div>

          {/* 2. Upper Right Section & Mobile Switch Button */}
          <div className="absolute top-16 sm:top-20 md:top-[110px] lg:top-[225px] right-4 sm:right-8 md:right-12 z-20 flex flex-col items-end gap-2">
            {isMobile && mobile3DMode && (
              <button
                onClick={() => setMobile3DMode(false)}
                className="pointer-events-auto px-3 py-1 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-['DM_Sans'] text-white uppercase tracking-wider shadow-lg active:scale-95 transition-all"
              >
                ← BACK TO CARDS
              </button>
            )}
            <div className="portfolio-tagline-text hidden md:block max-w-[280px] sm:max-w-[320px] lg:max-w-[360px] text-right pointer-events-none select-none">
              <h2 className="font-['DM_Sans'] text-sm sm:text-base md:text-lg lg:text-[20px] font-normal leading-snug tracking-wide m-0 text-stone-200 uppercase">
                Shaping Your Vision
                <br />
                Into Immersive Reality.
              </h2>
            </div>
          </div>

          {/* 3. Center 3D Interactive SkinnedMesh Carousel */}
          <div
            ref={canvasContainerRef}
            className="portfolio-canvas-container absolute inset-0 z-[1] will-change-transform"
          >
            {planes.length > 0 ? (
              <Canvas
                frameloop={isSectionVisible ? "always" : "never"}
                dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, maxDpr)]}
                gl={{
                  antialias: !isMobile,
                  alpha: true,
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
                  introStateRef={introAnimRef}
                />
              </Canvas>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 pointer-events-none">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
                    <span className="text-xs font-['DM_Sans'] uppercase tracking-widest text-neutral-400">Loading Portfolio...</span>
                  </div>
                ) : (
                  <div className="text-stone-500 text-sm font-['DM_Sans'] uppercase tracking-widest">
                    No portfolio items available in the database.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Bottom Left Responsive Statement Branding */}
          <div className="portfolio-desc-text hidden md:flex absolute bottom-0 left-4 sm:left-8 md:left-12 pb-3 sm:pb-4 md:pb-6 max-w-[calc(100vw-2rem)] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[390px] flex-col items-start gap-1 sm:gap-1.5 z-10 pointer-events-none select-none font-['DM_Sans']">
            <h1 className="font-['DM_Sans'] text-xs sm:text-sm md:text-base lg:text-lg xl:text-[20px] font-normal leading-[1.25] tracking-wider text-white uppercase m-0">
              Crafting Digital
              <br />
              Experiences That Speak.
            </h1>
            <p className="font-['DM_Sans'] text-[9px] sm:text-[10px] md:text-[11px] lg:text-xs leading-relaxed text-stone-300 m-0 tracking-[0.01em]">
              At Bharat DigiGuru, we engineer photorealistic 3D CGI, immersive visual media, and next-generation interactive architectures tailored for world-class enterprises.
            </p>
          </div>
        </>
      )} 
    </section>
  );
};

export const preloadPortfolioAssets = async (): Promise<void> => {
  try {
    const res = await userService.getPortfolio();
    if (res && res.data) {
      const items = Array.isArray(res.data) ? res.data : (res.data as any).items || [];
      const urls = items
        .map((it: any) => it.image || it.imageUrl || it.textureUrl || it.posterUrl)
        .filter(Boolean);
      await Promise.all(
        urls.map(
          (u: string) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = u;
            })
        )
      );
    }
  } catch (_e) {
    // Non-blocking preloading
  }
};

export default Portfolio;