/* eslint-disable react-hooks/immutability */
import { useGLTF, useScroll, useTexture, ContactShadows } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

import { MODEL_URLS } from "../../config/models";
import heroImg from "../../assets/Picture/Picture3.webp";
import keyboardImg from "../../assets/Picture/keyboard Texture2.png";
import laptopBackImg from "../../assets/Picture/laptop-back.png";

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

  // Scroll Window (0.0 to 0.60 across 5 pages)
  scrollStart: 0.0,
  scrollEnd: 0.60,
};

interface MacContainerProps {
  onReady?: () => void;
}

const MacContainer = ({ onReady }: MacContainerProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl, size } = useThree();
  const mac = useGLTF(MODEL_URLS.mac);
  const screen = useTexture(heroImg);
  const keyboard = useTexture(keyboardImg);
  const laptopBack = useTexture(laptopBackImg);
  const isReadySignaled = useRef(false);

  // Setup textures and materials cleanly with useMemo to avoid re-creation on every render
  const { meshes } = useMemo(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

    keyboard.colorSpace = THREE.SRGBColorSpace;
    keyboard.anisotropy = maxAnisotropy;
    keyboard.minFilter = THREE.LinearMipmapLinearFilter;
    keyboard.magFilter = THREE.LinearFilter;
    keyboard.generateMipmaps = true;
    keyboard.needsUpdate = true;

    laptopBack.colorSpace = THREE.SRGBColorSpace;
    laptopBack.anisotropy = maxAnisotropy;
    laptopBack.minFilter = THREE.LinearMipmapLinearFilter;
    laptopBack.magFilter = THREE.LinearFilter;
    laptopBack.generateMipmaps = true;
    laptopBack.flipY = false;
    laptopBack.needsUpdate = true;

    screen.colorSpace = THREE.SRGBColorSpace;
    screen.anisotropy = maxAnisotropy;
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

    // Premium Apple Space Gray / Silver Anodized Aluminum
    const aluminumMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#9ea4ad"),
      metalness: 0.88,
      roughness: 0.28,
      envMapIntensity: 2.2,
    });

    // Apple Magic Keyboard Matte Black keycaps
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
          // Display screen
          meshChild.material = screenMaterial;
        } else if (
          origMatName.includes("black") ||
          name.includes("black") ||
          name.includes("key")
        ) {
          // Authentic 3D black keycaps, speaker holes & port bezels
          meshChild.material = keycapMaterial;
        } else {
          // Chassis, palm rest, trackpad, and outer shell
          meshChild.material = aluminumMaterial;
        }
      }
    });

    if (meshMap.screen) {
      meshMap.screen.rotation.x = THREE.MathUtils.degToRad(182);

      // Attach high-res unfragmented back lid plane directly to the screen hinge
      const existingLid = meshMap.screen.getObjectByName("laptop_lid_plane");
      if (existingLid) {
        meshMap.screen.remove(existingLid);
      }
      const lidGeo = new THREE.PlaneGeometry(31.4, 22.0);
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
  }, [mac.scene, screen, keyboard, laptopBack, gl]);

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
          console.log("[HERO] Mac GLB loaded");
          console.log("[HERO] Mac scene ready");
          console.log("[HERO] Mac first frame");
          console.log("[HERO] Hero ready");

          // Calculate timing stages
          const startTime = Number((window as any).__bdgMacStartTime) || tMount;
          const resourceEntries = performance.getEntriesByName(MODEL_URLS.mac) as PerformanceResourceTiming[];
          const glbEntry = resourceEntries.length > 0 ? resourceEntries[resourceEntries.length - 1] : undefined;

          const sceneStart = Number(meshes.tSceneStart) || tMount;
          const sceneEnd = Number(meshes.tSceneEnd) || tMount;

          const networkDownload = glbEntry && glbEntry.responseEnd > glbEntry.requestStart && glbEntry.requestStart > 0
            ? glbEntry.responseEnd - glbEntry.requestStart
            : glbEntry ? glbEntry.duration : Math.max(0, sceneStart - startTime);

          const parsingDecompression = glbEntry && glbEntry.responseEnd > 0
            ? Math.max(0, sceneStart - glbEntry.responseEnd)
            : 0;

          const sceneSetup = Math.max(0, sceneEnd - sceneStart);
          const firstRender = Math.max(0, tFirstFrame - sceneEnd);

          console.groupCollapsed("[HERO] 3D Performance Breakdown");
          console.log(`1. Network Download: ${networkDownload.toFixed(1)}ms`);
          console.log(`2. GLB Parse/Decompress: ${parsingDecompression.toFixed(1)}ms`);
          console.log(`3. Scene Setup: ${sceneSetup.toFixed(1)}ms`);
          console.log(`4. First Render: ${firstRender.toFixed(1)}ms`);
          console.groupEnd();
        }
        onReady?.();
      });
    });

    return () => {
      cancelAnimationFrame(frameId1);
      cancelAnimationFrame(frameId2);
    };
  }, [mac.scene, meshes, onReady]);

  const data = useScroll();

  // Pre-cached easing function
  const easeSineOut = useMemo(() => (t: number) => Math.sin((t * Math.PI) / 2), []);

  // GSAP-driven Scroll Animation Frame Loop
  useFrame(() => {
    const p = data ? data.offset : 0;

    // Progress across scroll window with silky smooth sine.out easing
    const span = Math.max(PARAMS.scrollEnd - PARAMS.scrollStart, 0.01);
    const rawProgress = Math.min(Math.max((p - PARAMS.scrollStart) / span, 0), 1);
    const laptopProgress = easeSineOut(rawProgress);

    // 1. Screen Lid Opening Animation
    if (meshes.screen) {
      const lidAngle = gsap.utils.interpolate(PARAMS.lidClosedAngle, PARAMS.lidOpenAngle, laptopProgress);
      meshes.screen.rotation.x = THREE.MathUtils.degToRad(lidAngle);
    }

    // 2. Base/Chassis Position & Rotation & Scale (Responsive across mobile, tablet, desktop)
    if (groupRef.current) {
      const aspect = size.width / Math.max(size.height, 1);
      const responsiveTargetX = aspect < 0.75 ? -0.7 : aspect < 1.2 ? -1.5 : PARAMS.targetX;
      const responsiveTargetY = aspect < 0.75 ? -1.8 : aspect < 1.2 ? -2.2 : PARAMS.targetY;
      const responsiveScale = aspect < 0.75 ? 0.62 : aspect < 1.2 ? 0.67 : PARAMS.scale;

      const curX = gsap.utils.interpolate(PARAMS.startX, responsiveTargetX, laptopProgress);
      const curY = gsap.utils.interpolate(PARAMS.startY, responsiveTargetY, laptopProgress);
      const curZ = gsap.utils.interpolate(PARAMS.startZ, PARAMS.targetZ, laptopProgress);

      const curRotX = gsap.utils.interpolate(
        THREE.MathUtils.degToRad(PARAMS.startRotXDeg),
        THREE.MathUtils.degToRad(PARAMS.rotXDeg),
        laptopProgress
      );
      const curRotY = gsap.utils.interpolate(
        THREE.MathUtils.degToRad(PARAMS.startRotYDeg),
        THREE.MathUtils.degToRad(PARAMS.rotYDeg),
        laptopProgress
      );
      const curRotZ = gsap.utils.interpolate(
        THREE.MathUtils.degToRad(PARAMS.startRotZDeg),
        THREE.MathUtils.degToRad(PARAMS.rotZDeg),
        laptopProgress
      );

      const curScale = gsap.utils.interpolate(PARAMS.startScale, responsiveScale, laptopProgress);

      groupRef.current.position.set(curX, curY, curZ);
      groupRef.current.rotation.set(curRotX, curRotY, curRotZ);
      groupRef.current.scale.setScalar(curScale);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[PARAMS.startX, PARAMS.startY, PARAMS.startZ]}
      rotation={[
        THREE.MathUtils.degToRad(PARAMS.startRotXDeg),
        THREE.MathUtils.degToRad(PARAMS.startRotYDeg),
        THREE.MathUtils.degToRad(PARAMS.startRotZDeg),
      ]}
    >
      <primitive object={mac.scene} />

      {/* Photorealistic Keyboard, Keycaps & Trackpad Deck */}
      <mesh position={[0, 0.06, -0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[31.4, 22.0]} />
        <meshStandardMaterial
          map={keyboard}
          roughness={0.35}
          metalness={0.15}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
        />
      </mesh>

      {/* Baked contact shadow directly beneath the laptop chassis with frames={1} to save massive GPU cycles */}
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

useGLTF.preload(MODEL_URLS.mac);
useTexture.preload(heroImg);
useTexture.preload(keyboardImg);
useTexture.preload(laptopBackImg);

export default MacContainer;

