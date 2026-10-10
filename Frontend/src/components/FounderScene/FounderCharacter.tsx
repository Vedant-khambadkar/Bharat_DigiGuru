import React, { useRef, useState, useEffect, useMemo, memo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { PersonConfig, SceneState } from '../../types/scene';

interface FounderCharacterProps {
  config: PersonConfig;
  modelScene: THREE.Group;
  sceneState: SceneState;
  onSelect: () => void;
  isMobile: boolean;
  isVisible?: boolean;
}

// Static reusable reticle materials
const RETICLE_INNER_MATERIAL = new THREE.MeshBasicMaterial({
  color: "#000000",
  transparent: true,
  opacity: 0.25,
  side: THREE.DoubleSide,
});

const RETICLE_MID_MATERIAL = new THREE.MeshBasicMaterial({
  color: "#000000",
  transparent: true,
  opacity: 0.35,
  side: THREE.DoubleSide,
});

const RETICLE_OUTER_MATERIAL = new THREE.MeshBasicMaterial({
  color: "#000000",
  transparent: true,
  opacity: 0.2,
  side: THREE.DoubleSide,
});

const RETICLE_ORANGE_ARC_1 = new THREE.MeshBasicMaterial({
  color: "#ff5500",
  transparent: true,
  opacity: 0.9,
  side: THREE.DoubleSide,
});

const RETICLE_ORANGE_ARC_2 = new THREE.MeshBasicMaterial({
  color: "#ff5500",
  transparent: true,
  opacity: 0.85,
  side: THREE.DoubleSide,
});

const RETICLE_ORANGE_DOT_MATERIAL = new THREE.MeshBasicMaterial({
  color: "#ff5500",
  transparent: true,
  opacity: 0.95,
  side: THREE.DoubleSide,
});

const CARDINAL_ANGLES = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

export const FounderCharacter: React.FC<FounderCharacterProps> = memo(({
  config,
  modelScene,
  sceneState,
  onSelect,
  isMobile,
  isVisible = true,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Smooth animation tracking refs
  const hoverProgressRef = useRef(0);
  const focusProgressRef = useRef(0);

  // Clone authentic 3D businessman model for the Founder while sharing geometry & materials
  const clonedScene = useMemo(() => {
    return modelScene.clone(true);
  }, [modelScene]);

  const [baseX, baseY, baseZ] = config.position;
  const baseRotX = config.rotationX ?? 0;
  const baseRotY = config.rotationY ?? 0;
  const baseRotZ = config.rotationZ ?? 0;
  const baseScale = config.scale;

  const reticleOuterRef = useRef<THREE.Group>(null);
  const reticleInnerRef = useRef<THREE.Group>(null);

  // Change cursor when hovering over the founder
  useEffect(() => {
    if (sceneState === 'overview' && !isMobile) {
      document.body.style.cursor = hovered ? 'pointer' : 'auto';
    } else {
      document.body.style.cursor = 'auto';
    }
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, sceneState, isMobile]);

  useFrame((state, delta) => {
    if (!isVisible) return;

    const group = groupRef.current;
    if (!group) return;

    // Continuous smooth rotation loop for HUD reticles
    if (reticleOuterRef.current) {
      reticleOuterRef.current.rotation.z += delta * 0.4;
    }
    if (reticleInnerRef.current) {
      reticleInnerRef.current.rotation.z -= delta * 0.22;
    }

    // Hover progress lerping
    const targetHover = hovered && sceneState === 'overview' && !isMobile ? 1 : 0;
    if (Math.abs(hoverProgressRef.current - targetHover) > 0.0005) {
      hoverProgressRef.current = THREE.MathUtils.damp(
        hoverProgressRef.current,
        targetHover,
        6.0,
        delta
      );
    } else {
      hoverProgressRef.current = targetHover;
    }

    // Focus progress lerping
    const isFocused = sceneState === 'focusing' || sceneState === 'focused';
    const targetFocus = isFocused ? 1 : 0;
    if (Math.abs(focusProgressRef.current - targetFocus) > 0.0005) {
      focusProgressRef.current = THREE.MathUtils.damp(
        focusProgressRef.current,
        targetFocus,
        3.0,
        delta
      );
    } else {
      focusProgressRef.current = targetFocus;
    }

    const hoverVal = hoverProgressRef.current;
    const focusVal = focusProgressRef.current;

    // Smooth idle breathing and micro-weight shift loop
    const time = state.clock.getElapsedTime() * (config.idleSpeed || 0.85);
    const idleRot = Math.sin(time * 0.75) * 0.02;
    const idleBob = Math.sin(time * 1.5) * 0.008;

    group.position.set(
      baseX,
      baseY + idleBob,
      baseZ
    );

    group.rotation.set(
      baseRotX,
      baseRotY + idleRot + focusVal * 0.1,
      baseRotZ
    );

    if (hoverVal > 0.0005 || focusVal > 0.0005) {
      const currentScale = baseScale * (1 + hoverVal * 0.05 + focusVal * 0.08);
      group.scale.setScalar(currentScale);
    } else {
      group.scale.setScalar(baseScale);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (sceneState === 'overview' || sceneState === 'returning') {
      onSelect();
    }
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (sceneState === 'overview') {
      setHovered(true);
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
  };

  return (
    <group
      ref={groupRef}
      position={config.position}
      rotation={[0, baseRotY, 0]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <primitive object={clonedScene} />

      {/* Enlarged hit-box for smooth selection */}
      <mesh visible={false} position={[0, 0.9, 0]}>
        <boxGeometry args={[1.4, 2.2, 1.4]} />
        <meshBasicMaterial />
      </mesh>

      {/* EXACT 1:1 FLOOR HUD CIRCULAR RETICLE SYSTEM WITH CONTINUOUS ROTATION LOOP */}
      {sceneState === 'overview' && (
        <group
          position={[0, 0.002, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={isMobile ? 0.78 : 1.0}
        >
          {/* 1. Base Static Orbit Rings */}
          <mesh material={RETICLE_INNER_MATERIAL}>
            <ringGeometry args={[0.78, 0.795, 64]} />
          </mesh>

          <mesh material={RETICLE_MID_MATERIAL}>
            <ringGeometry args={[0.98, 0.995, 64]} />
          </mesh>

          <mesh material={RETICLE_OUTER_MATERIAL}>
            <ringGeometry args={[1.22, 1.235, 64]} />
          </mesh>

          {/* 2. Clockwise Spinning Outer Arcs & Cardinal Dots */}
          <group ref={reticleOuterRef}>
            <mesh rotation={[0, 0, 0.35]} material={RETICLE_ORANGE_ARC_1}>
              <ringGeometry args={[0.96, 1.015, 32, 1, 0, Math.PI * 0.35]} />
            </mesh>

            <mesh rotation={[0, 0, Math.PI + 0.5]} material={RETICLE_ORANGE_ARC_1}>
              <ringGeometry args={[0.96, 1.015, 32, 1, 0, Math.PI * 0.28]} />
            </mesh>

            {CARDINAL_ANGLES.map((angle, i) => (
              <mesh
                key={i}
                position={[Math.cos(angle) * 1.23, Math.sin(angle) * 1.23, 0.001]}
                material={RETICLE_ORANGE_DOT_MATERIAL}
              >
                <circleGeometry args={[0.022, 16]} />
              </mesh>
            ))}
          </group>

          {/* 3. Counter-Clockwise Spinning Inner Accent Arc */}
          <group ref={reticleInnerRef}>
            <mesh rotation={[0, 0, -Math.PI * 0.4]} material={RETICLE_ORANGE_ARC_2}>
              <ringGeometry args={[1.20, 1.25, 32, 1, 0, Math.PI * 0.22]} />
            </mesh>
          </group>
        </group>
      )}

      {/* EXACT 1:1 ANGLED LEADER LINE & CALLOUT HUD BADGE */}
      {sceneState === 'overview' && (
        <Html
          position={isMobile ? [0.18, 0.88, 0] : [0.22, 0.95, 0]}
          center={false}
          distanceFactor={isMobile ? 10.5 : 10.5}
          style={{
            pointerEvents: 'auto',
            cursor: 'pointer',
            userSelect: 'none',
            touchAction: 'pan-y',
          }}
        >
          <div
            onClick={handleClick}
            className="relative flex items-center group cursor-pointer"
            style={{
              transform: isMobile ? 'scale(0.72) translateY(-50%)' : 'translateY(-50%)',
              transformOrigin: 'left center',
            }}
          >
            {/* Precision Angled Leader Line (SVG) */}
            <svg
              width={isMobile ? "42" : "56"}
              height={isMobile ? "32" : "40"}
              viewBox={isMobile ? "0 0 42 32" : "0 0 56 40"}
              fill="none"
              className="overflow-visible shrink-0 transition-opacity duration-300 group-hover:opacity-100 opacity-90"
            >
              <polyline
                points={isMobile ? "0,26 18,8 42,8" : "0,32 24,10 56,10"}
                stroke="#111111"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="0" cy={isMobile ? 26 : 32} r="2.2" fill="#111111" />
            </svg>

            {/* Callout Text Block */}
            <div className="flex flex-col items-start pl-1.5 -mt-6">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff5500] shadow-[0_0_8px_#ff5500] shrink-0" />
                <span className="text-[12px] sm:text-[14px] font-mono tracking-[0.22em] font-extrabold text-[#050505] uppercase whitespace-nowrap">
                  FOUNDER
                </span>
              </div>

              <div className="flex items-center gap-1 text-[8.5px] sm:text-[10px] font-mono tracking-[0.2em] text-[#333333] font-bold uppercase pl-3.5 group-hover:text-black transition-colors whitespace-nowrap">
                <span>EXPLORE PROFILE</span>
                <span className="text-[10px] text-[#ff5500] font-bold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                  ↗
                </span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
});

FounderCharacter.displayName = 'FounderCharacter';

export default FounderCharacter;
