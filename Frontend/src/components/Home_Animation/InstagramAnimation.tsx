/* eslint-disable react-hooks/immutability */
import React, { useRef, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import InstagramImg from "../../assets/Picture/Instagram.webp";
import { useHomeScrollProgress } from "./HomeScrollContext";

const PARAMS = {
  // Start Pose (Emerges from center)
  startPosX: -9,
  startPosY: -1.1,
  startPosZ: -1.2,
  startRotXDeg: -10,
  startRotYDeg: 20.5,
  startRotZDeg: 12,
  startScale: 0.001,

  // Target Pose
  posX: -4.4,
  posY: 3.7,
  posZ: 15.2,
  rotXDeg: -1.5,
  rotYDeg: 12,
  rotZDeg: 0,
  scale: 2.5,
  opacity: 1,

  // Plane Dimensions
  planeWidth: 5.7,
  planeHeight: 3.7,

  // Scroll Timing
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

const SHARED_PLANE_GEO = new THREE.PlaneGeometry(1, 1);

const InstagramAnimation: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const isHiddenRef = useRef(true);
  const lastProgressRef = useRef(-1);
  const { size } = useThree();
  const texture = useTexture(InstagramImg);
  const scrollProgressRef = useHomeScrollProgress();

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
  }, [texture]);

  // Pre-calculate responsive targets only when size changes
  const responsiveConfig = useMemo(() => {
    const aspect = size.width / Math.max(size.height, 1);
    let responsiveScaleFactor = 1.0;
    let targetPosX = PARAMS.posX;
    let targetPosY = PARAMS.posY;

    if (aspect < 0.75) {
      responsiveScaleFactor = 0.68;
      targetPosX = -2.6;
      targetPosY = 3.2;
    } else if (aspect < 1.2) {
      responsiveScaleFactor = 0.84;
      targetPosX = -3.8;
      targetPosY = 3.5;
    } else {
      responsiveScaleFactor = 1.0;
      targetPosX = PARAMS.posX;
      targetPosY = PARAMS.posY;
    }

    const targetScale = PARAMS.scale * responsiveScaleFactor;
    return { targetPosX, targetPosY, targetScale };
  }, [size.width, size.height]);

  useFrame(() => {
    if (!meshRef.current) return;
    const p = scrollProgressRef.current || 0;

    if (p < PARAMS.scrollStart) {
      if (isHiddenRef.current) return;
      isHiddenRef.current = true;
      lastProgressRef.current = -1;
      const mesh = meshRef.current;
      const mat = mesh.material as THREE.MeshBasicMaterial;
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

    if (Math.abs(p - lastProgressRef.current) < 0.0001 && !isHiddenRef.current) {
      return;
    }
    lastProgressRef.current = p;
    isHiddenRef.current = false;

    const mesh = meshRef.current;
    const mat = mesh.material as THREE.MeshBasicMaterial;
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
      geometry={SHARED_PLANE_GEO}
      position={[PARAMS.startPosX, PARAMS.startPosY, PARAMS.startPosZ]}
      renderOrder={1}
    >
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
