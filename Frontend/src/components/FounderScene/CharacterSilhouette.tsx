import React, { useRef, memo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { PersonConfig, SceneState } from '../../types/scene';

interface CharacterSilhouetteProps {
  config: PersonConfig;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  sceneState: SceneState;
}

export const CharacterSilhouette: React.FC<CharacterSilhouetteProps> = memo(({
  config,
  geometry,
  material,
  sceneState,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const stateProgressRef = useRef(0);

  // Cached base values
  const [baseX, baseY, baseZ] = config.position;
  const baseRotX = config.rotationX ?? 0;
  const baseRotY = config.rotationY ?? 0;
  const baseRotZ = config.rotationZ ?? 0;
  const baseScale = config.scale;
  const phase = config.phaseOffset;
  const speed = config.idleSpeed;

  useFrame((state, delta) => {
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

    // Subtle idle animation (breathing + tiny micro-rotation)
    const time = state.clock.getElapsedTime() * speed + phase;
    const idleY = Math.sin(time * 1.2) * 0.012;
    const idleRot = Math.sin(time * 0.8) * 0.015;

    // Push slightly backward and sink slightly when founder is focused
    const pushBackZ = -progress * 1.5;
    const pushFadeY = -progress * 0.1;

    group.position.set(
      baseX,
      baseY + idleY + pushFadeY,
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

  return (
    <group ref={groupRef} position={config.position} rotation={[0, baseRotY, 0]}>
      <mesh
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow={false}
      />
    </group>
  );
});

CharacterSilhouette.displayName = 'CharacterSilhouette';

export default CharacterSilhouette;
