/* eslint-disable react-hooks/immutability */
import { useGLTF, useTexture, ContactShadows } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useHomeScrollProgress } from "./HomeScrollContext";

import { MODEL_URLS } from "../../config/models";
import heroImg from "../../assets/Picture/screen-texture.webp";
import keyboardImg from "../../assets/Picture/keyboard Texture2.webp";
import laptopBackImg from "../../assets/Picture/laptop-back.webp";

// Tuned parameters for MacBook
const PARAMS = {
  // Start Pose (Page 1 - Closed)
  startX: 0,
  startY: -5.8,
  startZ: -18.0,
  startRotXDeg: 0,
  startRotYDeg: 48.0,
  startRotZDeg: 0,
  startScale: 1.15,

  // Target Pose (Page 2 - Opened & Emerged)
  targetX: -2.5,
  targetY: -2.5,
  targetZ: 6.0,
  rotXDeg: 0,
  rotYDeg: 48.0,
  rotZDeg: 0,
  scale: 0.7,

  // Screen Lid Angles (Degrees)
  lidClosedAngle: 180,
  lidOpenAngle: 80,

  // Scroll Window (Opens smoothly in initial scroll phase before cards emerge)
  scrollStart: 0.0,
  scrollEnd: 0.18,
};

// Precompute static radians & values once
const RAD_START_ROT_X = THREE.MathUtils.degToRad(PARAMS.startRotXDeg);
const RAD_START_ROT_Y = THREE.MathUtils.degToRad(PARAMS.startRotYDeg);
const RAD_START_ROT_Z = THREE.MathUtils.degToRad(PARAMS.startRotZDeg);
const RAD_TARGET_ROT_X = THREE.MathUtils.degToRad(PARAMS.rotXDeg);
const RAD_TARGET_ROT_Y = THREE.MathUtils.degToRad(PARAMS.rotYDeg);
const RAD_TARGET_ROT_Z = THREE.MathUtils.degToRad(PARAMS.rotZDeg);
const RAD_INITIAL_SCREEN_X = THREE.MathUtils.degToRad(PARAMS.lidClosedAngle);

const SCROLL_SPAN = Math.max(PARAMS.scrollEnd - PARAMS.scrollStart, 0.01);

// Fast inline lerp & smoothstep
const inlineLerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const smoothstep = (t: number): number => {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
};

// Generates smooth rounded rectangle geometry with 0-to-1 UV mapping to perfectly fit MacBook beveled corners
function createRoundedRectGeometry(width: number, height: number, radius: number, segments = 12): THREE.ShapeGeometry {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.absarc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false);
  shape.lineTo(x + width, y + height - radius);
  shape.absarc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
  shape.lineTo(x + radius, y + height);
  shape.absarc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + radius);
  shape.absarc(x + radius, y + radius, radius, Math.PI, (3 * Math.PI) / 2, false);

  const geo = new THREE.ShapeGeometry(shape, segments);

  const pos = geo.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    uvs[i * 2] = (px - x) / width;
    uvs[i * 2 + 1] = (py - y) / height;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  return geo;
}

interface MacContainerProps {
  onReady?: () => void;
}

