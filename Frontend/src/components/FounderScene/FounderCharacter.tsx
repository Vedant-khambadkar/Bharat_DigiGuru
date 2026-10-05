import React, { useRef, useState, useEffect, memo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { PersonConfig, SceneState } from '../../types/scene';

interface FounderCharacterProps {
  config: PersonConfig;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  sceneState: SceneState;
  onSelect: () => void;
  isMobile: boolean;
}

export const FounderCharacter: React.FC<FounderCharacterProps> = memo(({
  config,
  geometry,
  material,
  sceneState,
  onSelect,
  isMobile,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Smooth animation tracking refs
  const hoverProgressRef = useRef(0);
  const focusProgressRef = useRef(0);

  const [baseX, baseY, baseZ] = config.position;
  const baseRotX = config.rotationX ?? 0;
  const baseRotY = config.rotationY ?? 0;
  const baseRotZ = config.rotationZ ?? 0;
  const baseScale = config.scale;

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
    const group = groupRef.current;
    if (!group) return;

    // Hover progress lerping
    const targetHover = hovered && sceneState === 'overview' && !isMobile ? 1 : 0;
    hoverProgressRef.current = THREE.MathUtils.damp(
      hoverProgressRef.current,
      targetHover,
      6.0,
      delta
    );

    // Focus progress lerping
    const isFocused = sceneState === 'focusing' || sceneState === 'focused';
    const targetFocus = isFocused ? 1 : 0;
    focusProgressRef.current = THREE.MathUtils.damp(
      focusProgressRef.current,
      targetFocus,
      3.0,
      delta
    );

    const hoverVal = hoverProgressRef.current;
    const focusVal = focusProgressRef.current;

    // Subtle idle breathing
    const time = state.clock.getElapsedTime() * config.idleSpeed;
    const idleY = Math.sin(time * 1.1) * 0.012;
    const idleRot = Math.sin(time * 0.75) * 0.012;

    // Elevation on hover (+0.12)
    const hoverElevateY = hoverVal * 0.12;

    group.position.set(
      baseX,
      baseY + idleY + hoverElevateY,
      baseZ
    );

    group.rotation.set(
      baseRotX,
      baseRotY + idleRot + focusVal * 0.1,
      baseRotZ
    );

    const currentScale = baseScale * (1 + hoverVal * 0.05 + focusVal * 0.08);
    group.scale.setScalar(currentScale);
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
      <mesh
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow={false}
      />

      {/* Enlarged hit-box for smooth selection */}
      <mesh visible={false} position={[0, 0.9, 0]}>
        <boxGeometry args={[1.2, 2.2, 1.2]} />
        <meshBasicMaterial />
      </mesh>

      {/* Subtle "MEET THE FOUNDER" hover label (Desktop only) */}
      {!isMobile && sceneState === 'overview' && (
        <Html
          position={[0.7, 1.85, 0]}
          center
          distanceFactor={11}
          style={{
            pointerEvents: 'none',
            opacity: hovered ? 1 : 0,
            transform: `translate3d(${hovered ? '0' : '-8px'}, 0, 0) scale(${hovered ? 1 : 0.95})`,
            transition: 'opacity 0.35s ease-out, transform 0.35s ease-out',
          }}
        >
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-black/90 text-white rounded-full backdrop-blur-md shadow-2xl border border-black/80 whitespace-nowrap select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] tracking-[0.22em] font-medium font-mono uppercase">
              MEET THE FOUNDER
            </span>
          </div>
        </Html>
      )}
    </group>
  );
});

FounderCharacter.displayName = 'FounderCharacter';

export default FounderCharacter;
