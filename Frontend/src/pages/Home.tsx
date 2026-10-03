import React, { Suspense, useEffect, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, ScrollControls, useScroll } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MacContainer from '../components/Home_Animation/MacContainer.tsx'
import InstagramAnimation from '../components/Home_Animation/InstagramAnimation.tsx'
import YoutubeAnimation from '../components/Home_Animation/YoutubeAnimation.tsx'
import PinterestAnimation from '../components/Home_Animation/PinterestAnimation.tsx'
import TikTokAnimation from '../components/Home_Animation/TikTokAnimation.tsx'

// Clean Vector Icons for Luxury Social Links
const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

gsap.registerPlugin(ScrollTrigger);

function ScrollTriggerSync({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const scrollData = useScroll();

  useFrame(() => {
    if (scrollData) {
      scrollData.offset = progressRef.current;
    }
  });

  return null;
}

function CanvasReadyNotifier({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return null;
}

interface HomeProps {
  on3DReady?: () => void;
}

function Home({ on3DReady }: HomeProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const fgUiRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<number>(0);

  const handle3DReady = useCallback(() => {
    on3DReady?.();
    window.dispatchEvent(new CustomEvent("3d-model-ready"));
  }, [on3DReady]);

  // GSAP ScrollTrigger Pinning for smooth 5-stage laptop animation and synced 2-layer text parallax
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=3200", // Distance user scrolls through the 5 pages of 3D animation
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        anticipatePin: 1,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;

          // Parallax & smooth depth fading for the background text layer
          if (bgTextRef.current) {
            const p = self.progress;
            gsap.to(bgTextRef.current, {
              y: -p * 90,
              scale: 1 + p * 0.06,
              opacity: p > 0.4 ? Math.max(0, 1 - (p - 0.4) * 2.5) : 1,
              overwrite: "auto",
              duration: 0.1,
            });
          }

          // Smooth fade out of the bottom UI corners as user dives deep into 3D stages
          if (fgUiRef.current) {
            const p = self.progress;
            gsap.to(fgUiRef.current, {
              opacity: p > 0.25 ? Math.max(0, 1 - (p - 0.25) * 3) : 1,
              y: p * 40,
              overwrite: "auto",
              duration: 0.1,
            });
          }
        },
      });

      // Initial smooth reveal animation for the background text
      if (bgTextRef.current) {
        gsap.fromTo(
          bgTextRef.current.querySelectorAll(".hero-text-item"),
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: "power3.out", delay: 0.2 }
        );
      }
      if (fgUiRef.current) {
        gsap.fromTo(
          fgUiRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.6 }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <main
      id="home-section"
      ref={sectionRef}
      className="relative bg-[#050505] w-full h-screen text-white overflow-hidden select-none flex flex-col justify-between"
    >
      {/* =========================================================================
          LAYER 0: BOTTOM / BACKGROUND LAYER (BEHIND 3D MODEL)
          Luxury Fluid Backing + Massive Top Typography + Tagline
         ========================================================================= */}
      <div
        ref={bgTextRef}
        className="absolute inset-0 z-0 pointer-events-none flex flex-col justify-between pt-16 sm:pt-20 lg:pt-24 px-6 sm:px-12 lg:px-20 overflow-hidden"
      >
        {/* Subtle Luxury Atmospheric Silk Curves & Ambient Light */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-white/[0.03] blur-[160px] rounded-full" />
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[400px] bg-neutral-400/[0.015] blur-[140px] rounded-full" />
        </div>

        {/* Top Hero Typography (Behind 3D Model) */}
        <div className="relative z-10 flex flex-col items-start w-full max-w-8xl mx-auto">
          <h1
            className="hero-text-item font-serif font-bold uppercase text-white tracking-[0.06em] sm:tracking-[0.12em] md:tracking-[0.16em] leading-none select-none text-left w-full"
            style={{
              fontSize: "clamp(2.5rem, 8.2vw, 7.8rem)",
            }}
          >
            BHARAT <br/> DIGIGURU
          </h1>

          {/* Subtitle directly under title on left */}
          <div className="hero-text-item flex items-center gap-3 mt-3 sm:mt-4">
            <span className="w-8 sm:w-12 h-[1.5px] bg-white/50" />
            <span className="font-mono text-[10px] sm:text-xs md:text-[13px] tracking-[0.25em] text-neutral-400 uppercase font-medium">
              Elevate the Vision.
            </span>
          </div>
        </div>

        {/* Empty bottom spacing spacer for alignment */}
        <div className="h-28" />
      </div>

      {/* =========================================================================
          LAYER 1: MIDDLE LAYER (3D CANVAS WITH MACBOOK & SOCIALS)
         ========================================================================= */}
      <div className="absolute inset-0 z-10 w-full h-full">
        <div className="w-full h-full">
          <Canvas
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            camera={{ position: [0, 4.3, 38], fov: 40 }}
          >
            <Suspense fallback={null}>
              <CanvasReadyNotifier onReady={handle3DReady} />
              <Environment preset="city" />
              <ScrollControls pages={5} damping={0.15}>
                <ScrollTriggerSync progressRef={progressRef} />
                <MacContainer />
                <InstagramAnimation />
                <YoutubeAnimation />
                <PinterestAnimation />
                <TikTokAnimation />
              </ScrollControls>
            </Suspense>
          </Canvas>
        </div>
      </div>

      {/* =========================================================================
          LAYER 2: FRONT / FOREGROUND UI LAYER (IN FRONT OF 3D CANVAS)
          Bottom Left Statement + Bottom Center Capsule Scroll Pill + Bottom Right Socials
          Positioned with clearance above floating navbar
         ========================================================================= */}
      <div
        ref={fgUiRef}
        className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-end p-6 sm:p-10 lg:p-14 pb-24 sm:pb-28 lg:pb-24"
      >
        <div className="w-full max-w-8xl mx-auto flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 sm:gap-6">
          
          {/* Bottom Left: Luxury Statement */}
          <div className="flex flex-col gap-1 text-center sm:text-left max-w-xs sm:max-w-sm">
            <p className="font-mono text-[9px] sm:text-[11px] text-neutral-300 uppercase tracking-widest leading-relaxed">
              Set Your Digital Horizon: Where High-Fashion Strategy
            </p>
            <p className="font-mono text-[9px] sm:text-[11px] text-neutral-500 uppercase tracking-widest leading-relaxed">
              Meets Photorealistic Digital Craft.
            </p>
          </div>

          {/* Bottom Right: Luxury Social Media Links */}
          <div className="pointer-events-auto flex items-center gap-3.5 sm:gap-4 text-neutral-400">
            <a
              href="https://www.instagram.com/banarasi_chap/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white hover:scale-110 transition-all p-1.5"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white hover:scale-110 transition-all p-1.5"
              aria-label="Twitter / X"
            >
              <TwitterIcon />
            </a>
            <a
              href="https://www.facebook.com/banarasichap"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white hover:scale-110 transition-all p-1.5"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://www.linkedin.com/in/shubhsingh04/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white hover:scale-110 transition-all p-1.5"
              aria-label="LinkedIn"
            >
              <LinkedinIcon />
            </a>
            <a
              href="https://www.youtube.com/@banarasichap"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white hover:scale-110 transition-all p-1.5"
              aria-label="YouTube"
            >
              <YoutubeIcon />
            </a>
          </div>

        </div>
      </div>
    </main>
  )
}

export default Home;
