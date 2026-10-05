import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import type { SceneState, PersonConfig } from '../../types/scene';

interface CameraControllerProps {
  sceneState: SceneState;
  onTransitionComplete: () => void;
  onReturnComplete: () => void;
  isMobile: boolean;
  founderConfig: PersonConfig;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  sceneState,
  onTransitionComplete,
  onReturnComplete,
  isMobile,
  founderConfig,
}) => {
  const { camera } = useThree();
  const targetLookAt = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());

  // Default camera setups (Matching the exact elevated perspective of the reference image)
  const defaultCam = isMobile
    ? {
      pos: [0.0, 5.8, 11.2] as [number, number, number],
      lookAt: [0.0, 0.4, 0.6] as [number, number, number],
      fov: 44,
    }
    : {
      pos: [0.0, 5.6, 12.8] as [number, number, number],
      lookAt: [0.1, 0.4, 0.4] as [number, number, number],
      fov: 34,
    };

  // Focused camera setups (cinematic medium shot of Founder)
  const [fx, , fz] = founderConfig.position;
  const focusCam = isMobile
    ? {
      pos: [fx * 0.4, 1.55, fz + 2.8] as [number, number, number],
      lookAt: [fx, 1.35, fz] as [number, number, number],
      fov: 30,
    }
    : {
      pos: [fx * 0.6, 1.6, fz + 3.2] as [number, number, number],
      lookAt: [fx, 1.38, fz] as [number, number, number],
      fov: 26,
    };

  // Sync initial camera position
  useEffect(() => {
    if (sceneState === 'overview') {
      camera.position.set(...defaultCam.pos);
      targetLookAt.current.set(...defaultCam.lookAt);
      currentLookAt.current.set(...defaultCam.lookAt);
      if ('fov' in camera) {
        (camera as THREE.PerspectiveCamera).fov = defaultCam.fov;
        camera.updateProjectionMatrix();
      }
      camera.lookAt(targetLookAt.current);
    }
  }, [isMobile]);

  // GSAP Transitions
  useEffect(() => {
    const perspCamera = camera as THREE.PerspectiveCamera;

    if (sceneState === 'focusing') {
      const tl = gsap.timeline({
        onComplete: () => {
          onTransitionComplete();
        },
      });

      tl.to(camera.position, {
        x: focusCam.pos[0],
        y: focusCam.pos[1],
        z: focusCam.pos[2],
        duration: 1.5,
        ease: 'power3.inOut',
      }, 0);

      tl.to(targetLookAt.current, {
        x: focusCam.lookAt[0],
        y: focusCam.lookAt[1],
        z: focusCam.lookAt[2],
        duration: 1.5,
        ease: 'power3.inOut',
      }, 0);

      tl.to(perspCamera, {
        fov: focusCam.fov,
        duration: 1.5,
        ease: 'power3.inOut',
        onUpdate: () => perspCamera.updateProjectionMatrix(),
      }, 0);

      return () => {
        tl.kill();
      };
    } else if (sceneState === 'returning') {
      const tl = gsap.timeline({
        onComplete: () => {
          onReturnComplete();
        },
      });

      tl.to(camera.position, {
        x: defaultCam.pos[0],
        y: defaultCam.pos[1],
        z: defaultCam.pos[2],
        duration: 1.4,
        ease: 'power3.inOut',
      }, 0);

      tl.to(targetLookAt.current, {
        x: defaultCam.lookAt[0],
        y: defaultCam.lookAt[1],
        z: defaultCam.lookAt[2],
        duration: 1.4,
        ease: 'power3.inOut',
      }, 0);

      tl.to(perspCamera, {
        fov: defaultCam.fov,
        duration: 1.4,
        ease: 'power3.inOut',
        onUpdate: () => perspCamera.updateProjectionMatrix(),
      }, 0);

      return () => {
        tl.kill();
      };
    }
  }, [sceneState, isMobile, founderConfig]);

  useFrame(() => {
    currentLookAt.current.lerp(targetLookAt.current, 0.12);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};
