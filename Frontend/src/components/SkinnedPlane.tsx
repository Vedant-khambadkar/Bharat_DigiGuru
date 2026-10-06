import React, { useMemo, useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { loadSharedThreeTexture } from "../utils/mediaCache";

const WIDTH = 4.0;
const HEIGHT = 2.5;
const SEGMENTS = 30;
const RADIUS = 0.12;

export interface PlaneItem {
  id: number | string;
  title: string;
  category?: string;
  textureUrl: string;
  color?: string;
}

function createSkinnedPlaneData(
  width: number,
  height: number,
  segments: number,
  _textureUrl?: string,
  color: string = "#6c8ebb"
) {
  // 1. Plane geometry subdivided horizontally along X-axis
  const geometry = new THREE.PlaneGeometry(width, height, segments, 1);

  // Shift geometry so the left edge (top-left to bottom-left) is anchored at x = 0
  geometry.translate(width / 2, 0, 0);

  const position = geometry.attributes.position;
  const skinIndexes: number[] = [];
  const skinWeights: number[] = [];
  const segmentWidth = width / segments;

  // 2. Calculate bone skinning weights based on X coordinate
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const bonePos = (x / width) * segments;
    let boneIdx = Math.floor(bonePos);
    boneIdx = Math.min(boneIdx, segments - 1);
    const weight = bonePos - boneIdx;

    skinIndexes.push(boneIdx, boneIdx + 1, 0, 0);
    skinWeights.push(1 - weight, weight, 0, 0);
  }

  geometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndexes, 4));
  geometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeights, 4));

  // 3. Bone hierarchy along X starting at x = 0
  const bones: THREE.Bone[] = [];
  for (let i = 0; i <= segments; i++) {
    const bone = new THREE.Bone();
    if (i === 0) {
      bone.position.set(0, 0, 0);
    } else {
      bone.position.set(segmentWidth, 0, 0);
      bones[i - 1].add(bone);
    }
    bones.push(bone);
  }

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const skeleton = new THREE.Skeleton(bones);

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    side: THREE.DoubleSide,
    roughness: 0.35,
    metalness: 0.05,
  });

  const mesh = new THREE.SkinnedMesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.add(bones[0]);
  mesh.bind(skeleton);

  const skeletonHelper = new THREE.SkeletonHelper(mesh);

  return { mesh, bones, skeleton, skeletonHelper, material };
}

interface SingleSkinnedPlaneProps {
  plane: PlaneItem;
  width?: number;
  height?: number;
  segments?: number;
  textureUrl?: string;
  color?: string;
  rotationY?: number;
  radius?: number;
  showSkeleton?: boolean;
  bendState?: React.MutableRefObject<number>;
  isRotatingRef?: React.MutableRefObject<boolean>;
  onHoverPlane?: (plane: PlaneItem) => void;
}

