import React, { useState, useEffect, Suspense, useCallback, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { PeopleScene } from '../components/FounderScene/PeopleScene';
import { FounderProfileModal } from '../components/FounderScene/FounderProfileModal';
import { SceneLoader } from '../components/UI/SceneLoader';
import desktopVignette from '../assets/Monochrome Vignette White Space.png';
import mobileVignette from '../assets/Minimalist Black and White Vignette  mobile.png';
import type { SceneState } from '../types/scene';

export const OurTeam: React.FC = () => {
  const [sceneState, setSceneState] = useState<SceneState>('overview');
  const [isInView, setIsInView] = useState<boolean>(true);
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Pause WebGL rendering when section is offscreen to save GPU
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Optimized window resize listener
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
    position: (isMobile ? [0, 5.8, 11.2] : [0, 5.6, 12.8]) as [number, number, number],
    fov: isMobile ? 44 : 34,
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
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <img
          src={isMobile ? mobileVignette : desktopVignette}
          alt=""
          className="w-full h-full object-fill select-none pointer-events-none"
        />
      </div>

      {/* Background Editorial Header */}
      <div className="pointer-events-none absolute inset-x-0 top-10 sm:top-14 z-30 flex flex-col items-center text-center select-none px-4">
        <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase text-neutral-400 mb-1.5 font-semibold">
          THE COLLECTIVE & DIRECTION
        </span>
        
        {sceneState === 'overview' && (
          <div className="flex items-center gap-2 mt-3 px-3.5 py-1.5 bg-black/80 text-white rounded-full border border-white/20 backdrop-blur-md shadow-xl transition-all duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] text-neutral-200 uppercase font-medium">
              Click the Founder to explore profile
            </span>
          </div>
        )}
      </div>

      {/* 3D WebGL Canvas with Transparent Alpha Background */}
      <div className="relative z-10 w-full h-full">
        <Canvas
          frameloop={isInView ? "always" : "never"}
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.5)]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.NoToneMapping,
          }}
          camera={cameraProps}
          className="w-full h-full block"
        >
          <Suspense fallback={null}>
            <PeopleScene
              sceneState={sceneState}
              onSelectFounder={handleSelectFounder}
              onTransitionComplete={handleTransitionComplete}
              onReturnComplete={handleReturnComplete}
              isMobile={isMobile}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Founder Profile Modal */}
      <FounderProfileModal
        isOpen={sceneState === 'focused'}
        onClose={handleCloseProfile}
        isMobile={isMobile}
      />

      {/* Loading Screen */}
      <SceneLoader />
    </section>
  );
};

export default React.memo(OurTeam);
