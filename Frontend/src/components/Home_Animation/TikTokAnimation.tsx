/* eslint-disable react-hooks/immutability */
import React, { useRef, useMemo } from "react";
import { useScroll, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import TikTokImg from "../../assets/Picture/TikTok.png";

// Tuned parameters for TikTok Card
const PARAMS = {
  startPosX: -6,
  startPosY: 5.5,
  startPosZ: -2.9,
  startRotXDeg: 5.5,
  startRotYDeg: -4,
  startRotZDeg: 0.5,
  startScale: 0.01,
  posX: -0.2,
  posY: 4.1,
  posZ: 14.6,
  rotXDeg: 0.5,
  rotYDeg: -6,
  rotZDeg: 0,
  scale: 2.2,
  opacity: 1,
  planeWidth: 3.05,
  planeHeight: 5.1,
  scrollStart: 0.78,
  scrollEnd: 1,
};

const TikTokAnimation: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  const texture = useTexture(TikTokImg);
  const data = useScroll();

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
  }, [texture]);

  const easeSineOut = useMemo(() => (t: number) => Math.sin((t * Math.PI) / 2), []);

  // Smooth GSAP Scrub in useFrame
  useFrame(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const mat = mesh.material as THREE.MeshBasicMaterial;
    const p = data ? data.offset : 0;

    const aspect = size.width / Math.max(size.height, 1);
    const responsiveScaleFactor = aspect < 0.75 ? 0.68 : aspect < 1.2 ? 0.84 : 1.0;
    const targetPosX = aspect < 0.75 ? 0 : PARAMS.posX;
    const targetPosY = aspect < 0.75 ? 3.3 : aspect < 1.2 ? 3.7 : PARAMS.posY;
    const targetScale = PARAMS.scale * responsiveScaleFactor;

    if (p >= PARAMS.scrollStart) {
      const span = Math.max(PARAMS.scrollEnd - PARAMS.scrollStart, 0.01);
      const rawProgress = Math.min(Math.max((p - PARAMS.scrollStart) / span, 0), 1);

      // Smooth sine.out easing
      const progress = easeSineOut(rawProgress);

      const curX = gsap.utils.interpolate(PARAMS.startPosX, targetPosX, progress);
      const curY = gsap.utils.interpolate(PARAMS.startPosY, targetPosY, progress);
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

      const curScale = gsap.utils.interpolate(PARAMS.startScale, targetScale, progress);
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
      renderOrder={4}
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

useTexture.preload(TikTokImg);

export default TikTokAnimation;
