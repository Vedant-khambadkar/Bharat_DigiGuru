import React, { useRef, useMemo, memo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { PersonConfig, SceneState } from '../../types/scene';

interface CharacterSilhouetteProps {
  config: PersonConfig;
  modelScene: THREE.Group;
  sceneState: SceneState;
  isVisible?: boolean;
}

export const CharacterSilhouette: React.FC<CharacterSilhouetteProps> = memo(({
  config,
  modelScene,
  sceneState,
  isVisible = true,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const stateProgressRef = useRef(0);

  // Clone authentic 3D businessman model hierarchy while reusing shared geometry & material
  const clonedScene = useMemo(() => {
    return modelScene.clone(true);
  }, [modelScene]);

  // Cached base values
  const [baseX, baseY, baseZ] = config.position;
  const baseRotX = config.rotationX ?? 0;
  const baseRotY = config.rotationY ?? 0;
  const baseRotZ = config.rotationZ ?? 0;
  const baseScale = config.scale;
  const phase = config.phaseOffset;
  const speed = config.idleSpeed;

  useFrame((state, delta) => {
    if (!isVisible) return;

    const group = groupRef.current;
    if (!group) return;

    // Smooth transition between overview and focused states
    const isFocused = sceneState === 'focusing' || sceneState === 'focused';
    const targetProgress = isFocused ? 1 : 0;

    // Fast damp calculation
    stateProgressRef.current = THREE.MathUtils.damp(
      stateProgressRef.current,
      targetProgress,
      3.0,
      delta
    );

    const progress = stateProgressRef.current;

    // Subtle idle animation (micro-rotation)
    const time = state.clock.getElapsedTime() * speed + phase;
    const idleRot = Math.sin(time * 0.8) * 0.015;

    // Push slightly backward when founder is focused
    const pushBackZ = -progress * 1.5;

    group.position.set(
      baseX,
      baseY,
      baseZ + pushBackZ
    );

    group.rotation.set(
      baseRotX,
      baseRotY + idleRot,
      baseRotZ
    );

    // Scale down slightly during focus to emphasize depth of field
    const scaleFactor = 1 - progress * 0.08;
    group.scale.setScalar(baseScale * scaleFactor);
  });

  const isApex = config.id === 'p_apex' || config.id === 'mp1';

  return (
    <group ref={groupRef} position={config.position} rotation={[0, baseRotY, 0]}>
      <primitive object={clonedScene} />

      {/* Apex Leader Vertical Light Line & Glowing Orange Bead */}
      {isApex && sceneState === 'overview' && (
        <group position={[0, 1.8, 0]}>
          {/* Vertical Light Line */}
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.9, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
          </mesh>
          {/* Glowing Orange Bead at Top */}
          <mesh position={[0, 0.9, 0]}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshBasicMaterial color="#ff5500" />
          </mesh>
          {/* Subtle Point Light */}
          <pointLight position={[0, 0.9, 0]} color="#ff5500" intensity={0.8} distance={2} />
        </group>
      )}
    </group>
  );
});

CharacterSilhouette.displayName = 'CharacterSilhouette';

export default CharacterSilhouette;
