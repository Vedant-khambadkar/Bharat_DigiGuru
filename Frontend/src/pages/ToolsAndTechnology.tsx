import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const ToolsAndTechnology: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        ".tech-title-wrap",
        { opacity: 0, y: -20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Center Hub pop-in
      gsap.fromTo(
        ".center-hub-card",
        { opacity: 0, scale: 0.6 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: stageRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Surrounding badges pop-in
      gsap.fromTo(
        ".tech-card-badge",
        { opacity: 0, scale: 0.6, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: stageRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Connection lines fade & glow in
      gsap.fromTo(
        ".connection-wire",
        { opacity: 0 },
        {
          opacity: 0.85,
          duration: 1.0,
          stagger: 0.04,
          ease: "power2.out",
          scrollTrigger: {
            trigger: stageRef.current,
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
      id="tools-and-technology-section"
      className="relative w-full min-h-screen flex flex-col justify-center items-center py-8 sm:py-12 text-white font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden select-none"
    >
      <style>{`
        @keyframes floatAnim1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(0.6deg); }
        }
        @keyframes floatAnim2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(5px) rotate(-0.6deg); }
        }
        @keyframes floatAnim3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .anim-badge-1 { animation: floatAnim1 5.5s ease-in-out infinite; }
        .anim-badge-2 { animation: floatAnim2 6.5s ease-in-out infinite; }
        .anim-badge-3 { animation: floatAnim3 7s ease-in-out infinite; }

        .wire-pulse {
          stroke-dasharray: 4 4;
          animation: wireDash 14s linear infinite;
        }
        @keyframes wireDash {
          from { stroke-dashoffset: 200; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Ambient Subtle Violet Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[650px] sm:w-[850px] h-[300px] sm:h-[380px]  blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center">
        
        {/* Section Heading */}
        <div className="tech-title-wrap text-center mb-4 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-[46px] font-bold tracking-tight text-white leading-tight">
            Tools & {" "}
            <span className="bg-gradient-to-r from-[#A78BFA] via-[#F472B6] to-[#FB923C] bg-clip-text text-transparent">
              Technology
            </span>
          </h2>
          <h3 className="text-white">Modern tools for professional execution</h3>
        </div>

        {/* 3D Claymorphic Single-Screen Diagram Stage */}
        <div
          ref={stageRef}
          className="relative w-full h-[380px] sm:h-[460px] md:h-[500px] flex items-center justify-center"
        >
          {/* SVG Connection Cables */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 1000 600"
            preserveAspectRatio="xMidYMid meet"
            fill="none"
          >
            <defs>
              <linearGradient id="techWireLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.35" />
              </linearGradient>
              <linearGradient id="techWireRight" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#F472B6" stopOpacity="0.35" />
              </linearGradient>
            </defs>

            {/* 1. Wire to Canva (Top-Left Node) */}
            <path
              className="connection-wire wire-pulse"
              d="M 455 245 C 410 210 365 170 320 120"
              stroke="url(#techWireLeft)"
              strokeWidth="2.2"
            />

            {/* 2. Wire to Figma (Top-Right Node) */}
            <path
              className="connection-wire wire-pulse"
              d="M 545 245 C 590 210 635 170 680 130"
              stroke="url(#techWireRight)"
              strokeWidth="2.2"
            />

            {/* 3. Wire to Meta (Left Node) */}
            <path
              className="connection-wire wire-pulse"
              d="M 430 288 C 340 288 250 275 160 265"
              stroke="url(#techWireLeft)"
              strokeWidth="2.2"
            />

            {/* 4. Wire to Schedulers (Right Node) */}
            <path
              className="connection-wire wire-pulse"
              d="M 570 288 C 660 288 750 275 840 265"
              stroke="url(#techWireRight)"
              strokeWidth="2.2"
            />

            {/* 5. Wire to Google Analytics (Bottom-Left Node) */}
            <path
              className="connection-wire wire-pulse"
              d="M 455 335 C 390 375 330 410 270 440"
              stroke="url(#techWireLeft)"
              strokeWidth="2.2"
            />

            {/* 6. Wire to ChatGPT / AI Tools (Bottom Node) */}
            <path
              className="connection-wire wire-pulse"
              d="M 500 348 C 480 395 455 435 430 475"
              stroke="url(#techWireLeft)"
              strokeWidth="2.2"
            />

            {/* 7. Wire to Content Calendar Tools (Bottom-Right Node) */}
            <path
              className="connection-wire wire-pulse"
              d="M 545 335 C 610 375 670 410 730 440"
              stroke="url(#techWireRight)"
              strokeWidth="2.2"
            />
          </svg>

          {/* ---------------- 1. CENTRAL HUB: GOOGLE WORKSPACE ---------------- */}
          <div className="center-hub-card absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer">
            <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-[22px] sm:rounded-[26px] md:rounded-[30px] bg-gradient-to-b from-[#2c2d35] via-[#1f2026] to-[#15161a] border border-white/[0.18] shadow-[0_16px_40px_rgba(0,0,0,0.9),inset_0_1.5px_2px_rgba(255,255,255,0.28),inset_0_-2px_4px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300">

              {/* Google Workspace SVG */}
              <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14" viewBox="0 0 48 48" fill="none">
                <path d="M6 13.5V36C6 38.21 7.79 40 10 40H14V21.5L6 13.5Z" fill="#4285F4" />
                <path d="M42 13.5L34 21.5V40H38C40.21 40 42 38.21 42 36V13.5Z" fill="#34A853" />
                <path d="M34 10.5V21.5L42 13.5V12C42 8.67 38.16 6.8 35.5 8.8L34 10.5Z" fill="#FBBC04" />
                <path d="M14 21.5V10.5L24 18L34 10.5V21.5L24 29L14 21.5Z" fill="#EA4335" />
                <path d="M6 12V13.5L14 21.5V10.5L12.5 8.8C9.84 6.8 6 8.67 6 12Z" fill="#C5221F" />
              </svg>
            </div>
            {/* Tooltip */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap px-2 py-0.5 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-mono text-neutral-200 shadow-xl z-30">
              Google Workspace
            </div>
          </div>

          {/* ---------------- 2. CANVA (Top Left) ---------------- */}
          <div className="tech-card-badge anim-badge-1 absolute top-[4%] left-[25%] sm:left-[27%] z-10 group cursor-pointer">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-[18px] sm:rounded-[22px] md:rounded-[26px] bg-gradient-to-b from-[#2a2b32] via-[#1e1f24] to-[#141518] border border-white/[0.14] shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1.5px_1px_rgba(255,255,255,0.22)] group-hover:scale-108 transition-transform duration-300">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="canvaOfficialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00C4CC" />
                    <stop offset="50%" stopColor="#7D2AE8" />
                    <stop offset="100%" stopColor="#00C4CC" />
                  </linearGradient>
                </defs>
                <circle cx="12" cy="12" r="10" fill="url(#canvaOfficialGrad)" />
                <path d="M14.5 9.2C13.8 8.4 12.8 8 11.6 8C9.2 8 7.5 9.8 7.5 12.2C7.5 14.6 9.2 16.4 11.6 16.4C13.1 16.4 14.1 15.6 14.7 14.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap px-2 py-0.5 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-mono text-neutral-200 shadow-xl z-30">
              Canva
            </div>
          </div>

          {/* ---------------- 3. FIGMA (Top Right) ---------------- */}
          <div className="tech-card-badge anim-badge-2 absolute top-[6%] right-[24%] sm:right-[26%] z-10 group cursor-pointer">
            <div className="flex items-center justify-center w-17 h-17 sm:w-21 sm:h-21 md:w-24 md:h-24 rounded-[20px] sm:rounded-[24px] md:rounded-[28px] bg-gradient-to-b from-[#2a2b32] via-[#1e1f24] to-[#141518] border border-white/[0.14] shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1.5px_1px_rgba(255,255,255,0.22)] group-hover:scale-108 transition-transform duration-300">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11" viewBox="0 0 38 57" fill="none">
                <path d="M19 28.5A9.5 9.5 0 1 1 28.5 19 9.5 9.5 0 0 1 19 28.5z" fill="#1ABCFE" />
                <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
                <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
                <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
                <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
              </svg>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap px-2 py-0.5 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-mono text-neutral-200 shadow-xl z-30">
              Figma
            </div>
          </div>

          {/* ---------------- 4. META BUSINESS SUITE (Far Left) ---------------- */}
          <div className="tech-card-badge anim-badge-3 absolute top-[44%] left-[6%] sm:left-[10%] z-10 group cursor-pointer">
            <div className="flex items-center justify-center w-13 h-13 sm:w-15 sm:h-15 md:w-17 md:h-17 rounded-[16px] sm:rounded-[18px] md:rounded-[20px] bg-gradient-to-b from-[#2a2b32] via-[#1e1f24] to-[#141518] border border-white/[0.14] shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1.5px_1px_rgba(255,255,255,0.22)] group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-[#0081FB]" viewBox="0 0 24 24">
                <path d="M23.998 12c0-3.26-1.5-6.17-4.1-8.15-2.61-1.99-6.02-2.75-9.37-2.11C5.74 2.66 2.06 6.34.99 11.12c-1.1 4.9 1.1 9.9 5.3 12.07 1.34.69 2.81 1.05 4.3 1.05 1.88 0 3.73-.57 5.32-1.66 3.65-2.51 5.74-6.68 5.74-11.08l-.65.5zM12.05 14.88c-1.63 0-3.07-.86-3.86-2.27-.79-1.41-.75-3.12.11-4.48.86-1.37 2.37-2.18 3.99-2.14 1.62.03 3.09.91 3.86 2.32.77 1.42.71 3.13-.17 4.49-.88 1.35-2.37 2.13-3.93 2.08zm-7.61-3.23c.31-1.33 1.08-2.5 2.18-3.3 1.09-.8 2.43-1.19 3.78-1.09-1.55 1.47-2.36 3.51-2.24 5.61-.92-.27-1.74-.83-2.35-1.58-.6-.74-.95-1.64-.99-2.59l-.38 2.95zm14.8 1.2c-.44 1.29-1.32 2.36-2.48 3.01-1.17.65-2.52.82-3.81.47 1.54-1.48 2.34-3.53 2.2-5.63.92.29 1.73.86 2.32 1.62.6.76.93 1.68.95 2.64l.82-2.11z" />
              </svg>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap px-2 py-0.5 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-mono text-neutral-200 shadow-xl z-30">
              Meta Suite
            </div>
          </div>

          {/* ---------------- 5. SOCIAL MEDIA SCHEDULERS (Middle Right) ---------------- */}
          <div className="tech-card-badge anim-badge-1 absolute top-[44%] right-[6%] sm:right-[10%] z-10 group cursor-pointer">
            <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-[17px] sm:rounded-[20px] md:rounded-[22px] bg-gradient-to-b from-[#2a2b32] via-[#1e1f24] to-[#141518] border border-white/[0.14] shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1.5px_1px_rgba(255,255,255,0.22)] group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="schedOfficialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
                <rect x="3" y="4" width="18" height="17" rx="4" stroke="url(#schedOfficialGrad)" strokeWidth="2.2" />
                <path d="M16 2v4M8 2v4M3 9h18" stroke="url(#schedOfficialGrad)" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="12" cy="14.5" r="2.5" fill="#00F0FF" />
                <path d="M12 13.5v1.5l1 1" stroke="#000" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap px-2 py-0.5 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-mono text-neutral-200 shadow-xl z-30">
              Schedulers
            </div>
          </div>

          {/* ---------------- 6. GOOGLE ANALYTICS (Lower Left) ---------------- */}
          <div className="tech-card-badge anim-badge-2 absolute top-[68%] left-[20%] sm:left-[22%] z-10 group cursor-pointer">
            <div className="flex items-center justify-center w-14 h-14 sm:w-17 sm:h-17 md:w-19 md:h-19 rounded-[17px] sm:rounded-[20px] md:rounded-[22px] bg-gradient-to-b from-[#2a2b32] via-[#1e1f24] to-[#141518] border border-white/[0.14] shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1.5px_1px_rgba(255,255,255,0.22)] group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none">
                <path d="M22 19.5H2" stroke="#E37400" strokeWidth="2.2" strokeLinecap="round" />
                <rect x="16.5" y="4.5" width="4" height="15" rx="2" fill="#F9AB00" />
                <rect x="10" y="9.5" width="4" height="10" rx="2" fill="#E37400" />
                <circle cx="5.5" cy="17" r="2.5" fill="#E37400" />
              </svg>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap px-2 py-0.5 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-mono text-neutral-200 shadow-xl z-30">
              Analytics
            </div>
          </div>

          {/* ---------------- 7. CHATGPT / AI TOOLS (Bottom Inner Left) ---------------- */}
          <div className="tech-card-badge anim-badge-3 absolute top-[76%] left-[36%] sm:left-[38%] z-10 group cursor-pointer">
            <div className="flex items-center justify-center w-14 h-14 sm:w-17 sm:h-17 md:w-19 md:h-19 rounded-[17px] sm:rounded-[20px] md:rounded-[22px] bg-gradient-to-b from-[#2a2b32] via-[#1e1f24] to-[#141518] border border-white/[0.14] shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1.5px_1px_rgba(255,255,255,0.22)] group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 fill-white" viewBox="0 0 24 24">
                <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 8.737a4.485 4.485 0 0 1 2.345-2.02v5.67a.78.78 0 0 0 .392.682l5.843 3.37-2.02 1.168a.071.071 0 0 1-.065.007L4.015 14.82A4.503 4.503 0 0 1 2.34 8.737zm16.597 3.846-5.843-3.37 2.02-1.168a.076.076 0 0 1 .065-.008l4.82 2.782a4.504 4.504 0 0 1-.676 8.105v-5.659a.79.79 0 0 0-.386-.682zm2.011-3.024-.141-.085-4.784-2.759a.776.776 0 0 0-.78 0L9.4 10.084V7.752a.08.08 0 0 1 .033-.062l4.84-2.795a4.5 4.5 0 0 1 6.678 4.818zM10.74 1.57a4.476 4.476 0 0 1 2.876 1.04l-.141.081-4.779 2.758a.795.795 0 0 0-.392.681v6.737L6.284 11.7a.071.071 0 0 1-.038-.052V6.065a4.504 4.504 0 0 1 4.494-4.494zM12 9.584l3.182 1.838v3.676L12 16.936l-3.182-1.838v-3.676L12 9.584z" />
              </svg>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap px-2 py-0.5 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-mono text-neutral-200 shadow-xl z-30">
              ChatGPT / AI
            </div>
          </div>

          {/* ---------------- 8. CONTENT CALENDAR TOOLS (Bottom Right) ---------------- */}
          <div className="tech-card-badge anim-badge-1 absolute top-[70%] right-[20%] sm:right-[22%] z-10 group cursor-pointer">
            <div className="flex items-center justify-center w-16 h-16 sm:w-19 sm:h-19 md:w-21 md:h-21 rounded-[18px] sm:rounded-[22px] md:rounded-[24px] bg-gradient-to-b from-[#2a2b32] via-[#1e1f24] to-[#141518] border border-white/[0.14] shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1.5px_1px_rgba(255,255,255,0.22)] group-hover:scale-108 transition-transform duration-300">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="calOfficialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FCB400" />
                    <stop offset="50%" stopColor="#18BFFF" />
                    <stop offset="100%" stopColor="#2D7FF9" />
                  </linearGradient>
                </defs>
                <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" fill="#1C1C1F" stroke="url(#calOfficialGrad)" strokeWidth="2" />
                <path d="M3 8.5h18M8.5 3v18" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" />
                <circle cx="14" cy="14" r="2" fill="#FCB400" />
                <circle cx="14" cy="6" r="1.2" fill="#18BFFF" />
                <circle cx="6" cy="14" r="1.2" fill="#2D7FF9" />
              </svg>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap px-2 py-0.5 rounded-full bg-neutral-900/90 border border-white/20 text-[10px] font-mono text-neutral-200 shadow-xl z-30">
              Calendar Tools
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsAndTechnology;
