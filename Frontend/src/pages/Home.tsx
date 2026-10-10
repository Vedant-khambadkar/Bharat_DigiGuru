import { Suspense, useEffect, useRef, useCallback, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MacContainer from '../components/Home_Animation/MacContainer.tsx'
import InstagramAnimation from '../components/Home_Animation/InstagramAnimation.tsx'
import YoutubeAnimation from '../components/Home_Animation/YoutubeAnimation.tsx'
import PinterestAnimation from '../components/Home_Animation/PinterestAnimation.tsx'
import TikTokAnimation from '../components/Home_Animation/TikTokAnimation.tsx'
import KeyboardEditorialOverlay from '../components/Home_Animation/KeyboardEditorialOverlay.tsx'
import { HomeScrollContext } from '../components/Home_Animation/HomeScrollContext.tsx'
import ModelLoader from '../components/ModelLoader/ModelLoader.tsx'
import ModelErrorBoundary from '../components/ModelLoader/ModelErrorBoundary.tsx'
import * as THREE from "three"

gsap.registerPlugin(ScrollTrigger);

const RAD_CAM_ROT_X = THREE.MathUtils.degToRad(-2);
const RAD_CAM_ROT_Y = THREE.MathUtils.degToRad(6);

function HomeWebGLContextLossHandler() {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn("[Hero WebGL] Context lost, pausing rendering");
    };
    const handleContextRestored = () => {
      console.log("[Hero WebGL] Context restored");
      gl.renderLists?.dispose();
    };
    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    canvas.addEventListener("webglcontextrestored", handleContextRestored, false);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    };
  }, [gl]);
  return null;
}

function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!camera || !(camera as THREE.PerspectiveCamera).isPerspectiveCamera) return;
    const pCam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(size.height, 1);

    if (aspect < 0.75) {
      pCam.fov = 46;
      pCam.position.set(0, 4.4, 39);
    } else if (aspect < 1.2) {
      pCam.fov = 42;
      pCam.position.set(0, 4.3, 38.5);
    } else {
      pCam.fov = 40;
      pCam.position.set(0, 4.3, 38);
    }
    pCam.rotation.set(RAD_CAM_ROT_X, RAD_CAM_ROT_Y, 0);
    pCam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

function CanvasReadyNotifier({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      (window as any).__bdgMacStartTime = (window as any).__bdgMacStartTime || performance.now();
      onReady();
    });
    return () => cancelAnimationFrame(rafId);
  }, [onReady]);

  return null;
}

interface HomeProps {
  onMacReady?: () => void;
  onMacError?: (error: Error) => void;
}

function Home({ onMacReady, onMacError }: HomeProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<number>(0);
  const [isSectionVisible, setIsSectionVisible] = useState(true);
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;

  // IntersectionObserver to pause MacBook WebGL rendering when Home section is scrolled past
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting);
      },
      { rootMargin: "150px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleCanvasReady = useCallback(() => {
    // Canvas WebGL context is initialized
  }, []);

  const handleMacReady = useCallback(() => {
    onMacReady?.();
    window.dispatchEvent(new CustomEvent("3d-model-ready"));
  }, [onMacReady]);

  const handleModelError = useCallback((error: Error) => {
    console.error("[HERO] MacBook model loading error:", error);
    onMacError?.(error);
  }, [onMacError]);

  // GSAP ScrollTrigger Pinning for ultra-smooth 5-stage laptop animation
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
        scrub: 0.5,
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
      className="relative bg-[#050505] w-full h-screen text-white overflow-hidden select-none flex flex-col justify-between"
    >
      {/* =========================================================================
          LAYER 0: EDITORIAL HUD & TYPOGRAPHIC OVERLAY (WITH STOCHASTIC DISSOLVE)
         ========================================================================= */}
      <KeyboardEditorialOverlay scrollProgressRef={progressRef} />

      {/* =========================================================================
          LAYER 1: 3D CANVAS WITH MACBOOK & SOCIALS
         ========================================================================= */}
      <div className="absolute inset-0 z-10 w-full h-full pointer-events-none touch-pan-y">
        <div className="w-full h-full pointer-events-none">
          <Canvas
            frameloop={isSectionVisible ? "always" : "never"}
            dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, isMobile ? 1.0 : 1.35)]}
            gl={{
              antialias: !isMobile,
              alpha: true,
              powerPreference: "high-performance",
              stencil: false,
              depth: true,
              preserveDrawingBuffer: false,
            }}
            camera={{ position: [0, 4.3, 38], fov: 40 }}
            style={{ touchAction: "pan-y", pointerEvents: "none" }}
            className="w-full h-full block pointer-events-none touch-pan-y"
          >
            <HomeWebGLContextLossHandler />
            <ResponsiveCamera />
            <CanvasReadyNotifier onReady={handleCanvasReady} />
            <ambientLight intensity={1.8} />
            <directionalLight position={[10, 15, 10]} intensity={2.2} color="#ffffff" />
            <directionalLight position={[-10, 8, -5]} intensity={0.9} color="#90b0e0" />
            <HomeScrollContext.Provider value={{ scrollProgressRef: progressRef }}>
              <ModelErrorBoundary fallback={null} onError={handleModelError}>
                <Suspense fallback={<ModelLoader label="Loading MacBook" />}>
                  <MacContainer onReady={handleMacReady} />
                </Suspense>
              </ModelErrorBoundary>
              <InstagramAnimation />
              <YoutubeAnimation />
              <PinterestAnimation />
              <TikTokAnimation />
            </HomeScrollContext.Provider>
          </Canvas>
        </div>
      </div>
    </main>
  );
}

export default Home;
