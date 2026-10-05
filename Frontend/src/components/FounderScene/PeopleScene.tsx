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
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    if (!(window as any).__bdgBusinessmanLoggedStart) {
      (window as any).__bdgBusinessmanLoggedStart = true;
      console.log("[TEAM] Businessman loading");
      console.log("[3D TIMING] Businessman request start");
    }
  }

  // Load authentic 3D businessman model (single GLTF source)
  const gltf = useGLTF(MODEL_URLS.businessman);
  const isReadySignaled = useRef(false);

  // Prepare normalized base model scene
  const { baseScene, tSceneStart, tSceneEnd } = useMemo(() => {
    const tStart = performance.now();
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

    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = SHARED_MATTE_BLACK_MATERIAL;
        child.castShadow = true;
        child.receiveShadow = false;
      }
    });

    const tEnd = performance.now();
    return { baseScene: scene, tSceneStart: tStart, tSceneEnd: tEnd };
  }, [gltf.scene]);

  // Signal Businessman Model Readiness once rendered in R3F lifecycle
  useEffect(() => {
    if (!gltf.scene || isReadySignaled.current) return;

    const tMount = performance.now();
    let frameId2: number;
    const frameId1 = requestAnimationFrame(() => {
      frameId2 = requestAnimationFrame(() => {
        if (isReadySignaled.current) return;
        isReadySignaled.current = true;
        const tFirstFrame = performance.now();

        if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
          console.log("[TEAM] Businessman GLB loaded");
          console.log("[TEAM] Businessman scene ready");
          console.log("[TEAM] Businessman first frame");
          console.log("[TEAM] Businessman ready");

          const startTime = Number((window as any).__bdgBusinessmanStartTime) || tMount;
          const resourceEntries = performance.getEntriesByName(MODEL_URLS.businessman) as PerformanceResourceTiming[];
          const glbEntry = resourceEntries.length > 0 ? resourceEntries[resourceEntries.length - 1] : undefined;

          const downloadDuration = glbEntry && glbEntry.responseEnd > glbEntry.requestStart && glbEntry.requestStart > 0
            ? glbEntry.responseEnd - glbEntry.requestStart
            : glbEntry ? glbEntry.duration : Math.max(0, tSceneStart - startTime);

          const glbLoadedTime = Math.max(downloadDuration, tSceneStart - startTime);
          const sceneSetupTime = Math.max(0, tSceneEnd - tSceneStart);
          const firstFrameTime = Math.max(0, tFirstFrame - tSceneEnd);
          const totalDuration = Math.max(0, tFirstFrame - startTime);

          console.log(`[3D TIMING] Businessman GLB loaded: ${glbLoadedTime.toFixed(1)} ms`);
          console.log(`[3D TIMING] Businessman scene ready: ${sceneSetupTime.toFixed(1)} ms`);
          console.log(`[3D TIMING] Businessman first frame: ${firstFrameTime.toFixed(1)} ms`);
          console.log(`[3D TIMING] Businessman total: ${totalDuration.toFixed(1)} ms`);
        }

        onReady?.();
      });
    });

    return () => {
      cancelAnimationFrame(frameId1);
      cancelAnimationFrame(frameId2);
    };
  }, [gltf.scene, tSceneStart, tSceneEnd, onReady]);

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
