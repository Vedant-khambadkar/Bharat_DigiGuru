import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);



export const PlatformsWeManage: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const chaosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro animations
      gsap.fromTo(
        ".chaos-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
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
        { opacity: 0, scale: 0.7, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: chaosRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        ".chaos-stat-card",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".chaos-stats-container",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        ".platform-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".platforms-grid",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="platforms-we-manage-section"
      className="relative w-full bg-transparent text-white font-neuropol overflow-hidden select-none "
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-white/[0.015] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-12 flex flex-col gap-24 sm:gap-32">

        {/* =========================================================================
            PART 1: TOOLS & TECHNOLOGY / THE CHAOTIC ECOSYSTEM
           ========================================================================= */}
        <div ref={chaosRef} className="relative w-full flex flex-col items-center">

          {/* Main 3D Canvas Area */}
          <div className="relative w-full min-h-[460px] sm:min-h-[520px] md:min-h-[560px] flex flex-col items-center justify-center text-center px-4 overflow-visible">

            {/* Custom Embedded CSS for 60fps Smooth Streaming Spline & Float Animations */}
            <style>{`
              @keyframes streamDashesAnim {
                from { stroke-dashoffset: 120; }
                to { stroke-dashoffset: 0; }
              }
              @keyframes streamPulseAnim {
                0% { stroke-dashoffset: 350; opacity: 0; }
                30% { opacity: 0.9; }
                70% { opacity: 0.9; }
                100% { stroke-dashoffset: -350; opacity: 0; }
              }
              @keyframes floatOrbital1 {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-8px) rotate(1.5deg); }
              }
              @keyframes floatOrbital2 {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(8px) rotate(-1.5deg); }
              }
              .animate-spline-stream {
                animation: streamDashesAnim 8s linear infinite;
              }
              .animate-spline-pulse {
                animation: streamPulseAnim 4.5s ease-in-out infinite;
              }
              .animate-float-1 {
                animation: floatOrbital1 5s ease-in-out infinite;
              }
              .animate-float-2 {
                animation: floatOrbital2 6s ease-in-out infinite;
              }
            `}</style>

            {/* Smooth SVG Spline Curves connecting the social nodes (Animated) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
              viewBox="0 0 1000 500"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="splinePulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity="0" />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
                  <stop offset="100%" stopColor="#FF007A" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* 1. Curve from Instagram to Twitter/X (Left Arch) */}
              <path
                d="M 280 90 C 220 160, 120 220, 80 250"
                stroke="rgba(255, 255, 255, 0.22)"
                strokeWidth="1.4"
                strokeDasharray="6 6"
                className="animate-spline-stream"
              />
              <path
                d="M 280 90 C 220 160, 120 220, 80 250"
                stroke="url(#splinePulseGrad)"
                strokeWidth="2.4"
                strokeDasharray="50 250"
                strokeLinecap="round"
                className="animate-spline-pulse"
              />

              {/* 2. Curve across top from LinkedIn to YouTube */}
              <path
                d="M 580 95 C 680 70, 780 120, 850 160"
                stroke="rgba(255, 255, 255, 0.24)"
                strokeWidth="1.4"
                strokeDasharray="6 6"
                className="animate-spline-stream"
                style={{ animationDuration: '7s' }}
              />
              <path
                d="M 580 95 C 680 70, 780 120, 850 160"
                stroke="url(#splinePulseGrad)"
                strokeWidth="2.4"
                strokeDasharray="60 260"
                strokeLinecap="round"
                className="animate-spline-pulse"
                style={{ animationDelay: '1.2s' }}
              />

              {/* 3. Curve from YouTube to TikTok (Right Arch) */}
              <path
                d="M 850 170 C 920 220, 940 300, 950 360"
                stroke="rgba(255, 255, 255, 0.22)"
                strokeWidth="1.4"
                strokeDasharray="6 6"
                className="animate-spline-stream"
                style={{ animationDuration: '6s' }}
              />
              <path
                d="M 850 170 C 920 220, 940 300, 950 360"
                stroke="url(#splinePulseGrad)"
                strokeWidth="2.4"
                strokeDasharray="50 220"
                strokeLinecap="round"
                className="animate-spline-pulse"
                style={{ animationDelay: '2.4s' }}
              />

              {/* 4. Curve along bottom from Meta to TikTok */}
              <path
                d="M 500 410 C 620 430, 740 420, 850 380"
                stroke="rgba(255, 255, 255, 0.22)"
                strokeWidth="1.4"
                strokeDasharray="6 6"
                className="animate-spline-stream"
                style={{ animationDuration: '9s' }}
              />
              <path
                d="M 500 410 C 620 430, 740 420, 850 380"
                stroke="url(#splinePulseGrad)"
                strokeWidth="2.4"
                strokeDasharray="60 300"
                strokeLinecap="round"
                className="animate-spline-pulse"
                style={{ animationDelay: '3.1s' }}
              />

              {/* 5. Curve from Twitter/X down to Pinterest */}
              <path
                d="M 80 270 C 90 330, 130 380, 200 400"
                stroke="rgba(255, 255, 255, 0.18)"
                strokeWidth="1.4"
                strokeDasharray="6 6"
                className="animate-spline-stream"
                style={{ animationDuration: '8s' }}
              />

              {/* 6. Curve from Pinterest to Meta */}
              <path
                d="M 230 400 C 310 420, 390 425, 470 420"
                stroke="rgba(255, 255, 255, 0.18)"
                strokeWidth="1.4"
                strokeDasharray="6 6"
                className="animate-spline-stream"
                style={{ animationDuration: '8.5s' }}
              />
            </svg>

            {/* ---------------- 3D FLOATING SOCIAL NODES ---------------- */}

            {/* 1. Instagram (Top Left) */}
            <div className="floating-3d-node absolute top-[6%] left-[22%] sm:left-[26%] md:left-[28%] z-10 group cursor-default">
              <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 p-3 rounded-2xl bg-gradient-to-b from-[#1c1c1e] to-[#0d0d0f] border border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] group-hover:scale-110 group-hover:border-pink-500/40 transition-all duration-300">
                <svg className="w-8 h-8 sm:w-9 sm:h-9" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="igChaosGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433" />
                      <stop offset="25%" stopColor="#e6683c" />
                      <stop offset="50%" stopColor="#dc2743" />
                      <stop offset="75%" stopColor="#cc2366" />
                      <stop offset="100%" stopColor="#bc1888" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                    fill="url(#igChaosGradient)"
                  />
                </svg>
                {/* 3D Red Badge */}
                <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-500 text-white font-mono text-[9px] font-bold shadow-[0_4px_10px_rgba(239,68,68,0.5)] border border-red-400/40">
                  99+
                </div>
              </div>
            </div>

            {/* 2. LinkedIn (Top Right) */}
            <div className="floating-3d-node absolute top-[4%] right-[24%] sm:right-[28%] md:right-[32%] z-10 group cursor-default">
              <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 p-3 rounded-2xl bg-gradient-to-b from-[#1c1c1e] to-[#0d0d0f] border border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] group-hover:scale-110 group-hover:border-blue-500/40 transition-all duration-300">
                <svg className="w-8 h-8 sm:w-9 sm:h-9 fill-[#0A66C2]" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                {/* 3D 1M+ Badge */}
                <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-mono text-[9px] font-bold shadow-[0_4px_10px_rgba(37,99,235,0.5)] border border-blue-400/40">
                  1M+
                </div>
              </div>
            </div>

            {/* 3. YouTube (Upper Right Outer) */}
            <div className="floating-3d-node absolute top-[18%] right-[6%] sm:right-[10%] md:right-[14%] z-10 group cursor-default">
              <div className="relative flex items-center justify-center w-13 h-13 sm:w-15 sm:h-15 p-3 rounded-2xl bg-gradient-to-b from-[#1c1c1e] to-[#0d0d0f] border border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] group-hover:scale-110 group-hover:border-red-500/40 transition-all duration-300">
                <svg className="w-8 h-8 fill-[#FF0000]" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                {/* 3D Red Play / 4K Badge */}
                <div className="absolute -bottom-2 -left-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-bold shadow-[0_4px_10px_rgba(239,68,68,0.5)] border border-red-400/40">
                  4K
                </div>
              </div>
            </div>

            {/* 4. Twitter / X (Left Mid) */}
            <div className="floating-3d-node absolute top-[36%] left-[4%] sm:left-[8%] md:left-[12%] z-10 group cursor-default">
              <div className="relative flex items-center justify-center w-13 h-13 sm:w-15 sm:h-15 p-3 rounded-2xl bg-gradient-to-b from-[#1c1c1e] to-[#0d0d0f] border border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] group-hover:scale-110 group-hover:border-white/30 transition-all duration-300">
                <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                {/* Micro Live / Trend Badge */}
                <div className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded bg-neutral-800 text-[9px] font-mono text-neutral-300 border border-neutral-700 shadow-md">
                  #1 Trend
                </div>
              </div>
            </div>

            {/* 5. TikTok (Far Right Mid) */}
            <div className="floating-3d-node absolute top-[44%] right-[3%] sm:right-[7%] md:right-[10%] z-10 group cursor-default">
              <div className="relative flex items-center justify-center w-13 h-13 sm:w-15 sm:h-15 p-3 rounded-2xl bg-gradient-to-b from-[#1c1c1e] to-[#0d0d0f] border border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] group-hover:scale-110 group-hover:border-cyan-400/40 transition-all duration-300">
                <svg className="w-7 h-7 fill-white drop-shadow-[2px_0px_0px_rgba(254,44,85,0.8)]" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                </svg>
                {/* 3D Viral Pill */}
                <div className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] text-black text-[9px] font-mono font-bold shadow-md">
                  Viral
                </div>
              </div>
            </div>

            {/* 6. Pinterest (Lower Left) */}
            <div className="floating-3d-node absolute bottom-[12%] right-[10%] sm:right-[14%] md:right-[28%] z-10 group cursor-default">
              <div className="relative flex items-center justify-center w-13 h-13 sm:w-15 sm:h-15 p-3 rounded-2xl bg-gradient-to-b from-[#1c1c1e] to-[#0d0d0f] border border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] group-hover:scale-110 group-hover:border-red-500/40 transition-all duration-300">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-[#E60023]" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
                {/* 3D Pin Badge */}
                <div className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-mono text-[9px] font-bold shadow-[0_4px_10px_rgba(230,0,35,0.5)] border border-red-400/40">
                  Pins
                </div>
              </div>
            </div>

            {/* 7. Facebook (Bottom Center) */}
            <div className="floating-3d-node absolute bottom-[10%] left-[28%] sm:left-[26%] md:left-[25%] -translate-x-1/2 z-10 group cursor-default">
              <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-[#1c1c1e] to-[#0d0d0f] border border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] group-hover:scale-110 group-hover:border-blue-500/40 transition-all duration-300">
                <svg className="w-8 h-8 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                {/* 3D Ads Badge */}
                <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-mono text-[9px] font-bold shadow-[0_4px_10px_rgba(37,99,235,0.5)] border border-blue-400/40">
                  Ads
                </div>
              </div>
            </div>

            {/* Center Heading Content */}
            <div className="chaos-header relative z-20 max-w-2xl mx-auto py-8">
              <span className="text-1xl sm:text-2xl font-neuropol text-xs uppercase tracking-widest text-neutral-200 mb-3 block">
                Platforms We Manage
              </span>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight ">
                Expertise across all major{" "}
                <span className="text-neutral-400 italic ">
                  social networks.
                </span>
              </h2>
            </div>
          </div>
        </div>

      

      </div>
    </section>
  );
};

export default PlatformsWeManage;
