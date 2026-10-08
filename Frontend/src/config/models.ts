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

// Initiate early parallel preload via Drei GLTF & Texture loaders
if (typeof window !== "undefined") {
  if (!(window as any).__bdgMacStartTime) {
    (window as any).__bdgMacStartTime = performance.now();
  }
  if (!(window as any).__bdgBusinessmanStartTime) {
    (window as any).__bdgBusinessmanStartTime = performance.now();
  }
  try {
    // 3D Models
    useGLTF.preload(MODEL_URLS.mac);
    useGLTF.preload(MODEL_URLS.businessman);

    // Home 3D MacBook Textures
    useTexture.preload(heroImg);
    useTexture.preload(keyboardImg);
    useTexture.preload(laptopBackImg);

    // Home 3D Social Media Cards Textures
    useTexture.preload(InstagramImg);
    useTexture.preload(YTImg);
    useTexture.preload(PinterestImg);
    useTexture.preload(TikTokImg);
  } catch (e) {
    if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
      console.debug("[3D] Preload notice:", e);
    }
  }
}