export const SingleSkinnedPlane: React.FC<SingleSkinnedPlaneProps> = ({
  plane,
  width = WIDTH,
  height = HEIGHT,
  segments = SEGMENTS,
  textureUrl,
  color = "#6c8ebb",
  rotationY = 0,
  radius = RADIUS,
  showSkeleton = false,
  bendState,
  isRotatingRef,
  onHoverPlane,
}) => {
  const meshRef = useRef<THREE.SkinnedMesh>(null!);
  const groupYRef = useRef<THREE.Group>(null!);
  const [isHovered, setIsHovered] = useState(false);

  const { mesh, skeletonHelper } = useMemo(() => {
    return createSkinnedPlaneData(width, height, segments, undefined, color);
  }, [width, height, segments, color]);

  // Load texture using centralized deduplication cache with progressive loading
  useEffect(() => {
    if (!textureUrl || textureUrl.trim().length === 0) {
      if (meshRef.current) {
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.map = null;
          mat.color.set(color);
          mat.needsUpdate = true;
        }
      }
      return;
    }

    let isCancelled = false;
    const cleanUrl = textureUrl.trim();

    loadSharedThreeTexture(cleanUrl).then((tex) => {
      if (isCancelled || !tex || !meshRef.current) return;
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.map = tex;
        mat.color.set("#ffffff");
        mat.needsUpdate = true;
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [textureUrl, color]);

  // Clean WebGL geometry disposal on dynamic change / unmount
  useEffect(() => {
    return () => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else if (mesh.material) {
        mesh.material.dispose();
      }
    };
  }, [mesh]);

  // Frame update: bend bones on drag and smoothly animate Y elevation ONLY while actively hovered
  useFrame((_, delta) => {
    // 1. Dynamic bone bend only when bend velocity is active
    const bones = meshRef.current?.skeleton?.bones;
    if (bones && bendState) {
      const currentBend = bendState.current;
      if (Math.abs(currentBend) > 0.0001 || Math.abs(bones[1]?.rotation?.y || 0) > 0.0001) {
        for (let j = 1; j < bones.length; j++) {
          const factor = j / segments;
          bones[j].rotation.y = currentBend * (0.4 + factor * 1.1);
        }
      }
    }

    // 2. Y-Elevation: rises to +0.45 on hover; drops immediately back to 0 when cursor leaves or when rotating
    if (groupYRef.current) {
      const isSpinning = isRotatingRef ? isRotatingRef.current : false;
      const targetY = isHovered && !isSpinning ? 0.45 : 0;
      if (Math.abs(groupYRef.current.position.y - targetY) > 0.001) {
        groupYRef.current.position.y = THREE.MathUtils.damp(
          groupYRef.current.position.y,
          targetY,
          8,
          delta
        );
      } else {
        groupYRef.current.position.y = targetY;
      }
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = "pointer";
    if (onHoverPlane) {
      onHoverPlane(plane);
    }
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = "grab";
  };

  return (
    <group rotation={[0, rotationY, 0]}>
      {/* Animated Y-elevation container */}
      <group ref={groupYRef} position={[0, 0, 0]}>
        <group position={[radius, 0, 0]}>
          <primitive ref={meshRef} object={mesh} />

          {/* Double-sided hit mesh covering the plane for instantaneous hover detection */}
          <mesh
            position={[width / 2, 0, 0.01]}
            onPointerOver={handlePointerOver}
            onPointerEnter={handlePointerOver}
            onPointerOut={handlePointerOut}
            onPointerLeave={handlePointerOut}
          >
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial
              transparent
              opacity={0}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {showSkeleton && <primitive object={skeletonHelper} />}
        </group>
      </group>
    </group>
  );
};

interface SkinnedPlaneProps {
  showSkeleton?: boolean;
  radius?: number;
  selectedId?: number | string;
  scrollProgress?: number;
  scrollProgressRef?: React.MutableRefObject<number>;
  planes?: PlaneItem[];
  onSelectPlane?: (plane: PlaneItem) => void;
}

export default function SkinnedPlane({
  showSkeleton = false,
  radius = RADIUS,
  scrollProgress = 0,
  scrollProgressRef,
  planes = [],
  onSelectPlane,
}: SkinnedPlaneProps) {
  // Dynamically derive geometry count directly from the API planes array
  const activePlanes = planes || [];
  const total = activePlanes.length;
  const groupRef = useRef<THREE.Group>(null!);

  const isDragging = useRef(false);
  const prevPointerX = useRef(0);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const prevRotation = useRef(0);
  const bendState = useRef(0);
  const isRotatingRef = useRef(false);

  // Intro entrance animation state (starts below screen with initial spin & scale)
  const introY = useRef(-5.2);
  const introRotation = useRef(-Math.PI * 8.4);
  const introScale = useRef(0);

  // Scroll rotation damped state (full 360 degree revolution = 2 * PI)
  const scrollRotDamped = useRef(0);
  const lastActiveIndex = useRef(-1);

  // Pointer drag listeners for manual exploration
  useEffect(() => {
    let startX = 0;

    const handlePointerDown = (e: PointerEvent) => {
      // Only drag if left click
      if (e.button !== 0) return;
      isDragging.current = true;
      startX = e.clientX;
      prevPointerX.current = e.clientX;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - prevPointerX.current;
      prevPointerX.current = e.clientX;
      if (Math.abs(e.clientX - startX) > 4) {
        document.body.style.cursor = "grabbing";
      }
      targetRotation.current += deltaX * 0.01;
    };

    const handlePointerUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "grab";
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    document.body.style.cursor = "grab";

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      document.body.style.cursor = "default";
    };
  }, []);

  const { size } = useThree();
  const isMobile = size.width < 640;
  const isTablet = size.width >= 640 && size.width < 1024;
  // Adaptive scaling so carousel fits comfortably on mobile screens without covering top/bottom text
  const responsiveScale = isMobile
    ? Math.min(Math.max(size.width / 700, 0.46), 0.58)
    : isTablet
    ? 0.78
    : 1.0;
  const responsiveYShift = isMobile ? -0.22 : 0;

  // Frame loop: smooth intro rise, scroll-driven 360 degree rotation, drag damping, and bone flexing physics
  useFrame((_, delta) => {
    // 0. Smoothly damp intro entrance values up to resting pose (y=0, rot=0, scale=1.0)
    introY.current = THREE.MathUtils.damp(introY.current, 0, 3.2, delta);
    introRotation.current = THREE.MathUtils.damp(introRotation.current, 0, 2.6, delta);
    introScale.current = THREE.MathUtils.damp(introScale.current, 1.0, 3.5, delta);

    // 1. Scroll-driven 360-degree rotation (progress 0..1 maps to 0..2*PI)
    const currentProgress = scrollProgressRef ? scrollProgressRef.current : scrollProgress;
    const targetScrollRot = -currentProgress * Math.PI * 2;
    scrollRotDamped.current = THREE.MathUtils.damp(
      scrollRotDamped.current,
      targetScrollRot,
      6,
      delta
    );

    // 2. Smoothly damp user drag rotation towards target
    currentRotation.current = THREE.MathUtils.damp(
      currentRotation.current,
      targetRotation.current,
      6,
      delta
    );

    const totalRotation = scrollRotDamped.current + currentRotation.current + introRotation.current;

    if (groupRef.current) {
      groupRef.current.position.y = introY.current + responsiveYShift;
      groupRef.current.rotation.y = totalRotation;
      groupRef.current.scale.setScalar(introScale.current * responsiveScale);
    }

    // 3. Auto-update active plane preview based on carousel rotation angle
    if (total > 0) {
      const normalizedAngle = ((-totalRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const activeIdx = Math.round((normalizedAngle / (Math.PI * 2)) * total) % total;
      if (activeIdx !== lastActiveIndex.current && activePlanes[activeIdx]) {
        lastActiveIndex.current = activeIdx;
        if (onSelectPlane && !isDragging.current) {
          onSelectPlane(activePlanes[activeIdx]);
        }
      }
    }

    // 4. Calculate rotational velocity (speed & direction of drag + scroll + intro spin)
    const rotVelocity = (totalRotation - prevRotation.current) / Math.max(delta, 0.001);
    prevRotation.current = totalRotation;

    // Detect active rotation motion (drops elevated plane down when spinning or during intro)
    const isActivelySpinning = Math.abs(rotVelocity) > 0.35 || Math.abs(introY.current) > 0.15;
    isRotatingRef.current = isActivelySpinning;

    // 5. Compute target bone curvature from velocity (lagging inertia during spin & rise)
    const maxBendPerBone = 0.065;
    const targetBend = THREE.MathUtils.clamp(-rotVelocity * 0.009, -maxBendPerBone, maxBendPerBone);

    // 6. Smoothly damp bone bend; springs back to 0 (flat rest pose) when motion settles
    bendState.current = THREE.MathUtils.damp(bendState.current, targetBend, 7, delta);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {activePlanes.map((plane, index) => {
        // Distribute all planes equally around 360 degrees (2 * PI) based on dynamic total
        const rotationY = (index / total) * Math.PI * 2;

        return (
          <SingleSkinnedPlane
            key={plane.id || index}
            plane={plane}
            textureUrl={plane.textureUrl}
            color={plane.color}
            rotationY={rotationY}
            radius={radius}
            showSkeleton={showSkeleton}
            bendState={bendState}
            isRotatingRef={isRotatingRef}
            onHoverPlane={onSelectPlane}
          />
        );
      })}
    </group>
  );
}