const MacContainer = ({ onReady }: MacContainerProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl, size } = useThree();

  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    if (!(window as any).__bdgMacLoggedStart) {
      (window as any).__bdgMacLoggedStart = true;
      console.log("[HERO] MacBook loading");
      console.log("[3D TIMING] MacBook request start");
    }
  }

  const mac = useGLTF(MODEL_URLS.mac);
  const screen = useTexture(heroImg);
  const keyboard = useTexture(keyboardImg);
  const laptopBack = useTexture(laptopBackImg);
  const isReadySignaled = useRef(false);

  // Rounded corner geometries for keyboard and back lid
  const keyboardGeo = useMemo(() => createRoundedRectGeometry(31.1, 21.7, 1.4), []);
  const lidGeo = useMemo(() => createRoundedRectGeometry(31.1, 21.7, 1.4), []);

  // Setup textures and materials cleanly with useMemo to avoid re-creation on every render
  const { meshes } = useMemo(() => {
    const cappedAnisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 4);

    keyboard.colorSpace = THREE.SRGBColorSpace;
    keyboard.anisotropy = cappedAnisotropy;
    keyboard.minFilter = THREE.LinearMipmapLinearFilter;
    keyboard.magFilter = THREE.LinearFilter;
    keyboard.generateMipmaps = true;
    keyboard.needsUpdate = true;

    laptopBack.colorSpace = THREE.SRGBColorSpace;
    laptopBack.anisotropy = cappedAnisotropy;
    laptopBack.minFilter = THREE.LinearMipmapLinearFilter;
    laptopBack.magFilter = THREE.LinearFilter;
    laptopBack.generateMipmaps = true;
    laptopBack.flipY = false;
    laptopBack.needsUpdate = true;

    screen.colorSpace = THREE.SRGBColorSpace;
    screen.anisotropy = cappedAnisotropy;
    screen.minFilter = THREE.LinearMipmapLinearFilter;
    screen.magFilter = THREE.LinearFilter;
    screen.generateMipmaps = true;
    screen.needsUpdate = true;

    const screenMaterial = new THREE.MeshBasicMaterial({
      map: screen,
      toneMapped: false,
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      map: laptopBack,
      roughness: 0.35,
      metalness: 0.15,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });

    const aluminumMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#9ea4ad"),
      metalness: 0.88,
      roughness: 0.28,
      envMapIntensity: 2.2,
    });

    const keycapMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#16181b"),
      metalness: 0.15,
      roughness: 0.42,
    });

    const tSceneStart = performance.now();
    const meshMap: Record<string, THREE.Object3D> = {};
    mac.scene.traverse((child: THREE.Object3D) => {
      meshMap[child.name] = child;

      if ((child as THREE.Mesh).isMesh) {
        const meshChild = child as THREE.Mesh;
        const name = (child.name || "").toLowerCase();
        const parentName = (child.parent?.name || "").toLowerCase();
        const origMatName = ((meshChild.material as THREE.Material)?.name || "").toLowerCase();

        if (name.includes("matte") || parentName.includes("matte")) {
          meshChild.material = screenMaterial;
        } else if (
          origMatName.includes("black") ||
          name.includes("black") ||
          name.includes("key")
        ) {
          meshChild.material = keycapMaterial;
        } else {
          meshChild.material = aluminumMaterial;
        }
      }
    });

    if (meshMap.screen) {
      meshMap.screen.rotation.x = RAD_INITIAL_SCREEN_X;

      const existingLid = meshMap.screen.getObjectByName("laptop_lid_plane");
      if (existingLid) {
        meshMap.screen.remove(existingLid);
      }
      const lidMesh = new THREE.Mesh(lidGeo, backMaterial);
      lidMesh.name = "laptop_lid_plane";
      lidMesh.position.set(0, -0.85, -10.8);
      lidMesh.rotation.set(Math.PI / 2, 0, Math.PI);
      meshMap.screen.add(lidMesh);
    }
    const tSceneEnd = performance.now();

    return {
      meshes: meshMap,
      screenMaterial,
      backMaterial,
      aluminumMaterial,
      keycapMaterial,
      tSceneStart,
      tSceneEnd,
    };
  }, [mac.scene, screen, keyboard, laptopBack, lidGeo, gl]);

  // Setup exact camera parameters
  useEffect(() => {
    if (!camera) return;
    camera.position.set(0, 4.3, 38);
    camera.rotation.set(
      THREE.MathUtils.degToRad(-2),
      THREE.MathUtils.degToRad(6),
      0
    );
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      (camera as THREE.PerspectiveCamera).fov = 40;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
  }, [camera]);

  // Pre-calculate responsive targets when viewport size changes (NOT every frame)
  const responsiveConfig = useMemo(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const targetX = aspect < 0.75 ? -0.7 : aspect < 1.2 ? -1.5 : PARAMS.targetX;
    const targetY = aspect < 0.75 ? -1.8 : aspect < 1.2 ? -2.2 : PARAMS.targetY;
    const scale = aspect < 0.75 ? 0.62 : aspect < 1.2 ? 0.67 : PARAMS.scale;
    return { targetX, targetY, scale };
  }, [size.width, size.height]);

  // Signal true 3D Model Readiness only after GLTF scene & materials have mounted to the render tree
  useEffect(() => {
    if (!mac.scene || isReadySignaled.current) return;

    const tMount = performance.now();
    let frameId2: number;
    const frameId1 = requestAnimationFrame(() => {
      frameId2 = requestAnimationFrame(() => {
        if (isReadySignaled.current) return;
        isReadySignaled.current = true;
        const tFirstFrame = performance.now();

        if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
          console.log("[HERO] MacBook GLB loaded");
          console.log("[HERO] MacBook scene ready");
          console.log("[HERO] MacBook first frame");
          console.log("[HERO] MacBook ready");

          const startTime = Number((window as any).__bdgMacStartTime) || tMount;
          const resourceEntries = performance.getEntriesByName(MODEL_URLS.mac) as PerformanceResourceTiming[];
          const glbEntry = resourceEntries.length > 0 ? resourceEntries[resourceEntries.length - 1] : undefined;

          const sceneStart = Number(meshes.tSceneStart) || tMount;
          const sceneEnd = Number(meshes.tSceneEnd) || tMount;

          const downloadDuration = glbEntry && glbEntry.responseEnd > glbEntry.requestStart && glbEntry.requestStart > 0
            ? glbEntry.responseEnd - glbEntry.requestStart
            : glbEntry ? glbEntry.duration : Math.max(0, sceneStart - startTime);

          const glbLoadedTime = Math.max(downloadDuration, sceneStart - startTime);
          const sceneSetupTime = Math.max(0, sceneEnd - sceneStart);
          const firstFrameTime = Math.max(0, tFirstFrame - sceneEnd);
          const totalDuration = Math.max(0, tFirstFrame - startTime);

          console.log(`[3D TIMING] MacBook GLB loaded: ${glbLoadedTime.toFixed(1)} ms`);
          console.log(`[3D TIMING] MacBook scene ready: ${sceneSetupTime.toFixed(1)} ms`);
          console.log(`[3D TIMING] MacBook first frame: ${firstFrameTime.toFixed(1)} ms`);
          console.log(`[3D TIMING] MacBook total: ${totalDuration.toFixed(1)} ms`);
        }
        onReady?.();
      });
    });

    return () => {
      cancelAnimationFrame(frameId1);
      cancelAnimationFrame(frameId2);
    };
  }, [mac.scene, meshes, onReady]);

  const scrollProgressRef = useHomeScrollProgress();

  // Smooth Scroll Animation Frame Loop
  useFrame(() => {
    const scrollOffset = scrollProgressRef.current || 0;

    let progress = 0;
    if (scrollOffset <= PARAMS.scrollStart) {
      progress = 0;
    } else if (scrollOffset >= PARAMS.scrollEnd) {
      progress = 1;
    } else {
      const rawT = (scrollOffset - PARAMS.scrollStart) / SCROLL_SPAN;
      progress = smoothstep(rawT);
    }

    // 1. Screen Lid Opening Animation
    if (meshes.screen) {
      const lidAngleDeg = inlineLerp(PARAMS.lidClosedAngle, PARAMS.lidOpenAngle, progress);
      meshes.screen.rotation.x = THREE.MathUtils.degToRad(lidAngleDeg);
    }

    // 2. Base/Chassis Position, Rotation & Scale
    if (groupRef.current) {
      const { targetX, targetY, scale } = responsiveConfig;

      const curX = inlineLerp(PARAMS.startX, targetX, progress);
      const curY = inlineLerp(PARAMS.startY, targetY, progress);
      const curZ = inlineLerp(PARAMS.startZ, PARAMS.targetZ, progress);

      const curRotX = inlineLerp(RAD_START_ROT_X, RAD_TARGET_ROT_X, progress);
      const curRotY = inlineLerp(RAD_START_ROT_Y, RAD_TARGET_ROT_Y, progress);
      const curRotZ = inlineLerp(RAD_START_ROT_Z, RAD_TARGET_ROT_Z, progress);

      const curScale = inlineLerp(PARAMS.startScale, scale, progress);

      groupRef.current.position.set(curX, curY, curZ);
      groupRef.current.rotation.set(curRotX, curRotY, curRotZ);
      groupRef.current.scale.setScalar(curScale);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[PARAMS.startX, PARAMS.startY, PARAMS.startZ]}
      rotation={[RAD_START_ROT_X, RAD_START_ROT_Y, RAD_START_ROT_Z]}
    >
      <primitive object={mac.scene} />

      {/* Photorealistic Keyboard, Keycaps & Trackpad Deck with Rounded Corners */}
      <mesh
        geometry={keyboardGeo}
        position={[0, 0.06, -0.6]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          map={keyboard}
          roughness={0.35}
          metalness={0.15}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
        />
      </mesh>

      {/* Baked contact shadow directly beneath the laptop chassis */}
      <ContactShadows
        frames={1}
        position={[0, -0.65, 0]}
        opacity={0.85}
        scale={36}
        blur={1.8}
        far={3.5}
        color="#000000"
      />
    </group>
  );
};

export default MacContainer;
