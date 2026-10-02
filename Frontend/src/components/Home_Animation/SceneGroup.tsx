import React, { useRef } from "react";
import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

interface SceneGroupProps {
  children: React.ReactNode;
}

const SceneGroup: React.FC<SceneGroupProps> = ({ children }) => {
  const groupRef = useRef<THREE.Group>(null);
  const data = useScroll();

  useFrame(() => {
    if (!groupRef.current) return;
    const p = data ? data.offset : 0; // 0 to 1 across 5 pages

    // From page 3 scrolling (0.40) all the way till page 5 (1.0), rotate the group in Y so the laptop and cards face front
    const startTrigger = 0.40;
    const endTrigger = 1.0;

    if (p >= startTrigger) {
      const rawProgress = Math.min(Math.max((p - startTrigger) / (endTrigger - startTrigger), 0), 1);
      const progress = gsap.parseEase("sine.out")(rawProgress);

      // Rotate group in Y by -43.0° to counter the laptop's +43.0° rotation and bring it front-facing
      const rotY = gsap.utils.interpolate(0, THREE.MathUtils.degToRad(-43.0), progress);
      groupRef.current.rotation.y = rotY;
    } else {
      groupRef.current.rotation.y = 0;
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

export default SceneGroup;
