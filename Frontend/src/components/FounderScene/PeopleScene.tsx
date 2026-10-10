import React, { useMemo, memo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { DESKTOP_PEOPLE, DESKTOP_FOUNDER, MOBILE_PEOPLE, MOBILE_FOUNDER } from './PeopleData';
import { CharacterSilhouette } from './CharacterSilhouette';
import { FounderCharacter } from './FounderCharacter';
import StudioEnvironment from './StudioEnvironment';
import { CameraController } from './CameraController';
import type { SceneState } from '../../types/scene';
import { MODEL_URLS } from '../../config/models';

interface PeopleSceneProps {
  sceneState: SceneState;
  onSelectFounder: () => void;
  onTransitionComplete: () => void;
  onReturnComplete: () => void;
  isMobile: boolean;
  isVisible?: boolean;
  onReady?: () => void;
}

// Single shared matte black silhouette material instance across all characters
const SHARED_MATTE_BLACK_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x000000,
});

export const PeopleScene: React.FC<PeopleSceneProps> = memo(({
  sceneState,
  onSelectFounder,
  onTransitionComplete,
  onReturnComplete,
  isMobile,
  isVisible = true,
  onReady,
}) => {

  // Load authentic 3D businessman model (single GLTF source)
  const gltf = useGLTF(MODEL_URLS.businessman);
  const isReadySignaled = useRef(false);

  // Prepare normalized base model scene ONCE (shared geometry & material across all characters)
  const baseScene = useMemo(() => {
    const scene = gltf.scene.clone(true);
    scene.updateMatrixWorld(true);

    // Scale to standard height (1.8m)
    const rawBox = new THREE.Box3().setFromObject(scene);
    const rawSize = new THREE.Vector3();
    rawBox.getSize(rawSize);
    if (rawSize.y > 0) {
      const scaleRatio = 1.8 / rawSize.y;
      scene.scale.setScalar(scaleRatio);
    }
    scene.updateMatrixWorld(true);

    // Compute exact grounded bounding box so soles of shoes sit flush on y = 0
    const scaledBox = new THREE.Box3().setFromObject(scene);
    scene.position.y = -scaledBox.min.y;

    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = SHARED_MATTE_BLACK_MATERIAL;
        child.castShadow = true;
        child.receiveShadow = false;
      }
    });

    return scene;
  }, [gltf.scene]);

  // Signal Businessman Model Readiness once rendered in R3F lifecycle
  useEffect(() => {
    if (!gltf.scene || isReadySignaled.current) return;

    let frameId2: number;
    const frameId1 = requestAnimationFrame(() => {
      frameId2 = requestAnimationFrame(() => {
        if (isReadySignaled.current) return;
        isReadySignaled.current = true;
        onReady?.();
      });
    });

    return () => {
      cancelAnimationFrame(frameId1);
      cancelAnimationFrame(frameId2);
    };
  }, [gltf.scene, onReady]);

  const peopleList = useMemo(() => (isMobile ? MOBILE_PEOPLE : DESKTOP_PEOPLE), [isMobile]);
  const founderConfig = useMemo(() => (isMobile ? MOBILE_FOUNDER : DESKTOP_FOUNDER), [isMobile]);

  return (
    <>
      <StudioEnvironment isMobile={isMobile} />

      <CameraController
        sceneState={sceneState}
        onTransitionComplete={onTransitionComplete}
        onReturnComplete={onReturnComplete}
        isMobile={isMobile}
        founderConfig={founderConfig}
        isVisible={isVisible}
      />

      <group
        position={isMobile ? [0, 0, -0.6] : [0, 0, -1]}
        scale={isMobile ? 0.64 : 0.6}
        name="CrowdCollective"
      >
        {peopleList.map((person) => (
          <CharacterSilhouette
            key={person.id}
            config={person}
            modelScene={baseScene}
            sceneState={sceneState}
            isVisible={isVisible}
          />
        ))}
      </group>

      <FounderCharacter
        config={founderConfig}
        modelScene={baseScene}
        sceneState={sceneState}
        onSelect={onSelectFounder}
        isMobile={isMobile}
        isVisible={isVisible}
      />
    </>
  );
});

PeopleScene.displayName = 'PeopleScene';

export default PeopleScene;
