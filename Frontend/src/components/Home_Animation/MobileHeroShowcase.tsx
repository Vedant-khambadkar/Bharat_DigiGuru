import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import DigitalMediaImg1 from "../../assets/DigitalMedia/DigitalMedia-1.webp";
import pic4 from "../../assets/Picture/Picture4.webp";
import pic7 from "../../assets/Picture/Picture7.webp";
import pic10 from "../../assets/Picture/Picture10.webp";
import pic13 from "../../assets/Picture/Picture13.webp";
import pic3 from "../../assets/Picture/Picture3.webp";
import vignetteBg from "../../assets/Minimalist Black and White Vignette  mobile.webp";
import { userService } from "../../services/service/userService";
import { onSocketEvent } from "../../utils/socket";

interface MobileHeroShowcaseProps {
  onReady?: () => void;
}

interface ServiceTab {
  id: string;
  label: string;
  image: string;
  targetSection: string;
}

const DEFAULT_SERVICE_TABS: ServiceTab[] = [
  { id: "digital-media-services", label: "Digital Media", image: DigitalMediaImg1, targetSection: "services-section" },
  { id: "photography-services", label: "Photography", image: pic4, targetSection: "services-section" },
  { id: "videography-services", label: "Videography", image: pic7, targetSection: "services-section" },
  { id: "content-generation", label: "Content Generation", image: pic10, targetSection: "services-section" },
  { id: "ai-art-generation", label: "Art Generation", image: pic13, targetSection: "services-section" },
  { id: "ai-video-generation", label: "AI Video", image: pic3, targetSection: "services-section" },
];

const formatLabel = (rawTitle: string): string => {
  if (!rawTitle) return "";
  const cleaned = rawTitle
    .replace(/\s+Services\b/gi, "")
    .trim();
  return cleaned || rawTitle;
};

export const MobileHeroShowcase: React.FC<MobileHeroShowcaseProps> = ({ onReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tabs, setTabs] = useState<ServiceTab[]>(DEFAULT_SERVICE_TABS);
  const [activeTabId, setActiveTabId] = useState<string>(DEFAULT_SERVICE_TABS[0].id);
  const [isPressed, setIsPressed] = useState<boolean>(false);

  // Notify parent of readiness
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  // Load dynamic services from website API/database with fallback
  useEffect(() => {
    let isMounted = true;

    const fetchLiveServices = async () => {
      try {
        const data = await userService.getServices();
        const items = Array.isArray(data) ? data : data?.items || [];
        if (isMounted && Array.isArray(items) && items.length > 0) {
          const mappedTabs: ServiceTab[] = items.map((item: any, idx: number) => {
            const fallbackTab = DEFAULT_SERVICE_TABS[idx] || DEFAULT_SERVICE_TABS[0];
            return {
              id: item.id || `service-${idx}`,
              label: formatLabel(item.title || fallbackTab.label),
              image: item.image || fallbackTab.image,
              targetSection: "services-section",
            };
          });
          setTabs(mappedTabs);
          if (mappedTabs.length > 0 && !mappedTabs.some(t => t.id === activeTabId)) {
            setActiveTabId(mappedTabs[0].id);
          }
        }
      } catch (err) {
        console.warn("[MobileHeroShowcase] Using fallback services:", err);
      }
    };

    fetchLiveServices();

    // Listen for live admin updates via socket
    const cleanupSocket = onSocketEvent("service:updated", () => {
      fetchLiveServices();
    });

    return () => {
      isMounted = false;
      cleanupSocket?.();
    };
  }, []);

  // Entrance animations via GSAP
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Hero image entrance
      gsap.fromTo(
        ".studio-hero-card",
        { opacity: 0, scale: 0.97, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.85, ease: "power3.out", delay: 0.1 }
      );

      // Service tags stagger
      gsap.fromTo(
        ".studio-service-tab",
        { opacity: 0, x: 12 },
        { opacity: 1, x: 0, duration: 0.55, ease: "power2.out", stagger: 0.05, delay: 0.25 }
      );

      // Massive Studio bottom typography impact
      gsap.fromTo(
        ".studio-bottom-title",
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.35 }
      );
    }, el);

    return () => ctx.revert();
  }, [tabs]);

  const handleTabClick = (tab: ServiceTab) => {
    setActiveTabId(tab.id);
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100svh] bg-[#070709] text-white overflow-hidden flex flex-col justify-between pt-20 sm:pt-24 pb-24 sm:pb-28 px-4 sm:px-6 select-none"
    >
      {/* Subtle Atmospheric Vignette Backdrop (Studio Theme) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15 bg-cover bg-center mix-blend-screen"
        style={{ backgroundImage: `url(${vignetteBg})` }}
      />
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-0" />

      {/* =========================================================================
          1. CENTER SECTION: RESPECTIVE HERO IMAGE CARD & RIGHT-ALIGNED CATEGORIES
         ========================================================================= */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col gap-3 my-auto">
        {/* Respective Visual Showcase Card */}
        <div
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
          className={`studio-hero-card relative w-full aspect-[16/9.8] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 shadow-[0_20px_60px_rgba(0,0,0,0.85)] transition-transform duration-500 ease-out ${
            isPressed ? "scale-[0.988]" : "scale-100"
          }`}
        >
          {/* Dynamic Image with Smooth Cross-Fade */}
          {tabs.map((tab) => {
            const isSelected = tab.id === activeTabId;
            return (
              <img
                key={tab.id}
                src={tab.image}
                alt={`${tab.label} Signature Showcase`}
                loading="eager"
                decoding="async"
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-600 ease-out ${
                  isSelected ? "opacity-100 scale-100 z-10" : "opacity-0 scale-[1.02] z-0 pointer-events-none"
                }`}
              />
            );
          })}

          {/* Subtle Studio Lighting Highlight & Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none z-20" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl sm:rounded-2xl pointer-events-none z-20" />
        </div>

        {/* Right-Aligned Categories List From Website (Digital Media, Photography, Videography, Content Generation, Art Generation, AI Video) */}
        <div className="w-full flex justify-end pr-0.5 pt-1">
          <div className="flex flex-col items-end gap-1">
            {tabs.map((tab) => {
              const isActive = activeTabId === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`studio-service-tab text-right transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "text-white font-bold text-[15px] sm:text-base tracking-tight font-['Inter',sans-serif] drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]"
                      : "text-neutral-400 hover:text-neutral-200 font-normal text-[13px] sm:text-sm tracking-normal font-['Inter',sans-serif]"
                  }`}
                  aria-pressed={isActive}
                  title={`View ${tab.label} Showcase`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. BOTTOM SIGNATURE TYPOGRAPHY: Massive "Studio⁹⁹" (Above Bottom Dock)
         ========================================================================= */}
      <footer className="relative z-10 w-full max-w-lg mx-auto pt-2 flex flex-col">
        <div className="studio-bottom-title w-full flex items-start justify-between overflow-hidden">
          {/* Edge-to-Edge Bold "Studio" in Title Case */}
          <h1 className="font-['Archivo_Black',sans-serif] text-[clamp(4.2rem,21vw,7.8rem)] leading-[0.8] tracking-tighter text-white select-none pointer-events-none whitespace-nowrap">
            Studio
          </h1>

          {/* Superscript 99 placed at top-right of lowercase "o" */}
          <span className="font-['Archivo_Black',sans-serif] text-[clamp(1.4rem,6.8vw,2.7rem)] leading-[0.8] text-white font-bold tracking-tight select-none pointer-events-none pt-0.5 sm:pt-1">
            99
          </span>
        </div>
      </footer>
    </section>
  );
};

export default MobileHeroShowcase;
