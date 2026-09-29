import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import windowBg from "../assets/DigitalMedia/window-bg.webp";
import mobileBg from "../assets/DigitalMedia/mobile-bg.webp";
import digital1 from "../assets/DigitalMedia/DigitalMedia-1.webp";
import digital2 from "../assets/DigitalMedia/DigitalMedia-2.webp";
import digital3 from "../assets/DigitalMedia/DigitalMedia-3.webp";
import digital4 from "../assets/DigitalMedia/DigitalMedia-4.webp";

interface HomeProps {
  id?: string;
  onFramesProgress?: (progress: number, isComplete: boolean) => void;
}

const mediaThumbnails = [
  { id: 1, src: digital1, title: "Media 01" },
  { id: 2, src: digital2, title: "Media 02" },
  { id: 3, src: digital3, title: "Media 03" },
  { id: 4, src: digital4, title: "Media 04" },
];

export const Home: React.FC<HomeProps> = ({ id = "home-section", onFramesProgress }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeThumb, setActiveThumb] = useState<number | null>(null);
  const [audioTimer, setAudioTimer] = useState("00 - 00");
  const containerRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Notify preloader that initial home assets are ready
    if (onFramesProgress) {
      onFramesProgress(100, true);
    }
  }, [onFramesProgress]);

  // Synchronized Entrance Animation (Triggered ONLY when preloader finishes & Home is revealed)
  useEffect(() => {
    let hasRun = false;

    const playHomeEntranceAnimation = () => {
      if (hasRun) return;
      hasRun = true;

      const letters = containerRef.current?.querySelectorAll(".hero-char");
      const subItems = containerRef.current?.querySelectorAll(".home-sub-item");
      const bottomItems = containerRef.current?.querySelectorAll(".home-bottom-item");

      const tl = gsap.timeline({ delay: 0.1 });

      // 1. Randomized letter-by-letter reveal for DIGITAL & STUDIO
      if (letters && letters.length > 0) {
        gsap.killTweensOf(letters);
        tl.fromTo(
          letters,
          {
            opacity: 0,
            y: 40,
            scale: 0.82,
            filter: "blur(10px)",
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.95,
            ease: "power3.out",
            stagger: {
              each: 0.055,
              from: "random", // Random order across all letters
            },
          }
        );
      }

      // 2. Sub-header service lists fade & slide in
      if (subItems && subItems.length > 0) {
        tl.fromTo(
          subItems,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.06,
            ease: "power2.out",
          },
          "-=0.6"
        );
      }

      // 3. Audio visualizer and footer meta row slide in
      if (bottomItems && bottomItems.length > 0) {
        tl.fromTo(
          bottomItems,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
          },
          "-=0.5"
        );
      }
    };

    // 1. Listen for preloader reveal event when preloader counter reaches 100 & slides up
    window.addEventListener("start-hero-letters", playHomeEntranceAnimation);

    // 2. Fallback safety timer (only in case preloader is disabled or already unmounted)
    const fallbackTimer = setTimeout(() => {
      playHomeEntranceAnimation();
    }, 4500);

    return () => {
      window.removeEventListener("start-hero-letters", playHomeEntranceAnimation);
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Audio equalizer timer simulation on play
  useEffect(() => {
    if (isPlaying) {
      let seconds = 0;
      timerIntervalRef.current = setInterval(() => {
        seconds += 1;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        setAudioTimer(
          `${mins.toString().padStart(2, "0")} - ${secs.toString().padStart(2, "0")}`
        );
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setAudioTimer("00 - 00");
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying]);


  // Helper to split text into individual animated letter spans
  const renderRandomChars = (text: string) => {
    return text.split("").map((char, i) => (
      <span
        key={i}
        className="hero-char inline-block will-change-[transform,opacity,filter]"
        style={{ opacity: 0 }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  return (
    <section
      id={id}
      ref={containerRef}
      className="relative z-10 w-full min-h-screen bg-transparent text-white select-none overflow-hidden flex flex-col justify-between"
      style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
    >
      {/* ========================================================================= */}
      {/* LAYER 1: BOTTOM LAYER (BACKGROUND IMAGES - DESKTOP & MOBILE RESPONSIVE) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Desktop / Window View Background */}
        <div className="hidden md:block absolute inset-0 w-full h-full">
          <img
            src={windowBg}
            alt="Digital Studio Window Background"
            className="w-full h-full object-cover object-center filter contrast-[1.04] brightness-[0.96]"
          />
          {/* Subtle vignette gradients to ensure pristine blend */}
          <div className="absolute inset-0 " />
        </div>

        {/* Mobile View Background */}
        <div className="block md:hidden absolute inset-0 w-full h-full">
          <img
            src={mobileBg}
            alt="Digital Studio Mobile Background"
            className="w-full h-full object-cover object-center filter contrast-[1.04] brightness-[0.96]"
          />
          {/* Mobile ambient gradient */}
          <div className="absolute inset-0 " />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LAYER 2: AMBIENT SHIMMER & LIGHT OVERLAY */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-[1] pointer-events-none " />

      {/* ========================================================================= */}
      {/* LAYER 3: TOP LAYER (DESKTOP INTERFACE & EDITORIAL DESIGN) */}
      {/* ========================================================================= */}
      <div className="relative z-10 bg-black/60 hidden md:flex flex-col justify-between w-full h-screen px-8 lg:px-20 py-6 lg:py-8">
        {/* Top Row: Giant STUDIO - [LOGO] - DIGITAL Header */}
        <div className="w-full">
          <div className="flex items-center justify-between w-full pt-1 mt-16 lg:mt-20">
            {/* Left Giant Title */}
            <div className="flex-shrink-0">
              <h1
                className="font-archivo  text-[4.5rem] lg:text-[6.5rem] xl:text-[7.8rem] 2xl:text-[9rem] whitespace-nowrap leading-none text-white uppercase text-left tracking-tight"
              >
                {renderRandomChars("DIGITAL")}
              </h1>
            </div>

            {/* Center Spacer */}
            <div className="flex-1" />

            {/* Right Giant Title */}
            <div className="flex-shrink-0 flex justify-end">
              <h1
                className="font-archivo text-[4.5rem] lg:text-[6.5rem] xl:text-[7.8rem] 2xl:text-[9rem] whitespace-nowrap leading-none text-white uppercase text-right tracking-tight"
              >
                {renderRandomChars("STUDIO")}
              </h1>
            </div>
          </div>

          {/* Sub-Header Side Columns (Chinese on Left, English Services on Right) */}
          <div className="home-sub-item flex justify-between items-start w-full -mt-2 lg:mt-6 text-[13px] lg:text-[14px]">
            {/* Left Chinese services list */}
            <div className="flex flex-col space-y-1.5 text-neutral-300 font-sans tracking-wide">
              <p className="hover:text-white transition-colors">用心创造美好</p>
              <p className="hover:text-white transition-colors">品牌策略</p>
              <p className="hover:text-white transition-colors">内容创新</p>
              <p className="hover:text-white transition-colors">技术驱动体验</p>
            </div>

            {/* Right English services list */}
            <div className="flex flex-col space-y-1.5 text-neutral-300  text-right tracking-wide ">
              <a href="#services" className="hover:text-white transition-colors cursor-pointer ">
                Creative Strategy
              </a>
              <a href="#services" className="hover:text-white transition-colors cursor-pointer">
                Brand Identity
              </a>
              <a href="#services" className="hover:text-white transition-colors cursor-pointer">
                Creative Content
              </a>
              <a href="#services" className="hover:text-white transition-colors cursor-pointer">
                Web Design
              </a>
            </div>
          </div>
        </div>


        {/* Bottom Audio Visualizer Bar & Footer Meta Row */}
        <div className="home-bottom-item w-full space-y-4">
          {/* Audio Waveform & Equalizer Strip */}
          <div className="flex flex-col items-center justify-center w-full">
            {/* Equalizer Bars & Center Timecode */}
            <div className="flex items-center justify-center space-x-1 w-full max-w-2xl py-1">
              {/* Left waveform bars */}
              <div className="flex items-end space-x-1 flex-1 justify-end h-8 overflow-hidden pr-3">
                {[14, 20, 28, 16, 24, 32, 18, 12, 26, 30, 22, 15, 28, 10, 18, 25, 14, 20].map(
                  (h, i) => (
                    <span
                      key={`l-${i}`}
                      className={`w-[2px] bg-white/80 rounded-full transition-all duration-300 ${isPlaying ? "animate-pulse" : "opacity-60"
                        }`}
                      style={{
                        height: isPlaying ? `${Math.max(6, (h * ((i % 3) + 1)) % 32)}px` : `${h}px`,
                        animationDelay: `${i * 60}ms`,
                      }}
                    />
                  )
                )}
              </div>

              {/* Center Timecode & Tag */}
              <div className="flex flex-col items-center px-4">
                <span className="text-xs tracking-[0.2em] text-neutral-300 font-mono">
                  [ {audioTimer} ]
                </span>
                <span className="text-[10px] text-neutral-400 tracking-wider font-sans mt-0.5 whitespace-nowrap">
                  Digital Solutions, Real Impact.
                </span>
              </div>

              {/* Right waveform bars */}
              <div className="flex items-end space-x-1 flex-1 justify-start h-8 overflow-hidden pl-3">
                {[20, 14, 25, 18, 10, 28, 15, 22, 30, 26, 12, 18, 32, 24, 16, 28, 20, 14].map(
                  (h, i) => (
                    <span
                      key={`r-${i}`}
                      className={`w-[2px] bg-white/80 rounded-full transition-all duration-300 ${isPlaying ? "animate-pulse" : "opacity-60"
                        }`}
                      style={{
                        height: isPlaying ? `${Math.max(6, (h * ((i % 3) + 1)) % 32)}px` : `${h}px`,
                        animationDelay: `${i * 60}ms`,
                      }}
                    />
                  )
                )}
              </div>
            </div>

            {/* Thumbnail Strip with Play Button */}
            <div className="flex items-center space-x-1.5 p-1 bg-black/60 backdrop-blur-md rounded border border-white/10 mt-1">
              {/* Play Toggle Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all text-white rounded-sm group cursor-pointer"
                title={isPlaying ? "Pause Visualizer" : "Play Visualizer"}
              >
                {isPlaying ? (
                  <div className="flex space-x-1">
                    <span className="w-1 h-3.5 bg-white rounded-full" />
                    <span className="w-1 h-3.5 bg-white rounded-full" />
                  </div>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 ml-0.5 text-white/90 group-hover:scale-110 transition-transform"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Thumbnails */}
              {mediaThumbnails.map((thumb) => (
                <div
                  key={thumb.id}
                  onClick={() => setActiveThumb(activeThumb === thumb.id ? null : thumb.id)}
                  className={`relative w-16 h-12 overflow-hidden rounded-sm cursor-pointer border transition-all duration-200 ${activeThumb === thumb.id
                    ? "border-white scale-105 shadow-lg"
                    : "border-white/10 hover:border-white/40 opacity-85 hover:opacity-100"
                    }`}
                >
                  <img
                    src={thumb.src}
                    alt={thumb.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footer Info Strip */}
          <div className="flex items-end justify-between w-full text-[12px] lg:text-[13px] text-neutral-400 font-sans pt-2">
            {/* Left Copy */}
            <div className="leading-snug">
              <p className="text-neutral-300">Bringing Design and</p>
              <p className="text-neutral-300">Development Together for a</p>
              <p className="text-white font-medium">More Creative Future.</p>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LAYER 3 (MOBILE VIEW): EXACT RESPONSIVE MOBILE LAYOUT (3RD DESIGN)       */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex md:hidden flex-col justify-between w-full min-h-screen px-5 py-6 space-y-6">
     
        {/* Mobile Giant Stacked Typography */}
        <div className="w-full pt-2 mt-15">
          <h1
            className="font-archivo text-[3.6rem] sm:text-[4.8rem] whitespace-nowrap leading-[0.9] tracking-tight text-white uppercase text-left font-normal"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            {renderRandomChars("STUDIO")}
            <br />
            {renderRandomChars("DIGITAL")}
          </h1>

          {/* 2-Column Info (Chinese on Left, English Services on Right) */}
          <div className="home-sub-item flex justify-between mt-10 items-start w-full pt-4 text-xs font-sans">
            {/* Left Chinese text */}
            <div className="flex flex-col space-y-1 text-neutral-300 tracking-wide">
              <p>用心创造美好</p>
              <p>品牌策略</p>
              <p>内容创新</p>
              <p>技术驱动体验</p>
            </div>

            {/* Right English services */}
            <div className="flex flex-col space-y-1 text-neutral-300 text-right tracking-wide">
              <p>Creative Strategy</p>
              <p>Brand Identity</p>
              <p>Creative Content</p>
              <p>Web Design</p>
            </div>
          </div>
        </div>

        {/* Mobile Laptop Visual Spacer (Center Laptop from mobileBg is in background) */}
        <div className="w-full h-44 sm:h-56 pointer-events-none" />

      


        {/* Mobile Equalizer Waveform & Reel */}
        <div className="home-bottom-item w-full space-y-2.5">
          {/* Equalizer Waveform */}
          <div className="flex items-center justify-center space-x-1 w-full py-1">
            <div className="flex items-end space-x-0.5 flex-1 justify-end h-6 overflow-hidden pr-2">
              {[12, 18, 14, 22, 10, 16, 20, 8, 14, 18].map((h, i) => (
                <span
                  key={`m-l-${i}`}
                  className="w-[2px] bg-white/80 rounded-full"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
            <span className="text-[11px] tracking-wider text-neutral-300 font-mono px-2">
              [ {audioTimer} ]
            </span>
            <div className="flex items-end space-x-0.5 flex-1 justify-start h-6 overflow-hidden pl-2">
              {[18, 14, 8, 20, 16, 10, 22, 14, 18, 12].map((h, i) => (
                <span
                  key={`m-r-${i}`}
                  className="w-[2px] bg-white/80 rounded-full"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          </div>

         
        </div>

        {/* Mobile Footer Info */}
        <div className="w-full space-y-4 pt-1">
          <div className="flex justify-between items-start text-[11px] text-neutral-300 font-sans">
            <div className="max-w-[48%] leading-snug">
              <p>Bringing Design and</p>
              <p>Development Together for a</p>
              <p className="text-white font-medium">More Creative Future.</p>
            </div>
          
          </div>

        </div>
      </div>
    </section>
  );
};

export default Home;

