import { Suspense, useEffect, useRef, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, useScroll } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MacContainer from '../components/Home_Animation/MacContainer.tsx'
import InstagramAnimation from '../components/Home_Animation/InstagramAnimation.tsx'
import YoutubeAnimation from '../components/Home_Animation/YoutubeAnimation.tsx'
import PinterestAnimation from '../components/Home_Animation/PinterestAnimation.tsx'
import TikTokAnimation from '../components/Home_Animation/TikTokAnimation.tsx'
import KeyboardEditorialOverlay from '../components/Home_Animation/KeyboardEditorialOverlay.tsx'
import * as THREE from "three"

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

function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!camera || !(camera as THREE.PerspectiveCamera).isPerspectiveCamera) return;
    const pCam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(size.height, 1);

    if (aspect < 0.75) {
      // Mobile Portrait
      pCam.fov = 54;
      pCam.position.set(0, 4.8, 42);
    } else if (aspect < 1.2) {
      // Tablet / iPad / Square
      pCam.fov = 46;
      pCam.position.set(0, 4.5, 40);
    } else {
      // Desktop & Widescreen
      pCam.fov = 40;
      pCam.position.set(0, 4.3, 38);
    }
    pCam.rotation.set(
      THREE.MathUtils.degToRad(-2),
      THREE.MathUtils.degToRad(6),
      0
    );
    pCam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

function CanvasReadyNotifier({ onReady }: { onReady: () => void }) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    try {
      gl.compile(scene, camera);
      gl.render(scene, camera);
    } catch (e) {
      console.warn("WebGL warmup compile notice:", e);
    }

    const timer = setTimeout(() => {
      onReady();
    }, 60);

    return () => clearTimeout(timer);
  }, [gl, scene, camera, onReady]);

  return null;
}

interface HomeProps {
  on3DReady?: () => void;
}

function Home({ on3DReady }: HomeProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<number>(0);

  const handle3DReady = useCallback(() => {
    on3DReady?.();
    window.dispatchEvent(new CustomEvent("3d-model-ready"));
  }, [on3DReady]);

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
      className="relative bg-[#050505] w-full h-screen text-white overflow-hidden select-none flex flex-col justify-between"
    >
      {/* =========================================================================
          LAYER 0: EDITORIAL HUD & TYPOGRAPHIC OVERLAY (WITH STOCHASTIC DISSOLVE)
         ========================================================================= */}
      <KeyboardEditorialOverlay scrollProgressRef={progressRef} />

      {/* =========================================================================
          LAYER 1: 3D CANVAS WITH MACBOOK & SOCIALS
         ========================================================================= */}
      <div className="absolute inset-0 z-10 w-full h-full">
        <div className="w-full h-full">
          <Canvas
            frameloop="always"
            dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 1.5)]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
              stencil: false,
              depth: true,
            }}
            camera={{ position: [0, 4.3, 38], fov: 40 }}
          >
            <Suspense fallback={null}>
              <ResponsiveCamera />
              <CanvasReadyNotifier onReady={handle3DReady} />
              <ambientLight intensity={1.8} />
              <directionalLight position={[10, 15, 10]} intensity={2.2} color="#ffffff" />
              <directionalLight position={[-10, 8, -5]} intensity={0.9} color="#90b0e0" />
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
    </main>
  );
}

export default Home;
