import React, { useEffect, useRef } from "react";

export interface KeyboardTheme {
  id: string;
  name: string;
  hex: string;
  secondary: string;
  glow: string;
}

export const KEYBOARD_THEMES: KeyboardTheme[] = [
  {
    id: "cyan",
    name: "Cyber Cyan",
    hex: "#00f0ff",
    secondary: "#0077ff",
    glow: "rgba(0, 240, 255, 0.4)",
  },
  {
    id: "violet",
    name: "Neon Violet",
    hex: "#c026d3",
    secondary: "#7c3aed",
    glow: "rgba(192, 38, 211, 0.4)",
  },
  {
    id: "amber",
    name: "Amber Forge",
    hex: "#f59e0b",
    secondary: "#ea580c",
    glow: "rgba(245, 158, 11, 0.4)",
  },
  {
    id: "emerald",
    name: "Matrix Emerald",
    hex: "#10b981",
    secondary: "#059669",
    glow: "rgba(16, 185, 129, 0.4)",
  },
];

interface KeyboardScrollyCanvasProps {
  scrollProgressRef: React.RefObject<number>;
  activeTheme?: KeyboardTheme;
  onProgress?: (progressPercent: number, isComplete: boolean) => void;
}

const TOTAL_FRAMES = 176;

export const KeyboardScrollyCanvas: React.FC<KeyboardScrollyCanvasProps> = ({
  scrollProgressRef,
  onProgress,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameRef = useRef<number>(0);
  const hasDrawnInitial = useRef(false);
  const loadedCountRef = useRef<number>(0);

  // Mouse parallax tracking
  const mouseState = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  // 1. Draw frame to Canvas with HiDPI support & high quality cover fit
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    const clampedIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(index)));
    let img = imagesRef.current[clampedIndex];

    // Fast fallback search if exact frame hasn't completed loading yet
    if (!img || !img.complete || img.naturalWidth === 0) {
      let found = false;
      for (let offset = 1; offset < 45; offset++) {
        const prev = imagesRef.current[clampedIndex - offset];
        if (prev && prev.complete && prev.naturalWidth > 0) {
          img = prev;
          found = true;
          break;
        }
        const next = imagesRef.current[clampedIndex + offset];
        if (next && next.complete && next.naturalWidth > 0) {
          img = next;
          found = true;
          break;
        }
      }
      if (!found || !img || !img.complete || img.naturalWidth === 0) {
        return;
      }
    }

    if (!img) return;

    const w = canvas.width;
    const h = canvas.height;

    // Aspect-ratio cover math
    const scaleX = w / img.naturalWidth;
    const scaleY = h / img.naturalHeight;
    const scale = Math.max(scaleX, scaleY);

    const newW = img.naturalWidth * scale;
    const newH = img.naturalHeight * scale;
    const offsetX = (w - newW) / 2;
    const offsetY = (h - newH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, offsetX, offsetY, newW, newH);
  };

  // 2. High-Performance Concurrent Frame Loader (Loads all 176 frames with real-time 0-100% progress tracking)
  useEffect(() => {
    let isCancelled = false;
    loadedCountRef.current = 0;

    const baseUrl = import.meta.env.BASE_URL.endsWith("/")
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;

    let lastReportedPct = -1;
    const notifyProgress = () => {
      if (isCancelled) return;
      loadedCountRef.current++;
      const count = loadedCountRef.current;
      const pct = Math.min(100, Math.round((count / TOTAL_FRAMES) * 100));
      const allLoaded = count >= TOTAL_FRAMES;
      if (pct !== lastReportedPct || allLoaded) {
        lastReportedPct = pct;
        onProgress?.(pct, allLoaded);
      }
    };

    const loadSingleFrame = (i: number): Promise<HTMLImageElement | null> => {
      if (imagesRef.current[i]) return Promise.resolve(imagesRef.current[i]);

      return new Promise((resolve) => {
        const frameNum = (i + 1).toString().padStart(4, "0");
        const img = new Image();
        img.src = `${baseUrl}frames/frame_${frameNum}.webp`;

        img.onload = () => {
          if (isCancelled) {
            resolve(null);
            return;
          }
          imagesRef.current[i] = img;
          if (i === 0 && !hasDrawnInitial.current) {
            hasDrawnInitial.current = true;
            drawFrame(0);
          }
          notifyProgress();
          resolve(img);
        };

        img.onerror = () => {
          const fallbackImg = new Image();
          fallbackImg.src = `${baseUrl}frames/frame_${frameNum}.jpeg`;
          fallbackImg.onload = () => {
            if (isCancelled) return resolve(null);
            imagesRef.current[i] = fallbackImg;
            notifyProgress();
            resolve(fallbackImg);
          };
          fallbackImg.onerror = () => {
            notifyProgress();
            resolve(null);
          };
        };
      });
    };

    // Load frame 0 first for instant canvas draw, then load all remaining frames in parallel with concurrency pool
    const startLoading = async () => {
      // Step 1: Load frame 0 immediately
      await loadSingleFrame(0);
      if (isCancelled) return;

      // Step 2: Queue all remaining frames (1 to TOTAL_FRAMES - 1)
      const remainingIndices: number[] = [];
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        if (!imagesRef.current[i]) {
          remainingIndices.push(i);
        }
      }

      const CONCURRENCY = 16;
      let currentIndex = 0;

      const worker = async () => {
        while (currentIndex < remainingIndices.length && !isCancelled) {
          const idx = remainingIndices[currentIndex++];
          await loadSingleFrame(idx);
        }
      };

      const workers = Array.from(
        { length: Math.min(CONCURRENCY, remainingIndices.length) },
        () => worker()
      );

      await Promise.all(workers);

      if (!isCancelled) {
        onProgress?.(100, true);
      }
    };

    startLoading();

    return () => {
      isCancelled = true;
    };
  }, []);

  // 3. Canvas Resizing with Retina/HiDPI handling (Optimal DPR cap 1.5)
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = container.clientWidth;
      const h = container.clientHeight;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      drawFrame(currentFrameRef.current);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 4. Mouse movement for 3D parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseState.current.targetX = (e.clientX / innerWidth - 0.5) * 2;
      mouseState.current.targetY = (e.clientY / innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 5. 60fps / 120fps RAF Scrubbing Loop (Decoupled from React renders)
  useEffect(() => {
    let animId: number;
    let lastDrawnFrame = -1;
    let lastRotX = -999;
    let lastRotY = -999;

    const tick = () => {
      const progress = scrollProgressRef.current ?? 0;
      const targetFrame = Math.max(0, Math.min(TOTAL_FRAMES - 1, progress * (TOTAL_FRAMES - 1)));

      // Fluid frame scrubbing driven by Lenis momentum with zero frame drops
      currentFrameRef.current += (targetFrame - currentFrameRef.current) * 0.32;

      const roundedFrame = Math.round(currentFrameRef.current);
      if (roundedFrame !== lastDrawnFrame) {
        drawFrame(roundedFrame);
        lastDrawnFrame = roundedFrame;
      }

      // Smooth mouse parallax lerp
      const ms = mouseState.current;
      ms.x += (ms.targetX - ms.x) * 0.08;
      ms.y += (ms.targetY - ms.y) * 0.08;

      const rotY = ms.x * 4.0;
      const rotX = -ms.y * 3.0;

      if (Math.abs(rotX - lastRotX) > 0.01 || Math.abs(rotY - lastRotY) > 0.01) {
        lastRotX = rotX;
        lastRotY = rotY;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [scrollProgressRef]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex items-center justify-center select-none bg-[#050505]"
    >
      {/* High-Performance 2D Canvas Image Sequence Scrub Engine */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10 will-change-transform"
        style={{
          filter: "contrast(1.04) brightness(1.02)",
          transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1.02)",
        }}
      />

      {/* Cinematic Radial Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-20 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 45%, rgba(5, 5, 5, 0.45) 75%, #050505 100%)`,
        }}
      />

      {/* Top and Bottom Edge Blends into dark background */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-transparent pointer-events-none z-20" />
      <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent pointer-events-none z-20" />
    </div>
  );
};
