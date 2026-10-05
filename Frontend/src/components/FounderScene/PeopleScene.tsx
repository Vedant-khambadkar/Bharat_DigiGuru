import React, { useMemo, memo } from 'react';
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
}

export const PeopleScene: React.FC<PeopleSceneProps> = memo(({
  sceneState,
  onSelectFounder,
  onTransitionComplete,
  onReturnComplete,
  isMobile,
}) => {
  // Load authentic 3D businessman model
  const gltf = useGLTF(MODEL_URLS.businessman);

  // Prepare normalized base model scene
  const baseScene = useMemo(() => {
    const scene = gltf.scene.clone(true);
    scene.updateMatrixWorld(true);

    // First scale to standard height (1.8m)
    const rawBox = new THREE.Box3().setFromObject(scene);
    const rawSize = new THREE.Vector3();
    rawBox.getSize(rawSize);
    if (rawSize.y > 0) {
      const scaleRatio = 1.8 / rawSize.y;
      scene.scale.setScalar(scaleRatio);
    }
    scene.updateMatrixWorld(true);

    // Compute exact grounded bounding box so soles of the shoes sit flush on y = 0
    const scaledBox = new THREE.Box3().setFromObject(scene);
    scene.position.y = -scaledBox.min.y;

    const matteBlackMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
    });

    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = matteBlackMaterial;
        child.castShadow = true;
        child.receiveShadow = false;
      }
    });

    return scene;
  }, [gltf.scene]);

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
      />

      <group
        position={isMobile ? [0, 0, -0.5] : [0, 0, -1]}
        scale={isMobile ? 0.95 : 0.6}
        name="CrowdCollective"
      >
        {peopleList.map((person) => (
          <CharacterSilhouette
            key={person.id}
            config={person}
            modelScene={baseScene}
            sceneState={sceneState}
          />
        ))}
      </group>

      <FounderCharacter
        config={founderConfig}
        modelScene={baseScene}
        sceneState={sceneState}
        onSelect={onSelectFounder}
        isMobile={isMobile}
      />
    </>
  );
});

PeopleScene.displayName = 'PeopleScene';

export default PeopleScene;
