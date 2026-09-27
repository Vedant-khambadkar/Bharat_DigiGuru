import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  KeyboardScrollyCanvas,
  type KeyboardTheme,
  KEYBOARD_THEMES,
} from "../components/Home3D/KeyboardScrollyCanvas";
import { KeyboardEditorialOverlay } from "../components/Home3D/KeyboardEditorialOverlay";

gsap.registerPlugin(ScrollTrigger);

interface HomeProps {
  id?: string;
  onFramesProgress?: (progress: number, isComplete: boolean) => void;
}

export const Home: React.FC<HomeProps> = ({ id = "home-section", onFramesProgress }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollProgressRef = useRef(0);
  const orbitAngleRef = useRef<HTMLSpanElement>(null);
  const [activeTheme] = useState<KeyboardTheme>(KEYBOARD_THEMES[0]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=3600",
        pin: true,
        pinSpacing: true,
        scrub: true, // Seamless 1-to-1 sync with Lenis smooth momentum
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // 1. Direct ref update for Three.js and Video RAF loops (0ms overhead)
          scrollProgressRef.current = self.progress;

          // 2. Direct DOM mutation for real-time orbit angle (0ms, zero React re-render)
          if (orbitAngleRef.current) {
            orbitAngleRef.current.textContent = `${Math.round(self.progress * 360)}°`;
          }
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative z-10 w-full h-screen bg-[#050505] overflow-hidden text-white flex items-center justify-center select-none"
    >
      {/* Hardware-Accelerated 60FPS Canvas Scrolly Engine */}
      <KeyboardScrollyCanvas
        scrollProgressRef={scrollProgressRef}
        activeTheme={activeTheme}
        onProgress={onFramesProgress}
      />

      {/* Editorial Awwwards/FWA Brutalist Storytelling Overlay */}
      <KeyboardEditorialOverlay scrollProgressRef={scrollProgressRef} />
    </section>
  );
};

export default Home;
