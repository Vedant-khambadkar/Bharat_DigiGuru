import React, { useState, useEffect, Suspense, useCallback, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { PeopleScene } from '../components/FounderScene/PeopleScene';
import { FounderProfileModal } from '../components/FounderScene/FounderProfileModal';
import ModelLoader from '../components/ModelLoader/ModelLoader';
import ModelErrorBoundary from '../components/ModelLoader/ModelErrorBoundary';
import desktopVignette from '../assets/Monochrome Vignette White Space.png';
import mobileVignette from '../assets/Minimalist Black and White Vignette  mobile.png';
import type { SceneState } from '../types/scene';

/**
 * Preload appropriate 2D vignette background asset based on viewport without preloading both
 */
export const preloadOurTeamAssets = async () => {
  try {
    const isMobileViewport = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    const targetSrc = isMobileViewport ? mobileVignette : desktopVignette;

    const img = new Image();
    img.src = targetSrc;
  } catch (err) {
    console.warn("OurTeam asset preload notice:", err);
  }
};

interface OurTeamProps {
  onBusinessmanReady?: () => void;
  onBusinessmanError?: (error: Error) => void;
}

export const OurTeam: React.FC<OurTeamProps> = ({
  onBusinessmanReady,
  onBusinessmanError,
}) => {
  const [sceneState, setSceneState] = useState<SceneState>('overview');
  const sectionRef = useRef<HTMLElement>(null);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // IntersectionObserver to pause all WebGL execution when OurTeam section is offscreen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting);
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Optimized window resize listener with debounce
  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 100);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handler to trigger cinematic camera zoom into Founder
  const handleSelectFounder = useCallback(() => {
    if (sceneState === 'overview' || sceneState === 'returning') {
      setSceneState('focusing');
    }
  }, [sceneState]);

  // Handler when camera reaches the Founder
  const handleTransitionComplete = useCallback(() => {
    setSceneState('focused');
  }, []);

  // Handler when closing the Founder profile
  const handleCloseProfile = useCallback(() => {
    if (sceneState === 'focused' || sceneState === 'focusing') {
      setSceneState('returning');
    }
  }, [sceneState]);

  // Handler when camera returns to overview
  const handleReturnComplete = useCallback(() => {
    setSceneState('overview');
  }, []);

  // Memoized camera initial values
  const cameraProps = useMemo(() => ({
    position: (isMobile ? [0, 4.8, 9.8] : [0, 5.6, 12.8]) as [number, number, number],
    fov: isMobile ? 42 : 34,
    near: 0.1,
    far: 50,
  }), [isMobile]);

  return (
    <section
      ref={sectionRef}
      id="our-team-section"
      className="relative w-full h-screen min-h-[640px] max-h-[1080px] overflow-hidden select-none bg-black text-black"
    >
      {/* Background Vignette Graphic Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden bg-white">
        <img
          src={isMobile ? mobileVignette : desktopVignette}
          alt=""
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
          className="w-full h-full object-fill select-none pointer-events-none"
        />
      </div>

      {/* EXACT 1:1 TOP HEADER UI */}
      <div className="pointer-events-none absolute inset-x-0 top-6 sm:top-8 z-30 flex flex-col items-center text-center select-none px-4">
        {/* Title flanked by horizontal lines */}
        <div className="flex items-center gap-3 sm:gap-4 text-[20px] sm:text-[28px] font-mono tracking-[0.32em] text-white uppercase font-normal">
          <span className="w-6 sm:w-10 h-[1px] bg-white/40" />
          <span>THE COLLECTIVE & DIRECTION</span>
          <span className="w-6 sm:w-10 h-[1px] bg-white/40" />
        </div>
        
        {/* Subtitle */}
        <span className="text-[10px] sm:text-[16px] font-mono tracking-[0.28em] uppercase text-neutral-400 mt-1.5 font-normal">
          A VISION BUILT TOGETHER
        </span>
      </div>

      {/* LEFT SIDE INDEX RAIL (01 / 02) */}
      <div className="pointer-events-none absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-start gap-3 select-none font-mono text-[9px] sm:text-[10px] tracking-widest">
        {/* 01 Active */}
        <div className="flex items-center gap-1.5 text-white font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] shadow-[0_0_8px_#ff5500]" />
          <span>01</span>
        </div>
        {/* Vertical Rail Line */}
        <div className="w-[1px] h-6 bg-white/20 ml-[2.5px]" />
        {/* 02 Inactive */}
        <div className="text-neutral-500 font-normal pl-[9px]">
          02
        </div>
      </div>

      {/* RIGHT SIDE SCROLL TRACK */}
      <div className="pointer-events-none absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-center gap-1 select-none">
        <div className="w-[2px] h-5 bg-[#ff5500] shadow-[0_0_8px_#ff5500] rounded-full" />
        <div className="w-[1px] h-12 bg-white/20" />
      </div>

      {/* BOTTOM RIGHT: SCROLL TO EXPLORE */}
      <div className="pointer-events-none absolute right-6 sm:right-10 bottom-8 sm:bottom-12 z-30 hidden sm:flex flex-col items-end select-none text-[8px] sm:text-[9px] font-mono tracking-[0.22em] text-neutral-600 font-semibold leading-tight uppercase text-right">
        <span>SCROLL</span>
        <span>TO</span>
        <span>EXPLORE</span>
      </div>

      {/* 3D WebGL Canvas with Transparent Alpha Background */}
      <div className="relative z-10 w-full h-full touch-pan-y">
        <Canvas
          frameloop={isSectionVisible ? "always" : "never"}
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, isMobile ? 1.15 : 1.5)]}
          gl={{
            antialias: !isMobile,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.NoToneMapping,
            preserveDrawingBuffer: false,
          }}
          camera={cameraProps}
          style={{ touchAction: 'pan-y' }}
          className="w-full h-full block touch-pan-y"
        >
          <ModelErrorBoundary fallback={null} onError={onBusinessmanError}>
            <Suspense fallback={<ModelLoader theme="light" label="Loading 3D" />}>
              <PeopleScene
                sceneState={sceneState}
                onSelectFounder={handleSelectFounder}
                onTransitionComplete={handleTransitionComplete}
                onReturnComplete={handleReturnComplete}
                isMobile={isMobile}
                isVisible={isSectionVisible}
                onReady={onBusinessmanReady}
              />
            </Suspense>
          </ModelErrorBoundary>
        </Canvas>
      </div>

      {/* Founder Profile Modal */}
      <FounderProfileModal
        isOpen={sceneState === 'focused'}
        onClose={handleCloseProfile}
        isMobile={isMobile}
      />
    </section>
  );
};

export default React.memo(OurTeam);
