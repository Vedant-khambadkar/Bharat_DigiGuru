/* eslint-disable react-hooks/immutability */
import React, { useRef, useMemo } from "react";
import { useScroll, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import InstagramImg from "../../assets/Picture/Instagram.png";

const PARAMS = {
  // Start Pose (Emerges from center)
  startPosX: -4.3,
  startPosY: -0.5,
  startPosZ: -1.2,
  startRotXDeg: -10,
  startRotYDeg: 37.5,
  startRotZDeg: 0,
  startScale: 0.01,
  posX: -6.3,
  posY: 5,
  posZ: 8.4,
  rotXDeg: 3,
  rotYDeg: 20.5,
  rotZDeg: -1.5,
  scale: 3.9,
  opacity: 1,
  planeWidth: 5.15,
  planeHeight: 3.9,
  scrollStart: 0.18,
  scrollEnd: 0.38,
};

// Precompute static constants
const RAD_START_ROT_X = THREE.MathUtils.degToRad(PARAMS.startRotXDeg);
const RAD_START_ROT_Y = THREE.MathUtils.degToRad(PARAMS.startRotYDeg);
const RAD_START_ROT_Z = THREE.MathUtils.degToRad(PARAMS.startRotZDeg);
const RAD_TARGET_ROT_X = THREE.MathUtils.degToRad(PARAMS.rotXDeg);
const RAD_TARGET_ROT_Y = THREE.MathUtils.degToRad(PARAMS.rotYDeg);
const RAD_TARGET_ROT_Z = THREE.MathUtils.degToRad(PARAMS.rotZDeg);

const SCROLL_SPAN = Math.max(PARAMS.scrollEnd - PARAMS.scrollStart, 0.01);
const HALF_PI = Math.PI / 2;

// Fast inline lerp
const inlineLerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const InstagramAnimation: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const isHiddenRef = useRef(true);
  const { size } = useThree();
  const texture = useTexture(InstagramImg);
  const data = useScroll();

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
  }, [texture]);

  // Pre-calculate responsive targets only when size changes
  const responsiveConfig = useMemo(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const responsiveScaleFactor = aspect < 0.75 ? 0.65 : aspect < 1.2 ? 0.82 : 1.0;
    const targetPosX = aspect < 0.75 ? -3.6 : aspect < 1.2 ? -5.0 : PARAMS.posX;
    const targetPosY = aspect < 0.75 ? 3.8 : aspect < 1.2 ? 4.5 : PARAMS.posY;
    const targetScale = PARAMS.scale * responsiveScaleFactor;
    return { targetPosX, targetPosY, targetScale };
  }, [size.width, size.height]);

  useFrame(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const mat = mesh.material as THREE.MeshBasicMaterial;
    const p = data ? data.offset : 0;

    if (p < PARAMS.scrollStart) {
      if (isHiddenRef.current) return;
      isHiddenRef.current = true;
      mesh.position.set(PARAMS.startPosX, PARAMS.startPosY, PARAMS.startPosZ);
      mesh.rotation.set(RAD_START_ROT_X, RAD_START_ROT_Y, RAD_START_ROT_Z);
      mesh.scale.set(
        PARAMS.startScale * PARAMS.planeWidth,
        PARAMS.startScale * PARAMS.planeHeight,
        PARAMS.startScale
      );
      mat.opacity = 0;
      return;
    }

    isHiddenRef.current = false;
    const rawProgress = Math.min(Math.max((p - PARAMS.scrollStart) / SCROLL_SPAN, 0), 1);
    const progress = Math.sin(rawProgress * HALF_PI);

    const { targetPosX, targetPosY, targetScale } = responsiveConfig;

    const curX = inlineLerp(PARAMS.startPosX, targetPosX, progress);
    const curY = inlineLerp(PARAMS.startPosY, targetPosY, progress);
    const curZ = inlineLerp(PARAMS.startPosZ, PARAMS.posZ, progress);

    const curRotX = inlineLerp(RAD_START_ROT_X, RAD_TARGET_ROT_X, progress);
    const curRotY = inlineLerp(RAD_START_ROT_Y, RAD_TARGET_ROT_Y, progress);
    const curRotZ = inlineLerp(RAD_START_ROT_Z, RAD_TARGET_ROT_Z, progress);

    const curScale = inlineLerp(PARAMS.startScale, targetScale, progress);
    const curOpacity = inlineLerp(0.0, PARAMS.opacity, Math.min(rawProgress * 2.5, 1.0));

    mesh.position.set(curX, curY, curZ);
    mesh.rotation.set(curRotX, curRotY, curRotZ);
    mesh.scale.set(
      curScale * PARAMS.planeWidth,
      curScale * PARAMS.planeHeight,
      curScale
    );
    mat.opacity = curOpacity;
  });

  return (
    <mesh
      ref={meshRef}
      position={[PARAMS.startPosX, PARAMS.startPosY, PARAMS.startPosZ]}
      renderOrder={1}
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

export default InstagramAnimation;
