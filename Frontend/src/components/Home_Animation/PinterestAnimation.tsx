import React, { useMemo, useRef } from "react";
import { useScroll, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import PinterestImg from "../../assets/Picture/Pinterest.png";

// Tuned parameters for Pinterest Card
const PARAMS = {
  // Start Pose (Center emergence start position)
  startPosX: -2.2,
  startPosY: 4.7,
  startPosZ: 3.2,
  startRotXDeg: -1.5,
  startRotYDeg: 16.5,
  startRotZDeg: 3.0,
  startScale: 0.01,

  // Target Floating Pose
  posX: -9.8,
  posY: 4.7,
  posZ: 17.7,
  rotXDeg: -3.0,
  rotYDeg: 14.5,
  rotZDeg: 0.5,
  scale: 2.3,
  opacity: 1.0,

  // Plane Dimensions (Width & Height)
  planeWidth: 6.7,
  planeHeight: 4.45,

  // Scroll Trigger Window (Emerges after YouTube, finishes loading by 0.78)
  scrollStart: 0.58,
  scrollEnd: 0.78,
};

const PinterestAnimation: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(PinterestImg);
  const data = useScroll();

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
  }, [texture]);

  // Smooth GSAP Scrub in useFrame
  useFrame(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const mat = mesh.material as THREE.MeshBasicMaterial;
    const p = data ? data.offset : 0;

    if (p >= PARAMS.scrollStart) {
      const span = Math.max(PARAMS.scrollEnd - PARAMS.scrollStart, 0.01);
      const rawProgress = Math.min(Math.max((p - PARAMS.scrollStart) / span, 0), 1);

      // Smooth GSAP sine.out easing
      const progress = gsap.parseEase("sine.out")(rawProgress);

      const curX = gsap.utils.interpolate(PARAMS.startPosX, PARAMS.posX, progress);
      const curY = gsap.utils.interpolate(PARAMS.startPosY, PARAMS.posY, progress);
      const curZ = gsap.utils.interpolate(PARAMS.startPosZ, PARAMS.posZ, progress);

      const curRotX = gsap.utils.interpolate(
        THREE.MathUtils.degToRad(PARAMS.startRotXDeg),
        THREE.MathUtils.degToRad(PARAMS.rotXDeg),
        progress
      );
      const curRotY = gsap.utils.interpolate(
        THREE.MathUtils.degToRad(PARAMS.startRotYDeg),
        THREE.MathUtils.degToRad(PARAMS.rotYDeg),
        progress
      );
      const curRotZ = gsap.utils.interpolate(
        THREE.MathUtils.degToRad(PARAMS.startRotZDeg),
        THREE.MathUtils.degToRad(PARAMS.rotZDeg),
        progress
      );

      const curScale = gsap.utils.interpolate(PARAMS.startScale, PARAMS.scale, progress);
      const curOpacity = gsap.utils.interpolate(0.0, PARAMS.opacity, Math.min(rawProgress * 2.5, 1.0));

      mesh.position.set(curX, curY, curZ);
      mesh.rotation.set(curRotX, curRotY, curRotZ);
      mesh.scale.set(
        curScale * PARAMS.planeWidth,
        curScale * PARAMS.planeHeight,
        curScale
      );
      mat.opacity = curOpacity;
    } else {
      mesh.position.set(PARAMS.startPosX, PARAMS.startPosY, PARAMS.startPosZ);
      mesh.rotation.set(
        THREE.MathUtils.degToRad(PARAMS.startRotXDeg),
        THREE.MathUtils.degToRad(PARAMS.startRotYDeg),
        THREE.MathUtils.degToRad(PARAMS.startRotZDeg)
      );
      mesh.scale.set(
        PARAMS.startScale * PARAMS.planeWidth,
        PARAMS.startScale * PARAMS.planeHeight,
        PARAMS.startScale
      );
      mat.opacity = 0;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[PARAMS.startPosX, PARAMS.startPosY, PARAMS.startPosZ]}
      renderOrder={3}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
};

export default PinterestAnimation;
