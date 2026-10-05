import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const ToolsAndTechnology: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline & Sub-metrics reveal
      gsap.fromTo(
        ".reference-text-elem",
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );

      // Floating App Badges Pop-in with spring physics
      gsap.fromTo(
        ".floating-app-node",
        { opacity: 0, scale: 0.4, y: 25 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: "back.out(1.8)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Curved Spline Lines Fade & Stroke Draw (Desktop only)
      gsap.fromTo(
        ".curved-spline-path",
        { opacity: 0, strokeDashoffset: 100 },
        {
          opacity: 0.6,
          strokeDashoffset: 0,
          duration: 1.2,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="tools-and-technology"
      className="relative w-full py-16 sm:py-24 md:py-32 bg-[#050505] text-white flex flex-col justify-center items-center overflow-hidden select-none isolate"
    >
      <style>{`
        @keyframes floatSlow1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(0.8deg); }
        }
        @keyframes floatSlow2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(7px) rotate(-1deg); }
        }
        @keyframes floatSlow3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(-0.8deg); }
        }
        @keyframes floatSlow4 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(6px) rotate(0.8deg); }
        }

        .anim-float-1 { animation: floatSlow1 5.5s ease-in-out infinite; }
        .anim-float-2 { animation: floatSlow2 6.5s ease-in-out infinite; }
        .anim-float-3 { animation: floatSlow3 7.2s ease-in-out infinite; }
        .anim-float-4 { animation: floatSlow4 6s ease-in-out infinite; }

        .curved-spline-path {
          stroke-dasharray: 4 4;
          animation: splineFlow 18s linear infinite;
        }
        @keyframes splineFlow {
          from { stroke-dashoffset: 160; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Ambient Atmospheric Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[950px] h-[350px] sm:h-[500px] bg-white/[0.015] blur-[150px] rounded-full" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-purple-500/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-blue-500/[0.025] blur-[130px] rounded-full" />
      </div>

      {/* =========================================================================
          1. MOBILE TIERED LAYOUT (< md screens)
          Flawless spacing without collisions on mobile
         ========================================================================= */}
      <div className="flex md:hidden flex-col items-center w-full max-w-lg px-4 sm:px-6 relative z-10 gap-8">
        {/* Mobile Top Floating App Row */}
        <div className="flex items-center justify-center gap-5 w-full pt-2">
          {/* 1. Google Calendar */}
          <div className="floating-app-node anim-float-2 group cursor-pointer relative">
            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-[#1a1b20] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.2)] p-2">
              <svg viewBox="0 0 256 256" className="w-full h-full">
                <g>
                  <polygon fill="#FFFFFF" points="195.368421 60.6315789 60.6315789 60.6315789 60.6315789 195.368421 195.368421 195.368421" />
                  <polygon fill="#EA4335" points="195.368421 256 256 195.368421 225.684211 190.196005 195.368421 195.368421 189.835162 223.098002" />
                  <path d="M0,195.37 L0,235.79 C0,246.96 9.04,256 20.21,256 L60.63,256 L66.86,225.68 L60.63,195.37 L27.6,190.2 L0,195.37 Z" fill="#188038" />
                  <path d="M256,60.63 L256,20.21 C256,9.04 246.96,0 235.79,0 L195.37,0 C191.68,15.04 189.84,26.1 189.84,33.2 C189.84,40.29 191.68,49.44 195.37,60.63 C208.78,64.47 218.88,66.39 225.68,66.39 C232.49,66.39 242.59,64.47 256,60.63 Z" fill="#1967D2" />
                  <polygon fill="#FBBC04" points="256 60.63 195.37 60.63 195.37 195.37 256 195.37" />
                  <polygon fill="#34A853" points="195.37 195.37 60.63 195.37 60.63 256 195.37 256" />
                  <path d="M195.37,0 L20.21,0 C9.04,0 0,9.04 0,20.21 L0,195.37 L60.63,195.37 L60.63,60.63 L195.37,60.63 L195.37,0 Z" fill="#4285F4" />
                  <text x="128" y="160" textAnchor="middle" fill="#4285F4" fontSize="85" fontWeight="bold" fontFamily="sans-serif">31</text>
                </g>
              </svg>
              <div className="absolute -top-2 -left-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-[8px] font-bold text-white border border-[#050505] shadow-lg">
                99+
              </div>
            </div>
          </div>

          {/* 2. Google Workspace */}
          <div className="floating-app-node anim-float-3 group cursor-pointer relative">
            <div className="flex items-center justify-center w-15 h-15 rounded-2xl bg-[#1a1b20] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.2)] p-3">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <div className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-[8px] font-bold text-white border border-[#050505] shadow-lg">
                1M+
              </div>
            </div>
          </div>

          {/* 3. Canva */}
          <div className="floating-app-node anim-float-1 group cursor-pointer relative">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a1b20] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.2)] p-2">
              <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
                <defs>
                  <radialGradient id="canvaGradMobileA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(15.5 70.9) rotate(-49.4) scale(61.9)">
                    <stop stopColor="#6420FF" />
                    <stop offset="1" stopColor="#6420FF" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="canvaGradMobileB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(21.2 9.1) rotate(54.7) scale(69.8)">
                    <stop stopColor="#00C4CC" />
                    <stop offset="1" stopColor="#00C4CC" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="40" cy="40" r="40" fill="#7D2AE7" />
                <circle cx="40" cy="40" r="40" fill="url(#canvaGradMobileA)" />
                <circle cx="40" cy="40" r="40" fill="url(#canvaGradMobileB)" />
                <path d="M57.3 48.2c-.3 0-.6.3-.9.9-3.4 6.9-9.3 11.8-16.1 11.8-7.9 0-12.8-7.1-12.8-17 0-16.6 9.3-26.3 17.4-26.3 3.8 0 6.1 2.4 6.1 6.2 0 4.5-2.6 6.9-2.6 8.5 0 .7.4 1.1 1.3 1.1 3.5 0 7.7-4.1 7.7-9.8 0-5.6-4.9-9.7-13-9.7-13.5 0-25.5 12.5-25.5 29.8 0 13.4 7.6 22.2 19.4 22.2 12.5 0 19.8-12.5 19.8-16.5 0-.9-.5-1.2-1-.1.2z" fill="#ffffff" />
              </svg>
              <div className="absolute -bottom-2 -left-1 px-1.5 py-0.5 rounded-full bg-[#7D2AE7] text-[8px] font-bold text-white border border-[#050505] shadow-lg">
                Pro
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Central Headline & Subtext */}
        <div className="flex flex-col items-center text-center w-full">
          <h2 className="reference-text-elem text-3xl sm:text-4xl font-normal tracking-tight text-white leading-[1.2] font-['Space_Grotesk',sans-serif]">
            The current way we{" "}
            <span className="block font-medium">work is seamless.</span>
          </h2>
          <p className="reference-text-elem font-['Space_Grotesk',sans-serif] text-xs sm:text-sm text-neutral-400 mt-3 max-w-sm font-normal leading-relaxed">
            All your design tools, 3D engines, marketing channels, and AI intelligence unified into a single frictionless pipeline.
          </p>

          {/* 3 Monospace Metric Columns */}
          <div className="reference-text-elem flex flex-col gap-4 mt-8 w-full text-left border-t border-neutral-800/60 pt-6">
            <div className="flex flex-col">
              <span className="font-mono text-xs text-neutral-300 leading-relaxed font-normal">
                2x more speed occurs when eliminating manual handoffs.
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs text-neutral-300 leading-relaxed font-normal">
                Constant AI integration eliminates workflow friction.
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs text-neutral-300 leading-relaxed font-normal">
                100% unified attribution across every ad channel.
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Floating App Grid */}
        <div className="flex items-center justify-center gap-5 w-full pb-2">
          {/* 4. Figma */}
          <div className="floating-app-node anim-float-1 group cursor-pointer relative">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a1b20] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.2)] p-2.5">
              <svg className="w-full h-full" viewBox="0 0 38 57" fill="none">
                <path d="M19 28.5A9.5 9.5 0 1 1 35.5 35 9.5 9.5 0 0 1 19 28.5z" fill="#1ABCFE" />
                <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
                <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
                <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
                <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-[#050505] shadow-md animate-pulse" />
            </div>
          </div>

          {/* 5. Google Ads */}
          <div className="floating-app-node anim-float-2 group cursor-pointer relative">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a1b20] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.2)] p-2">
              <div className="w-full h-full rounded-full  flex items-center justify-center p-1 shadow-md overflow-hidden">
                <svg viewBox="0 -13 256 256" className="w-full h-full" fill="none">
                  <g>
                    <path
                      d="M5.888,166.405103 L90.88,20.9 C101.676138,27.2558621 156.115862,57.3844138 164.908138,63.1135172 L79.9161379,208.627448 C70.6206897,220.906621 -5.888,185.040138 5.888,166.396276 L5.888,166.405103 Z"
                      fill="#FBBC04"
                    />
                    <path
                      d="M250.084224,166.401789 L165.092224,20.9055131 C153.210293,1.13172 127.619121,-6.05393517 106.600638,5.62496138 C85.582155,17.3038579 79.182155,42.4624786 91.0640861,63.1190303 L176.056086,208.632961 C187.938017,228.397927 213.52919,235.583582 234.547672,223.904686 C254.648086,212.225789 261.966155,186.175582 250.084224,166.419444 L250.084224,166.401789 Z"
                      fill="#4285F4"
                    />
                    <ellipse
                      fill="#34A853"
                      cx="42.6637241"
                      cy="187.924414"
                      rx="42.6637241"
                      ry="41.6044138"
                    />
                  </g>
                </svg>
              </div>
              <div className="absolute -bottom-2 -left-1 px-1.5 py-0.5 rounded-full bg-[#4285F4] text-[8px] font-mono font-bold text-white border border-[#050505] shadow-lg">
                Ads
              </div>
            </div>
          </div>

          {/* 6. Google Analytics */}
          <div className="floating-app-node anim-float-4 group cursor-pointer relative">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a1b20] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.2)] p-2.5">
              <svg viewBox="0 0 192 192" className="w-full h-full">
                <path d="M152 24v144c0 13.255-10.745 24-24 24s-24-10.745-24-24V24c0-13.255 10.745-24 24-24s24 10.745 24 24z" fill="#F9AB00" />
                <path d="M96 80v88c0 13.255-10.745 24-24 24s-24-10.745-24-24V80c0-13.255 10.745-24 24-24s24 10.745 24 24z" fill="#E37400" />
                <circle cx="36" cy="168" r="24" fill="#E37400" />
              </svg>
              <div className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-[8px] font-mono text-amber-400 border border-amber-500/30 shadow-lg">
                GA4
              </div>
            </div>
          </div>

          {/* 7. Meta */}
          <div className="floating-app-node anim-float-2 group cursor-pointer relative">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a1b20] border border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.2)] p-2.5">
              <svg className="w-full h-full" fill="#0081FB" viewBox="0 0 32 32">
                <path d="M5,19.5c0-4.6,2.3-9.4,5-9.4c1.5,0,2.7,0.9,4.6,3.6c-1.8,2.8-2.9,4.5-2.9,4.5c-2.4,3.8-3.2,4.6-4.5,4.6 C5.9,22.9,5,21.7,5,19.5 M20.7,17.8L19,15c-0.4-0.7-0.9-1.4-1.3-2c1.5-2.3,2.7-3.5,4.2-3.5c3,0,5.4,4.5,5.4,10.1 c0,2.1-0.7,3.3-2.1,3.3S23.3,22,20.7,17.8 M16.4,11c-2.2-2.9-4.1-4-6.3-4C5.5,7,2,13.1,2,19.5c0,4,1.9,6.5,5.1,6.5 c2.3,0,3.9-1.1,6.9-6.3c0,0,1.2-2.2,2.1-3.7c0.3,0.5,0.6,1,0.9,1.6l1.4,2.4c2.7,4.6,4.2,6.1,6.9,6.1c3.1,0,4.8-2.6,4.8-6.7 C30,12.6,26.4,7,22.1,7C19.8,7,18,8.8,16.4,11" />
              </svg>
              <div className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-[8px] font-bold text-white border border-[#050505] shadow-lg">
                420
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. DESKTOP / TABLET ORBITAL CLOUD CANVAS (>= md screens)
          Spacious constellation with spline connector wires
         ========================================================================= */}
      <div
        ref={stageRef}
        className="hidden md:flex relative z-10 w-full max-w-5xl lg:max-w-6xl mx-auto px-6 lg:px-12 items-center justify-center min-h-[640px] lg:min-h-[720px]"
      >
        {/* SVG Curved Spline Cables */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 1100 750"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
        >
          <defs>
            <linearGradient id="wireGradientDesk1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="wireGradientDesk2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Figma (Far Left) -> Top Left Curve */}
          <path className="curved-spline-path" d="M 120 310 C 200 280 260 220 280 140" stroke="url(#wireGradientDesk1)" strokeWidth="1.6" />
          {/* Calendar (Top Left) -> Center Heading */}
          <path className="curved-spline-path" d="M 330 150 C 400 200 440 260 480 320" stroke="url(#wireGradientDesk1)" strokeWidth="1.6" />
          {/* Workspace (Top Center) -> Center Heading */}
          <path className="curved-spline-path" d="M 640 160 C 620 220 580 260 550 300" stroke="url(#wireGradientDesk2)" strokeWidth="1.6" />
          {/* Canva (Top Right) -> Center / Right */}
          <path className="curved-spline-path" d="M 880 180 C 890 280 940 330 980 390" stroke="url(#wireGradientDesk2)" strokeWidth="1.6" />
          {/* Google Ads (Right Node) -> Bottom Right */}
          <path className="curved-spline-path" d="M 970 450 C 930 520 880 570 820 620" stroke="url(#wireGradientDesk2)" strokeWidth="1.6" />
          {/* Meta (Bottom Center / Right) -> Center */}
          <path className="curved-spline-path" d="M 580 560 C 680 550 740 580 800 610" stroke="url(#wireGradientDesk2)" strokeWidth="1.6" />
          {/* Analytics (Bottom Left) -> Center */}
          <path className="curved-spline-path" d="M 310 570 C 370 520 440 480 500 460" stroke="url(#wireGradientDesk1)" strokeWidth="1.6" />
          {/* Bottom Center Node */}
          <path className="curved-spline-path" d="M 520 630 C 520 680 520 710 520 740" stroke="url(#wireGradientDesk1)" strokeWidth="1.6" />
        </svg>

        {/* 1. FIGMA (Far Left) */}
        <div className="floating-app-node anim-float-1 absolute top-[36%] left-[1%] lg:left-[3%] z-20 group cursor-pointer">
          <div className="relative flex items-center justify-center w-16 h-16 lg:w-19 lg:h-19 rounded-[22px] bg-[#1a1b20] border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.2)] group-hover:scale-110 group-hover:border-white/40 transition-all duration-300 p-3.5">
            <svg className="w-full h-full" viewBox="0 0 38 57" fill="none">
              <path d="M19 28.5A9.5 9.5 0 1 1 35.5 35 9.5 9.5 0 0 1 19 28.5z" fill="#1ABCFE" />
              <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
              <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
              <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
              <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-[#050505] shadow-md animate-pulse" />
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap px-2 py-0.5 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-mono text-neutral-200 shadow-xl z-30">
            Figma
          </div>
        </div>

        {/* 2. GOOGLE CALENDAR (Top Left) */}
        <div className="floating-app-node anim-float-2 absolute top-[4%] left-[20%] lg:left-[22%] z-20 group cursor-pointer">
          <div className="relative flex flex-col items-center justify-center w-17 h-17 lg:w-20 lg:h-20 rounded-[24px] bg-[#1a1b20] border border-white/15 shadow-[0_14px_36px_rgba(0,0,0,0.85),inset_0_1px_1.5px_rgba(255,255,255,0.2)] group-hover:scale-110 group-hover:border-white/40 transition-all duration-300 p-3">
            <svg viewBox="0 0 256 256" className="w-full h-full">
              <g>
                <polygon fill="#FFFFFF" points="195.368421 60.6315789 60.6315789 60.6315789 60.6315789 195.368421 195.368421 195.368421" />
                <polygon fill="#EA4335" points="195.368421 256 256 195.368421 225.684211 190.196005 195.368421 195.368421 189.835162 223.098002" />
                <path d="M0,195.37 L0,235.79 C0,246.96 9.04,256 20.21,256 L60.63,256 L66.86,225.68 L60.63,195.37 L27.6,190.2 L0,195.37 Z" fill="#188038" />
                <path d="M256,60.63 L256,20.21 C256,9.04 246.96,0 235.79,0 L195.37,0 C191.68,15.04 189.84,26.1 189.84,33.2 C189.84,40.29 191.68,49.44 195.37,60.63 C208.78,64.47 218.88,66.39 225.68,66.39 C232.49,66.39 242.59,64.47 256,60.63 Z" fill="#1967D2" />
                <polygon fill="#FBBC04" points="256 60.63 195.37 60.63 195.37 195.37 256 195.37" />
                <polygon fill="#34A853" points="195.37 195.37 60.63 195.37 60.63 256 195.37 256" />
                <path d="M195.37,0 L20.21,0 C9.04,0 0,9.04 0,20.21 L0,195.37 L60.63,195.37 L60.63,60.63 L195.37,60.63 L195.37,0 Z" fill="#4285F4" />
                <text x="128" y="160" textAnchor="middle" fill="#4285F4" fontSize="85" fontWeight="bold" fontFamily="sans-serif">31</text>
              </g>
            </svg>
            <div className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white border border-[#050505] shadow-lg">
              99+
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap px-2 py-0.5 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-mono text-neutral-200 shadow-xl z-30">
            Google Calendar
          </div>
        </div>

        {/* 3. GOOGLE WORKSPACE (Top Center-Right) */}
        <div className="floating-app-node anim-float-3 absolute top-[5%] left-[54%] lg:left-[56%] z-20 group cursor-pointer">
          <div className="relative flex items-center justify-center w-16 h-16 lg:w-19 lg:h-19 rounded-[22px] bg-[#1a1b20] border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.2)] group-hover:scale-110 group-hover:border-white/40 transition-all duration-300 p-3.5">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <div className="absolute -top-2.5 -right-2 px-2 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white border border-[#050505] shadow-lg">
              1M+
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap px-2 py-0.5 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-mono text-neutral-200 shadow-xl z-30">
            Google Workspace
          </div>
        </div>

        {/* 4. CANVA (Top Right) */}
        <div className="floating-app-node anim-float-1 absolute top-[9%] right-[14%] lg:right-[16%] z-20 group cursor-pointer">
          <div className="relative flex items-center justify-center w-16 h-16 lg:w-19 lg:h-19 rounded-[22px] bg-[#1a1b20] border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.2)] group-hover:scale-110 group-hover:border-white/40 transition-all duration-300 p-2.5">
            <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
              <defs>
                <radialGradient id="canvaGradDeskA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(15.5 70.9) rotate(-49.4) scale(61.9)">
                  <stop stopColor="#6420FF" />
                  <stop offset="1" stopColor="#6420FF" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="canvaGradDeskB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(21.2 9.1) rotate(54.7) scale(69.8)">
                  <stop stopColor="#00C4CC" />
                  <stop offset="1" stopColor="#00C4CC" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="40" cy="40" r="40" fill="#7D2AE7" />
              <circle cx="40" cy="40" r="40" fill="url(#canvaGradDeskA)" />
              <circle cx="40" cy="40" r="40" fill="url(#canvaGradDeskB)" />
              <path d="M57.3 48.2c-.3 0-.6.3-.9.9-3.4 6.9-9.3 11.8-16.1 11.8-7.9 0-12.8-7.1-12.8-17 0-16.6 9.3-26.3 17.4-26.3 3.8 0 6.1 2.4 6.1 6.2 0 4.5-2.6 6.9-2.6 8.5 0 .7.4 1.1 1.3 1.1 3.5 0 7.7-4.1 7.7-9.8 0-5.6-4.9-9.7-13-9.7-13.5 0-25.5 12.5-25.5 29.8 0 13.4 7.6 22.2 19.4 22.2 12.5 0 19.8-12.5 19.8-16.5 0-.9-.5-1.2-1-.1.2z" fill="#ffffff" />
            </svg>
            <div className="absolute -bottom-2.5 -left-1 px-2.5 py-0.5 rounded-full bg-[#7D2AE7] text-[10px] font-bold text-white border border-[#050505] shadow-lg">
              Pro
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap px-2 py-0.5 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-mono text-neutral-200 shadow-xl z-30">
            Canva
          </div>
        </div>

        {/* 5. GOOGLE ADS (Far Right) */}
        <div className="floating-app-node anim-float-2 absolute top-[40%] right-[1%] lg:right-[3%] z-20 group cursor-pointer">
          <div className="relative flex items-center justify-center w-16 h-16 lg:w-19 lg:h-19 rounded-[22px] bg-[#1a1b20] border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.2)] group-hover:scale-110 group-hover:border-white/40 transition-all duration-300 p-2.5">
            <div className="w-full h-full rounded-full flex items-center justify-center p-1.5 shadow-md overflow-hidden">
              <svg viewBox="0 -13 256 256" className="w-full h-full" fill="none">
                <g>
                  <path
                    d="M5.888,166.405103 L90.88,20.9 C101.676138,27.2558621 156.115862,57.3844138 164.908138,63.1135172 L79.9161379,208.627448 C70.6206897,220.906621 -5.888,185.040138 5.888,166.396276 L5.888,166.405103 Z"
                    fill="#FBBC04"
                  />
                  <path
                    d="M250.084224,166.401789 L165.092224,20.9055131 C153.210293,1.13172 127.619121,-6.05393517 106.600638,5.62496138 C85.582155,17.3038579 79.182155,42.4624786 91.0640861,63.1190303 L176.056086,208.632961 C187.938017,228.397927 213.52919,235.583582 234.547672,223.904686 C254.648086,212.225789 261.966155,186.175582 250.084224,166.419444 L250.084224,166.401789 Z"
                    fill="#4285F4"
                  />
                  <ellipse
                    fill="#34A853"
                    cx="42.6637241"
                    cy="187.924414"
                    rx="42.6637241"
                    ry="41.6044138"
                  />
                </g>
              </svg>
            </div>
            <div className="absolute -bottom-2 -left-2 px-2 py-0.5 rounded-full bg-[#4285F4] text-[9px] font-mono font-bold text-white border border-[#050505] shadow-lg">
              Ads
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap px-2 py-0.5 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-mono text-neutral-200 shadow-xl z-30">
            Google Ads
          </div>
        </div>

        {/* 6. GOOGLE ANALYTICS (Bottom Left) */}
        <div className="floating-app-node anim-float-4 absolute bottom-[10%] left-[18%] lg:left-[20%] z-20 group cursor-pointer">
          <div className="relative flex items-center justify-center w-16 h-16 lg:w-19 lg:h-19 rounded-[22px] bg-[#1a1b20] border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.2)] group-hover:scale-110 group-hover:border-white/40 transition-all duration-300 p-3.5">
            <svg viewBox="0 0 192 192" className="w-full h-full">
              <path d="M152 24v144c0 13.255-10.745 24-24 24s-24-10.745-24-24V24c0-13.255 10.745-24 24-24s24 10.745 24 24z" fill="#F9AB00" />
              <path d="M96 80v88c0 13.255-10.745 24-24 24s-24-10.745-24-24V80c0-13.255 10.745-24 24-24s24 10.745 24 24z" fill="#E37400" />
              <circle cx="36" cy="168" r="24" fill="#E37400" />
            </svg>
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-[9px] font-mono text-amber-400 border border-amber-500/30 shadow-lg">
              GA4
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap px-2 py-0.5 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-mono text-neutral-200 shadow-xl z-30">
            Google Analytics
          </div>
        </div>

        {/* 7. META (Bottom Center / Right) */}
        <div className="floating-app-node anim-float-2 absolute bottom-[8%] right-[22%] lg:right-[24%] z-20 group cursor-pointer">
          <div className="relative flex items-center justify-center w-16 h-16 lg:w-19 lg:h-19 rounded-[22px] bg-[#1a1b20] border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.2)] group-hover:scale-110 group-hover:border-white/40 transition-all duration-300 p-3.5">
            <svg className="w-full h-full" fill="#0081FB" viewBox="0 0 32 32">
              <path d="M5,19.5c0-4.6,2.3-9.4,5-9.4c1.5,0,2.7,0.9,4.6,3.6c-1.8,2.8-2.9,4.5-2.9,4.5c-2.4,3.8-3.2,4.6-4.5,4.6 C5.9,22.9,5,21.7,5,19.5 M20.7,17.8L19,15c-0.4-0.7-0.9-1.4-1.3-2c1.5-2.3,2.7-3.5,4.2-3.5c3,0,5.4,4.5,5.4,10.1 c0,2.1-0.7,3.3-2.1,3.3S23.3,22,20.7,17.8 M16.4,11c-2.2-2.9-4.1-4-6.3-4C5.5,7,2,13.1,2,19.5c0,4,1.9,6.5,5.1,6.5 c2.3,0,3.9-1.1,6.9-6.3c0,0,1.2-2.2,2.1-3.7c0.3,0.5,0.6,1,0.9,1.6l1.4,2.4c2.7,4.6,4.2,6.1,6.9,6.1c3.1,0,4.8-2.6,4.8-6.7 C30,12.6,26.4,7,22.1,7C19.8,7,18,8.8,16.4,11" />
            </svg>
            <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white border border-[#050505] shadow-lg">
              420
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap px-2 py-0.5 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-mono text-neutral-200 shadow-xl z-30">
            Meta
          </div>
        </div>

        {/* Centerpiece Desktop Headline & 3 Monospace Metric Columns */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-xl lg:max-w-2xl px-4 py-8">
          <h2 className="reference-text-elem text-4xl lg:text-5xl xl:text-6xl font-normal tracking-tight text-white leading-[1.15] font-['Space_Grotesk',sans-serif]">
            The current way we{" "}
            <span className="block font-medium">work is seamless.</span>
          </h2>

          <p className="reference-text-elem font-['Space_Grotesk',sans-serif] text-sm lg:text-base text-neutral-400 mt-3 max-w-md font-normal leading-relaxed">
            All your design tools, 3D engines, marketing channels, and AI intelligence unified into a single frictionless pipeline.
          </p>

          <div className="reference-text-elem grid grid-cols-3 gap-6 lg:gap-8 mt-10 lg:mt-14 w-full text-left border-t border-neutral-800/60 pt-6 lg:pt-8">
            <div className="flex flex-col">
              <span className="font-mono text-xs lg:text-[13px] text-neutral-300 leading-relaxed font-normal">
                2x more speed occurs when eliminating manual handoffs.
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs lg:text-[13px] text-neutral-300 leading-relaxed font-normal">
                Constant AI integration eliminates workflow friction.
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs lg:text-[13px] text-neutral-300 leading-relaxed font-normal">
                100% unified attribution across every ad channel.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsAndTechnology;
