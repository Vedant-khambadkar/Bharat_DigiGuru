import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const SOCIAL_PLATFORMS = {
  instagram: {
    name: "Instagram",
    url: "https://www.instagram.com/banarasi_chap/",
  },
  linkedin: {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/shubhsingh04/",
  },
  youtube: {
    name: "YouTube",
    url: "https://www.youtube.com/@banarasichap",
  },
  x: {
    name: "X (Twitter)",
    url: "https://x.com",
  },
  tiktok: {
    name: "TikTok",
    url: "https://www.tiktok.com",
  },
  pinterest: {
    name: "Pinterest",
    url: "https://www.pinterest.com",
  },
  facebook: {
    name: "Facebook",
    url: "https://www.facebook.com/banarasichap",
  },
};

export const PlatformsWeManage: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const chaosRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to pause all CSS animations when section is offscreen (zero React re-renders)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in-view");
        } else {
          el.classList.remove("is-in-view");
        }
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // GSAP entrance animation with scoped context cleanup
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".chaos-header",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: chaosRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        ".floating-3d-node",
        { opacity: 0, scale: 0.6, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "back.out(1.6)",
          scrollTrigger: {
            trigger: chaosRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const setHoverPlatform = (platform: string | null) => {
    if (!containerRef.current) return;
    if (platform) {
      containerRef.current.setAttribute("data-active-platform", platform);
    } else {
      containerRef.current.removeAttribute("data-active-platform");
    }
  };

  return (
    <section
      ref={containerRef}
      id="platforms-we-manage-section"
      className="relative w-full bg-transparent text-white font-neuropol overflow-hidden select-none py-16 sm:py-24 md:py-32"
    >
      {/* =========================================================================
          1. HIGH-PERFORMANCE AMBIENT BACKDROP (Single layer GPU gradient via CSS)
         ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="platform-ambient-glow absolute inset-0 opacity-40 transition-all duration-700 pointer-events-none" />
      </div>

      {/* Subtle Dot-Matrix Texture Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15 z-0"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.22) 1.25px, transparent 1.25px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Hardware-Accelerated 60/120 FPS CSS Keyframes using translate3d & opacity only */}
      <style>{`
        @keyframes floatOrbital1 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -9px, 0); }
        }
        @keyframes floatOrbital2 {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, 9px, 0); }
        }
        @keyframes pulseGlowRing {
          0%, 100% { opacity: 0.25; transform: translate3d(0,0,0) scale(1); }
          50% { opacity: 0.5; transform: translate3d(0,0,0) scale(1.02); }
        }

        /* Default ambient background */
        #platforms-we-manage-section .platform-ambient-glow {
          background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, rgba(4, 106, 56, 0.06) 45%, transparent 70%);
        }
        #platforms-we-manage-section[data-active-platform="instagram"] .platform-ambient-glow {
          background: radial-gradient(circle at 35% 30%, rgba(225, 48, 108, 0.15) 0%, transparent 60%);
        }
        #platforms-we-manage-section[data-active-platform="linkedin"] .platform-ambient-glow {
          background: radial-gradient(circle at 65% 30%, rgba(10, 102, 194, 0.15) 0%, transparent 60%);
        }
        #platforms-we-manage-section[data-active-platform="youtube"] .platform-ambient-glow {
          background: radial-gradient(circle at 75% 40%, rgba(255, 0, 0, 0.15) 0%, transparent 60%);
        }
        #platforms-we-manage-section[data-active-platform="tiktok"] .platform-ambient-glow {
          background: radial-gradient(circle at 80% 50%, rgba(37, 244, 238, 0.15) 0%, transparent 60%);
        }
        #platforms-we-manage-section[data-active-platform="facebook"] .platform-ambient-glow {
          background: radial-gradient(circle at 30% 70%, rgba(24, 119, 242, 0.15) 0%, transparent 60%);
        }

        .animate-float-1,
        .animate-float-2,
        .animate-pulse-ring {
          animation-play-state: paused;
          transform: translateZ(0);
        }

        #platforms-we-manage-section.is-in-view .animate-float-1 {
          animation: floatOrbital1 4.8s ease-in-out infinite;
          animation-play-state: running;
        }
        #platforms-we-manage-section.is-in-view .animate-float-2 {
          animation: floatOrbital2 5.6s ease-in-out infinite;
          animation-play-state: running;
        }
        #platforms-we-manage-section.is-in-view .animate-pulse-ring {
          animation: pulseGlowRing 6s ease-in-out infinite;
          animation-play-state: running;
        }

        .floating-3d-node {
          contain: layout style;
          backface-visibility: hidden;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float-1,
          .animate-float-2,
          .animate-pulse-ring {
            animation: none !important;
          }
        }
      `}</style>

      <div ref={chaosRef} className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-12 flex flex-col items-center">
        {/* =========================================================================
            MOBILE TIERED LAYOUT (< md screens)
           ========================================================================= */}
        <div className="flex md:hidden flex-col items-center w-full max-w-lg px-2 sm:px-4 gap-7 text-center">
          {/* Top Mobile Social Icons Row */}
          <div className="flex items-center justify-center gap-5 w-full pt-1">
            {/* Instagram */}
            <a
              href={SOCIAL_PLATFORMS.instagram.url}
              target="_blank"
              rel="noreferrer"
              aria-label={SOCIAL_PLATFORMS.instagram.name}
              className="floating-3d-node animate-float-1 relative group cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-14 h-14 p-3 rounded-2xl bg-gradient-to-b from-[#1f1f23] to-[#0d0d10] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="igChaosGradientMob" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433" />
                      <stop offset="25%" stopColor="#e6683c" />
                      <stop offset="50%" stopColor="#dc2743" />
                      <stop offset="75%" stopColor="#cc2366" />
                      <stop offset="100%" stopColor="#bc1888" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                    fill="url(#igChaosGradientMob)"
                  />
                </svg>
                <div className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-500 text-white font-mono text-[8px] font-bold shadow-md">
                  99+
                </div>
              </div>
            </a>

            {/* LinkedIn */}
            <a
              href={SOCIAL_PLATFORMS.linkedin.url}
              target="_blank"
              rel="noreferrer"
              aria-label={SOCIAL_PLATFORMS.linkedin.name}
              className="floating-3d-node animate-float-2 relative group cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-14 h-14 p-3 rounded-2xl bg-gradient-to-b from-[#1f1f23] to-[#0d0d10] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <svg className="w-8 h-8 fill-[#0A66C2]" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <div className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-mono text-[8px] font-bold shadow-md">
                  1M+
                </div>
              </div>
            </a>

            {/* YouTube */}
            <a
              href={SOCIAL_PLATFORMS.youtube.url}
              target="_blank"
              rel="noreferrer"
              aria-label={SOCIAL_PLATFORMS.youtube.name}
              className="floating-3d-node animate-float-1 relative group cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-14 h-14 p-3 rounded-2xl bg-gradient-to-b from-[#1f1f23] to-[#0d0d10] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <svg className="w-8 h-8 fill-[#FF0000]" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <div className="absolute -bottom-2 -left-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-rose-600 text-white text-[8px] font-bold shadow-md">
                  4K
                </div>
              </div>
            </a>
          </div>

          {/* Center Mobile Headline & Content */}
          <div className="flex flex-col items-center">
            {/* Category Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-3 shadow-sm">
              <span className="text-[10px] sm:text-xs font-serif uppercase tracking-[0.25em] text-neutral-300 font-medium">
                PLATFORMS WE MANAGE
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.15]">
              Expertise across all major{" "}
              <span
                className="italic font-serif font-normal inline-block"
                style={{
                  background: "linear-gradient(95deg, #FF671F 0%, #FF9933 26%, #FFFFFF 50%, #138808 74%, #00A859 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                social networks.
              </span>
            </h2>

            <p className="font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-400 max-w-sm mt-3 leading-relaxed">
              Omnichannel strategy, high-converting creative distribution, and algorithmic growth tailored for high-scale brands.
            </p>
          </div>

          {/* Bottom Mobile Social Icons Grid */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 w-full pb-1">
            {/* X / Twitter */}
            <a
              href={SOCIAL_PLATFORMS.x.url}
              target="_blank"
              rel="noreferrer"
              aria-label={SOCIAL_PLATFORMS.x.name}
              className="floating-3d-node animate-float-2 relative group cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 p-2.5 rounded-2xl bg-gradient-to-b from-[#1f1f23] to-[#0d0d10] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <div className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded bg-neutral-800 text-[8px] font-mono text-neutral-200 border border-neutral-700 shadow-md">
                  #1 Trend
                </div>
              </div>
            </a>

            {/* TikTok */}
            <a
              href={SOCIAL_PLATFORMS.tiktok.url}
              target="_blank"
              rel="noreferrer"
              aria-label={SOCIAL_PLATFORMS.tiktok.name}
              className="floating-3d-node animate-float-1 relative group cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 p-2.5 rounded-2xl bg-gradient-to-b from-[#1f1f23] to-[#0d0d10] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <svg className="w-6 h-6 fill-white drop-shadow-[2px_0px_0px_rgba(254,44,85,0.8)]" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                </svg>
                <div className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] text-black text-[8px] font-mono font-bold shadow-md">
                  Viral
                </div>
              </div>
            </a>

            {/* Facebook */}
            <a
              href={SOCIAL_PLATFORMS.facebook.url}
              target="_blank"
              rel="noreferrer"
              aria-label={SOCIAL_PLATFORMS.facebook.name}
              className="floating-3d-node animate-float-1 relative group cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 p-2.5 rounded-2xl bg-gradient-to-b from-[#1f1f23] to-[#0d0d10] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <svg className="w-7 h-7 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <div className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-mono text-[8px] font-bold shadow-md">
                  Ads
                </div>
              </div>
            </a>

            {/* Pinterest */}
            <a
              href={SOCIAL_PLATFORMS.pinterest.url}
              target="_blank"
              rel="noreferrer"
              aria-label={SOCIAL_PLATFORMS.pinterest.name}
              className="floating-3d-node animate-float-2 relative group cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 p-2.5 rounded-2xl bg-gradient-to-b from-[#1f1f23] to-[#0d0d10] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <svg className="w-7 h-7 fill-[#E60023]" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
                <div className="absolute -top-2 -left-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-mono text-[8px] font-bold shadow-md">
                  Pins
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* =========================================================================
            DESKTOP / TABLET CANVAS (>= md screens)
           ========================================================================= */}
        <div className="hidden md:flex relative w-full min-h-[580px] lg:min-h-[660px] flex-col items-center justify-center text-center px-4 overflow-visible">
          {/* Glowing Concentric Radar / Orbit Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="w-[750px] lg:w-[920px] h-[400px] lg:h-[480px] rounded-[100%] border border-white/[0.07] border-dashed animate-pulse-ring" />
            <div className="absolute w-[560px] lg:w-[680px] h-[280px] lg:h-[350px] rounded-[100%] border border-white/[0.05]" />
          </div>

          {/* Smooth High-Precision Orbit Track Spline Curves */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
            viewBox="0 0 1000 500"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="tricolorSplineGradDesk" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF671F" stopOpacity="0.1" />
                <stop offset="40%" stopColor="#FF671F" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#046A38" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#046A38" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            <path
              d="M 280 90 C 220 160, 120 220, 80 250"
              stroke="url(#tricolorSplineGradDesk)"
              strokeWidth="1.6"
              strokeDasharray="5 5"
              className="opacity-70"
            />

            <path
              d="M 580 95 C 680 70, 780 120, 850 160"
              stroke="url(#tricolorSplineGradDesk)"
              strokeWidth="1.6"
              strokeDasharray="5 5"
              className="opacity-70"
            />

            <path
              d="M 850 170 C 920 220, 940 300, 950 360"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="1.4"
              strokeDasharray="5 5"
              className="opacity-60"
            />

            <path
              d="M 500 410 C 620 430, 740 420, 850 380"
              stroke="url(#tricolorSplineGradDesk)"
              strokeWidth="1.6"
              strokeDasharray="5 5"
              className="opacity-70"
            />

            <path
              d="M 80 270 C 90 330, 130 380, 200 400"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1.4"
              strokeDasharray="5 5"
              className="opacity-60"
            />

            <path
              d="M 230 400 C 310 420, 390 425, 470 420"
              stroke="url(#tricolorSplineGradDesk)"
              strokeWidth="1.6"
              strokeDasharray="5 5"
              className="opacity-70"
            />
          </svg>

          {/* 1. Instagram (Top Left) */}
          <a
            href={SOCIAL_PLATFORMS.instagram.url}
            target="_blank"
            rel="noreferrer"
            title={`Visit Bharat DigiGuru on ${SOCIAL_PLATFORMS.instagram.name}`}
            aria-label={SOCIAL_PLATFORMS.instagram.name}
            onMouseEnter={() => setHoverPlatform("instagram")}
            onMouseLeave={() => setHoverPlatform(null)}
            className="floating-3d-node animate-float-1 absolute top-[5%] left-[22%] lg:left-[26%] z-10 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-16 h-16 p-3.5 rounded-2xl bg-gradient-to-b from-[#1f1f23] to-[#0d0d10] border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:scale-115 group-hover:border-pink-500/60 group-hover:shadow-[0_0_30px_rgba(225,48,108,0.4)] transition-all duration-300">
              <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="igChaosGradientDesk" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f09433" />
                    <stop offset="25%" stopColor="#e6683c" />
                    <stop offset="50%" stopColor="#dc2743" />
                    <stop offset="75%" stopColor="#cc2366" />
                    <stop offset="100%" stopColor="#bc1888" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  fill="url(#igChaosGradientDesk)"
                />
              </svg>
              <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-500 text-white font-mono text-[9px] font-bold shadow-md border border-red-400/40">
                99+
              </div>
            </div>
          </a>

          {/* 2. LinkedIn (Top Right) */}
          <a
            href={SOCIAL_PLATFORMS.linkedin.url}
            target="_blank"
            rel="noreferrer"
            title={`Connect on ${SOCIAL_PLATFORMS.linkedin.name}`}
            aria-label={SOCIAL_PLATFORMS.linkedin.name}
            onMouseEnter={() => setHoverPlatform("linkedin")}
            onMouseLeave={() => setHoverPlatform(null)}
            className="floating-3d-node animate-float-2 absolute top-[3%] right-[24%] lg:right-[28%] z-10 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-16 h-16 p-3.5 rounded-2xl bg-gradient-to-b from-[#1f1f23] to-[#0d0d10] border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:scale-115 group-hover:border-blue-500/60 group-hover:shadow-[0_0_30px_rgba(10,102,194,0.4)] transition-all duration-300">
              <svg className="w-9 h-9 fill-[#0A66C2]" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-mono text-[9px] font-bold shadow-md border border-blue-400/40">
                1M+
              </div>
            </div>
          </a>

          {/* 3. YouTube (Upper Right Outer) */}
          <a
            href={SOCIAL_PLATFORMS.youtube.url}
            target="_blank"
            rel="noreferrer"
            title={`Visit Bharat DigiGuru on ${SOCIAL_PLATFORMS.youtube.name}`}
            aria-label={SOCIAL_PLATFORMS.youtube.name}
            onMouseEnter={() => setHoverPlatform("youtube")}
            onMouseLeave={() => setHoverPlatform(null)}
            className="floating-3d-node animate-float-1 absolute top-[16%] right-[5%] lg:right-[9%] z-10 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-15 h-15 p-3.5 rounded-2xl bg-gradient-to-b from-[#1f1f23] to-[#0d0d10] border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:scale-115 group-hover:border-red-500/60 group-hover:shadow-[0_0_30px_rgba(255,0,0,0.4)] transition-all duration-300">
              <svg className="w-8 h-8 fill-[#FF0000]" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <div className="absolute -bottom-2 -left-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-rose-600 text-white text-[9px] font-bold shadow-md border border-red-400/40">
                4K
              </div>
            </div>
          </a>

          {/* 4. Twitter / X (Left Mid) */}
          <a
            href={SOCIAL_PLATFORMS.x.url}
            target="_blank"
            rel="noreferrer"
            title={`Visit Bharat DigiGuru on ${SOCIAL_PLATFORMS.x.name}`}
            aria-label={SOCIAL_PLATFORMS.x.name}
            onMouseEnter={() => setHoverPlatform("x")}
            onMouseLeave={() => setHoverPlatform(null)}
            className="floating-3d-node animate-float-2 absolute top-[36%] left-[3%] lg:left-[6%] z-10 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-15 h-15 p-3 rounded-2xl bg-gradient-to-b from-[#1f1f23] to-[#0d0d10] border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:scale-115 group-hover:border-white/50 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300">
              <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded bg-neutral-800 text-[9px] font-mono text-neutral-200 border border-neutral-700 shadow-md">
                #1 Trend
              </div>
            </div>
          </a>

          {/* 5. TikTok (Far Right Mid) */}
          <a
            href={SOCIAL_PLATFORMS.tiktok.url}
            target="_blank"
            rel="noreferrer"
            title={`Visit Bharat DigiGuru on ${SOCIAL_PLATFORMS.tiktok.name}`}
            aria-label={SOCIAL_PLATFORMS.tiktok.name}
            onMouseEnter={() => setHoverPlatform("tiktok")}
            onMouseLeave={() => setHoverPlatform(null)}
            className="floating-3d-node animate-float-1 absolute top-[44%] right-[2%] lg:left-auto lg:right-[5%] z-10 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-15 h-15 p-3 rounded-2xl bg-gradient-to-b from-[#1f1f23] to-[#0d0d10] border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:scale-115 group-hover:border-cyan-400/60 group-hover:shadow-[0_0_30px_rgba(37,244,238,0.4)] transition-all duration-300">
              <svg className="w-7 h-7 fill-white drop-shadow-[2px_0px_0px_rgba(254,44,85,0.8)]" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
              </svg>
              <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] text-black text-[9px] font-mono font-bold shadow-md">
                Viral
              </div>
            </div>
          </a>

          {/* 6. Pinterest (Lower Right Mid) */}
          <a
            href={SOCIAL_PLATFORMS.pinterest.url}
            target="_blank"
            rel="noreferrer"
            title={`Visit Bharat DigiGuru on ${SOCIAL_PLATFORMS.pinterest.name}`}
            aria-label={SOCIAL_PLATFORMS.pinterest.name}
            onMouseEnter={() => setHoverPlatform("pinterest")}
            onMouseLeave={() => setHoverPlatform(null)}
            className="floating-3d-node animate-float-2 absolute bottom-[8%] right-[18%] lg:right-[22%] z-10 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-15 h-15 p-3 rounded-2xl bg-gradient-to-b from-[#1f1f23] to-[#0d0d10] border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:scale-115 group-hover:border-red-500/60 group-hover:shadow-[0_0_30px_rgba(230,0,35,0.4)] transition-all duration-300">
              <svg className="w-8 h-8 fill-[#E60023]" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
              </svg>
              <div className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-mono text-[9px] font-bold shadow-md border border-red-400/40">
                Pins
              </div>
            </div>
          </a>

          {/* 7. Facebook (Bottom Left Mid) */}
          <a
            href={SOCIAL_PLATFORMS.facebook.url}
            target="_blank"
            rel="noreferrer"
            title={`Visit Bharat DigiGuru on ${SOCIAL_PLATFORMS.facebook.name}`}
            aria-label={SOCIAL_PLATFORMS.facebook.name}
            onMouseEnter={() => setHoverPlatform("facebook")}
            onMouseLeave={() => setHoverPlatform(null)}
            className="floating-3d-node animate-float-1 absolute bottom-[6%] left-[20%] lg:left-[24%] z-10 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-b from-[#1f1f23] to-[#0d0d10] border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:scale-115 group-hover:border-blue-500/60 group-hover:shadow-[0_0_30px_rgba(24,119,242,0.4)] transition-all duration-300">
              <svg className="w-8 h-8 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-mono text-[9px] font-bold shadow-md border border-blue-400/40">
                Ads
              </div>
            </div>
          </a>

          {/* Center Heading Content */}
          <div className="chaos-header relative z-20 max-w-2xl lg:max-w-3xl mx-auto py-8 px-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-4 shadow-sm">
              <span className="text-[11px] sm:text-xs font-serif uppercase tracking-[0.25em] text-neutral-300 font-medium">
                PLATFORMS WE MANAGE
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-[60px] font-bold tracking-tight text-white leading-[1.12]">
              Expertise across all major{" "}
              <br className="hidden sm:block" />
              <span
                className="italic font-serif font-normal inline-block transition-all duration-300"
                style={{
                  background: "linear-gradient(95deg, #FF671F 0%, #FF9933 26%, #FFFFFF 50%, #138808 74%, #00A859 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                social networks.
              </span>
            </h2>

            <p className="font-['Space_Grotesk',sans-serif] text-sm md:text-base text-neutral-400 max-w-md lg:max-w-lg mx-auto mt-4 leading-relaxed">
              Omnichannel strategy, high-converting creative distribution, and algorithmic growth tailored for high-scale brands.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformsWeManage;
