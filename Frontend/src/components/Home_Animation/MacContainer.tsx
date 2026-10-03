import { useGLTF, useScroll, useTexture, ContactShadows } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

import macModel from "../../assets/Model/mac.glb";
import heroImg from "../../assets/Picture/Picture3.webp";
import keyboardImg from "../../assets/Picture/keyboard Texture2.png";

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

const MacContainer = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();
  const mac = useGLTF(macModel);
  const screen = useTexture(heroImg);
  const keyboard = useTexture(keyboardImg);

  // Setup textures and materials cleanly with useMemo to avoid re-creation on every render
  const { meshes } = useMemo(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

    keyboard.colorSpace = THREE.SRGBColorSpace;
    keyboard.anisotropy = maxAnisotropy;
    keyboard.minFilter = THREE.LinearMipmapLinearFilter;
    keyboard.magFilter = THREE.LinearFilter;
    keyboard.generateMipmaps = true;
    keyboard.needsUpdate = true;

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

    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#14161a"),
      metalness: 0.94,
      roughness: 0.24,
      envMapIntensity: 2.2,
    });

    const meshMap: Record<string, THREE.Object3D> = {};
    mac.scene.traverse((child: THREE.Object3D) => {
      meshMap[child.name] = child;

      if ((child as THREE.Mesh).isMesh) {
        const meshChild = child as THREE.Mesh;
        if (child.name === "matte") {
          meshChild.material = screenMaterial;
        } else {
          meshChild.material = chassisMaterial;
        }
      }
    });

    if (meshMap.screen) {
      meshMap.screen.rotation.x = THREE.MathUtils.degToRad(182);
    }

    return { meshes: meshMap, screenMaterial, chassisMaterial };
  }, [mac.scene, screen, keyboard, gl]);

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

  const data = useScroll();

  // GSAP-driven Scroll Animation Frame Loop
  useFrame(() => {
    const p = data ? data.offset : 0;

    // Progress across scroll window with silky smooth sine.out easing
    const span = Math.max(PARAMS.scrollEnd - PARAMS.scrollStart, 0.01);
    const rawProgress = Math.min(Math.max((p - PARAMS.scrollStart) / span, 0), 1);
    const laptopProgress = gsap.parseEase("sine.out")(rawProgress);

    // 1. Screen Lid Opening Animation
    if (meshes.screen) {
      const lidAngle = gsap.utils.interpolate(PARAMS.lidClosedAngle, PARAMS.lidOpenAngle, laptopProgress);
      meshes.screen.rotation.x = THREE.MathUtils.degToRad(lidAngle);
    }

    // 2. Base/Chassis Position & Rotation & Scale
    if (groupRef.current) {
      const curX = gsap.utils.interpolate(PARAMS.startX, PARAMS.targetX, laptopProgress);
      const curY = gsap.utils.interpolate(PARAMS.startY, PARAMS.targetY, laptopProgress);
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

      const curScale = gsap.utils.interpolate(PARAMS.startScale, PARAMS.scale, laptopProgress);

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
      <mesh position={[0, 0.05, -0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[31.4, 22.0]} />
        <meshBasicMaterial
          map={keyboard}
          toneMapped={false}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
        />
      </mesh>

      {/* Tight, realistic contact shadow directly beneath the laptop chassis */}
      <ContactShadows
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

useGLTF.preload(macModel);
useTexture.preload(heroImg);
useTexture.preload(keyboardImg);

export default MacContainer;

