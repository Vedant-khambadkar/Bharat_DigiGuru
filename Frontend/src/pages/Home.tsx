import React, { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, ScrollControls, useProgress, useScroll } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MacContainer from '../components/Home_Animation/MacContainer.tsx'
import InstagramAnimation from '../components/Home_Animation/InstagramAnimation.tsx'
import YoutubeAnimation from '../components/Home_Animation/YoutubeAnimation.tsx'
import PinterestAnimation from '../components/Home_Animation/PinterestAnimation.tsx'
import TikTokAnimation from '../components/Home_Animation/TikTokAnimation.tsx'

gsap.registerPlugin(ScrollTrigger);

interface HomeProps {
  onFramesProgress?: (progress: number, isComplete: boolean) => void;
}

function ProgressTracker({ onProgress }: { onProgress?: (progress: number, isComplete: boolean) => void }) {
  const { progress, active } = useProgress();

  useEffect(() => {
    onProgress?.(progress, !active || progress >= 100);
  }, [progress, active, onProgress]);

  return null;
}

function ScrollTriggerSync({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const scrollData = useScroll();

  useFrame(() => {
    if (scrollData) {
      scrollData.offset = progressRef.current;
    }
  });

  return null;
}

function Home({ onFramesProgress }: HomeProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<number>(0);

  // GSAP ScrollTrigger Pinning for smooth 5-stage laptop animation
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
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <main
      id="home-section"
      ref={sectionRef}
      className="relative bg-[#050505] w-full h-screen text-white overflow-hidden select-none"
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 4.3, 38], fov: 40 }}
      >
        <ProgressTracker onProgress={onFramesProgress} />
        <Suspense fallback={null}>
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
    </main>
  )
}

export default Home
