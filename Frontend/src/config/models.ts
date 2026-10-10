import { useGLTF, useTexture } from "@react-three/drei";
import heroImg from "../assets/Picture/screen-texture.webp";
import keyboardImg from "../assets/Picture/keyboard Texture2.webp";
import laptopBackImg from "../assets/Picture/laptop-back.webp";
import InstagramImg from "../assets/Picture/Instagram.webp";
import YTImg from "../assets/Picture/yt.webp";
import PinterestImg from "../assets/Picture/Pinterest.webp";
import TikTokImg from "../assets/Picture/TikTok.webp";

const CDN_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_CLOUDFRONT_URL) ||
  "https://d1mou18mn47yy7.cloudfront.net";

export const MODEL_URLS = {
  businessman: `${CDN_BASE}/3d-assets/businessman-v1.glb`,
  mac: `${CDN_BASE}/3d-assets/mac-v1.glb`,
} as const;

export type ModelKey = keyof typeof MODEL_URLS;

export const preloadHero3DAssets = () => {
  if (typeof window === "undefined") return;
  try {
    useGLTF.preload(MODEL_URLS.mac);
    useTexture.preload(heroImg);
    useTexture.preload(keyboardImg);
    useTexture.preload(laptopBackImg);
    useTexture.preload(InstagramImg);
    useTexture.preload(YTImg);
    useTexture.preload(PinterestImg);
    useTexture.preload(TikTokImg);
  } catch (e) {
    if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
      console.debug("[3D] Hero Preload notice:", e);
    }
  }
};

export const preloadBusinessmanModel = () => {
  if (typeof window === "undefined") return;
  try {
    useGLTF.preload(MODEL_URLS.businessman);
  } catch (e) {
    if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
      console.debug("[3D] Team Preload notice:", e);
    }
  }
};

// Immediate early preload of critical Hero assets (Desktop only — mobile bypasses GLB downloads)
if (typeof window !== "undefined") {
  const isDesktop =
    window.innerWidth >= 1024 &&
    (typeof window.matchMedia === "function" ? !window.matchMedia("(pointer: coarse)").matches : true);

  if (isDesktop) {
    if (!(window as any).__bdgMacStartTime) {
      (window as any).__bdgMacStartTime = performance.now();
    }
    preloadHero3DAssets();

    // Deferred preloading of below-the-fold businessman 3D model during idle scheduling
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(
        () => {
          preloadBusinessmanModel();
        },
        { timeout: 4000 }
      );
    } else {
      setTimeout(preloadBusinessmanModel, 1200);
    }
  }
}
