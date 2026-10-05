import React, { useMemo, useState, useEffect, memo } from 'react';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DESKTOP_PEOPLE, DESKTOP_FOUNDER, MOBILE_PEOPLE, MOBILE_FOUNDER } from './PeopleData';
import { CharacterSilhouette } from './CharacterSilhouette';
import { FounderCharacter } from './FounderCharacter';
import StudioEnvironment from './StudioEnvironment';
import { CameraController } from './CameraController';
import type { SceneState } from '../../types/scene';

interface PeopleSceneProps {
  sceneState: SceneState;
  onSelectFounder: () => void;
  onTransitionComplete: () => void;
  onReturnComplete: () => void;
  isMobile: boolean;
}

// Module-level singleton procedural geometry
let cachedProceduralGeometry: THREE.BufferGeometry | null = null;
function getStylizedHumanoidGeometry(): THREE.BufferGeometry {
  if (cachedProceduralGeometry) return cachedProceduralGeometry;

  const parts: THREE.BufferGeometry[] = [];

  const head = new THREE.SphereGeometry(0.12, 16, 16);
  head.scale(0.85, 1.12, 0.9);
  head.translate(0, 1.62, 0);
  parts.push(head);

  const neck = new THREE.CylinderGeometry(0.045, 0.055, 0.08, 12);
  neck.translate(0, 1.48, 0);
  parts.push(neck);

  const torso = new THREE.CylinderGeometry(0.21, 0.16, 0.58, 16);
  torso.scale(1.22, 1, 0.72);
  torso.translate(0, 1.18, 0);
  parts.push(torso);

  const hips = new THREE.CylinderGeometry(0.16, 0.17, 0.22, 16);
  hips.scale(1.16, 1, 0.72);
  hips.translate(0, 0.82, 0);
  parts.push(hips);

  const leftLeg = new THREE.CylinderGeometry(0.062, 0.046, 0.78, 12);
  leftLeg.translate(-0.085, 0.42, 0);
  parts.push(leftLeg);

  const rightLeg = new THREE.CylinderGeometry(0.062, 0.046, 0.78, 12);
  rightLeg.translate(0.085, 0.42, 0);
  parts.push(rightLeg);

  const leftShoe = new THREE.BoxGeometry(0.085, 0.06, 0.17);
  leftShoe.translate(-0.085, 0.03, 0.03);
  parts.push(leftShoe);

  const rightShoe = new THREE.BoxGeometry(0.085, 0.06, 0.17);
  rightShoe.translate(0.085, 0.03, 0.03);
  parts.push(rightShoe);

  const leftArm = new THREE.CylinderGeometry(0.042, 0.035, 0.54, 12);
  leftArm.rotateZ(THREE.MathUtils.degToRad(-8));
  leftArm.translate(-0.25, 1.15, 0);
  parts.push(leftArm);

  const rightArm = new THREE.CylinderGeometry(0.042, 0.035, 0.54, 12);
  rightArm.rotateZ(THREE.MathUtils.degToRad(8));
  rightArm.translate(0.25, 1.15, 0);
  parts.push(rightArm);

  cachedProceduralGeometry = BufferGeometryUtils.mergeGeometries(parts, false);
  cachedProceduralGeometry.computeVertexNormals();
  return cachedProceduralGeometry;
}

// Module-level singleton material
const SILHOUETTE_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x0a0a0a,
});

let cachedExtractedGeometry: THREE.BufferGeometry | null = null;

export const PeopleScene: React.FC<PeopleSceneProps> = memo(({
  sceneState,
  onSelectFounder,
  onTransitionComplete,
  onReturnComplete,
  isMobile,
}) => {
  const [activeGeometry, setActiveGeometry] = useState<THREE.BufferGeometry>(() =>
    cachedExtractedGeometry || getStylizedHumanoidGeometry()
  );

  // Background non-suspending asynchronous loader for realistic businessman model
  useEffect(() => {
    if (cachedExtractedGeometry) {
      setActiveGeometry(cachedExtractedGeometry);
      return;
    }

    let isDisposed = false;
    const loader = new GLTFLoader();
    loader.load(
      '/businessman.glb',
      (gltf) => {
        if (isDisposed) return;
        try {
          const scene = gltf.scene;
          scene.updateMatrixWorld(true);
          let sourceGeom: THREE.BufferGeometry | null = null;
          scene.traverse((child: any) => {
            if (!sourceGeom && child.isMesh && child.geometry) {
              sourceGeom = child.geometry.clone();
            }
          });

          if (sourceGeom) {
            const g = sourceGeom as THREE.BufferGeometry;
            g.computeBoundingBox();
            if (g.boundingBox) {
              const minY = g.boundingBox.min.y;
              const currentHeight = g.boundingBox.max.y - minY;
              g.translate(0, -minY, 0);

              if (currentHeight > 0) {
                const targetHeight = 1.8;
                const scaleRatio = targetHeight / currentHeight;
                g.scale(scaleRatio, scaleRatio, scaleRatio);
              }
            }
            g.computeVertexNormals();
            cachedExtractedGeometry = g;
            setActiveGeometry(g);
          }
        } catch (e) {
          console.warn('GLB geometry extraction notice:', e);
        }
      },
      undefined,
      (err) => {
        console.warn('GLB load notice (using procedural geometry):', err);
      }
    );

    return () => {
      isDisposed = true;
    };
  }, []);

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

      <group position={[0, 0.2, -1]} scale={0.6} name="CrowdCollective">
        {peopleList.map((person) => (
          <CharacterSilhouette
            key={person.id}
            config={person}
            geometry={activeGeometry}
            material={SILHOUETTE_MATERIAL}
            sceneState={sceneState}
          />
        ))}
      </group>

      <FounderCharacter
        config={founderConfig}
        geometry={activeGeometry}
        material={SILHOUETTE_MATERIAL}
        sceneState={sceneState}
        onSelect={onSelectFounder}
        isMobile={isMobile}
      />
    </>
  );
});

PeopleScene.displayName = 'PeopleScene';

export default PeopleScene;
