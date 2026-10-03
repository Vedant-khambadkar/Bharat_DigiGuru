import React, { useRef ,useMemo} from "react";
import { useScroll, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import InstagramImg from "../../assets/Picture/Instagram.png";

const PARAMS = {
  // Start Pose (Emerges from center)

  "startPosX": -4.3,
  "startPosY": -0.5,
  "startPosZ": -1.2,
  "startRotXDeg": -10,
  "startRotYDeg": 37.5,
  "startRotZDeg": 0,
  "startScale": 0.01,
  "posX": -6.3,
  "posY": 5,
  "posZ": 8.4,
  "rotXDeg": 3,
  "rotYDeg": 20.5,
  "rotZDeg": -1.5,
  "scale": 3.9,
  "opacity": 1,
  "planeWidth": 5.15,
  "planeHeight": 3.9,
  "scrollStart": 0.18,
  "scrollEnd": 0.38

};

const InstagramAnimation: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(InstagramImg);
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

      // Silky smooth GSAP sine.out easing
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
