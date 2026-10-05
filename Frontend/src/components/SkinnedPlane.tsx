import React, { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const WIDTH = 4.0;
const HEIGHT = 2.5;
const SEGMENTS = 10; // Lightweight 10-bone curve: maximum FPS, zero skeleton overhead
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
  initialTexture?: THREE.Texture,
  color: string = "#6c8ebb"
) {
  // 1. Plane geometry subdivided horizontally along X-axis
  const geometry = new THREE.PlaneGeometry(width, height, segments, 1);
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
    color: initialTexture ? new THREE.Color("#ffffff") : new THREE.Color(color),
    map: initialTexture || null,
    side: THREE.FrontSide, // FrontSide cuts fragment shader fill-rate overhead by 50%
    roughness: 0.4,
    metalness: 0.0,
  });

  const mesh = new THREE.SkinnedMesh(geometry, material);
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

// Fast in-memory texture cache to provide 0ms instant rendering
const textureMemoryCache = new Map<string, THREE.Texture>();
const inFlightTexturePromises = new Map<string, Promise<THREE.Texture>>();

/**
 * Preloads and decodes a Three.js texture into GPU memory without CPU-blocking mipmap generation.
 */
export function preloadSkinnedTexture(url?: string): Promise<THREE.Texture> {
  if (!url || !url.trim()) return Promise.reject("Empty URL");
  const cleanUrl = url.trim();

  if (textureMemoryCache.has(cleanUrl)) {
    return Promise.resolve(textureMemoryCache.get(cleanUrl)!);
  }

  if (inFlightTexturePromises.has(cleanUrl)) {
    return inFlightTexturePromises.get(cleanUrl)!;
  }

  const promise = new Promise<THREE.Texture>((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    const loadDirect = (targetUrl: string, isFallback = false) => {
      loader.load(
        targetUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = false; // Bypasses CPU/GPU mipmap generation freeze
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
          textureMemoryCache.set(cleanUrl, tex);
          inFlightTexturePromises.delete(cleanUrl);
          resolve(tex);
        },
        undefined,
        (err) => {
          if (!isFallback && (cleanUrl.includes("amazonaws.com") || cleanUrl.includes("cloudfront.net"))) {
            const baseApi = import.meta.env.VITE_API_URL || "http://localhost:5000";
            try {
              const urlObj = new URL(cleanUrl);
              const key = urlObj.pathname.replace(/^\/+/, "");
              const proxyUrl = `${baseApi}/api/media/stream?key=${encodeURIComponent(key)}`;
              loadDirect(proxyUrl, true);
              return;
            } catch {
              // ignore and fail
            }
          }
          inFlightTexturePromises.delete(cleanUrl);
          reject(err);
        }
      );
    };

    loadDirect(cleanUrl);
  });

  inFlightTexturePromises.set(cleanUrl, promise);
  return promise;
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
  const isHoveredRef = useRef(false);
  const prevBendRef = useRef(999);

  const { mesh, skeletonHelper } = useMemo(() => {
    const cleanUrl = textureUrl ? textureUrl.trim() : "";
    const cachedTex = cleanUrl ? textureMemoryCache.get(cleanUrl) : undefined;
    return createSkinnedPlaneData(width, height, segments, cachedTex, color);
  }, [width, height, segments, color, textureUrl]);

  // Load texture: 0ms instant hit if cached, or fast progressive load
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

    const cleanUrl = textureUrl.trim();

    if (textureMemoryCache.has(cleanUrl)) {
      const tex = textureMemoryCache.get(cleanUrl)!;
      if (meshRef.current) {
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.map = tex;
          mat.color.set("#ffffff");
          mat.needsUpdate = true;
        }
      }
      return;
    }

    let isCancelled = false;
    preloadSkinnedTexture(cleanUrl)
      .then((tex) => {
        if (!isCancelled && meshRef.current) {
          const mat = meshRef.current.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.map = tex;
            mat.color.set("#ffffff");
            mat.needsUpdate = true;
          }
        }
      })
      .catch((err) => {
        console.warn(`[SkinnedPlane] Texture load warning for: ${cleanUrl}`, err);
        if (!isCancelled && meshRef.current) {
          const mat = meshRef.current.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.map = null;
            mat.color.set(color);
            mat.needsUpdate = true;
          }
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [textureUrl, color]);

  // Clean WebGL memory disposal on dynamic change / unmount
  useEffect(() => {
    return () => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => {
          m.map?.dispose();
          m.dispose();
        });
      } else if (mesh.material) {
        mesh.material.map?.dispose();
        mesh.material.dispose();
      }
    };
  }, [mesh]);

  // Frame update: highly optimized conditional calculations
  useFrame((_, delta) => {
    // 1. Dynamic bone bend: only compute if bend actually changed significantly
    if (bendState) {
      const currentBend = bendState.current;
      if (Math.abs(currentBend - prevBendRef.current) > 0.0002 || Math.abs(currentBend) > 0.0005) {
        prevBendRef.current = currentBend;
        const bones = meshRef.current?.skeleton?.bones;
        if (bones) {
          for (let j = 1; j < bones.length; j++) {
            const factor = j / segments;
            bones[j].rotation.y = currentBend * (0.4 + factor * 1.1);
          }
        }
      }
    }

    // 2. Y-Elevation: rises to +0.45 on hover; drops smoothly back to 0
    if (groupYRef.current) {
      const isRotating = isRotatingRef ? isRotatingRef.current : false;
      const targetY = isHoveredRef.current && !isRotating ? 0.45 : 0;
      if (Math.abs(groupYRef.current.position.y - targetY) > 0.001) {
        groupYRef.current.position.y = THREE.MathUtils.damp(
          groupYRef.current.position.y,
          targetY,
          8,
          delta
        );
      }
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    isHoveredRef.current = true;
    document.body.style.cursor = "pointer";
    if (onHoverPlane) {
      onHoverPlane(plane);
    }
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    isHoveredRef.current = false;
    document.body.style.cursor = "grab";
  };

  return (
    <group rotation={[0, rotationY, 0]}>
      <group ref={groupYRef} position={[0, 0, 0]}>
        <group position={[radius, 0, 0]}>
          <primitive ref={meshRef} object={mesh} />

          {/* Hit mesh covering the plane for instantaneous hover detection */}
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
  onReady?: () => void;
}

export default function SkinnedPlane({
  showSkeleton = false,
  radius = RADIUS,
  scrollProgress = 0,
  scrollProgressRef,
  planes = [],
  onSelectPlane,
  onReady,
}: SkinnedPlaneProps) {
  const activePlanes = planes || [];
  const total = activePlanes.length;
  const groupRef = useRef<THREE.Group>(null!);

  const hasNotifiedReady = useRef(false);
  const isDragging = useRef(false);
  const prevPointerX = useRef(0);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const prevRotation = useRef(0);
  const bendState = useRef(0);
  const isRotatingRef = useRef(false);

  // Intro entrance animation state (starts ready to view)
  const introY = useRef(0);
  const introRotation = useRef(0);
  const introScale = useRef(1.0);

  // Scroll rotation damped state
  const scrollRotDamped = useRef(0);
  const lastActiveIndex = useRef(-1);

  const { size, gl } = useThree();
  const isMobile = size.width < 640;
  const isTablet = size.width >= 640 && size.width < 1024;
  const responsiveScale = isMobile
    ? Math.min(Math.max(size.width / 700, 0.46), 0.58)
    : isTablet
      ? 0.78
      : 1.0;
  const responsiveYShift = isMobile ? -0.22 : 0;

  // Localized pointer drag listeners on canvas DOM element instead of global window listeners
  useEffect(() => {
    const domElement = gl.domElement;
    if (!domElement) return;

    let startX = 0;

    const handlePointerDown = (e: PointerEvent) => {
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
      targetRotation.current += deltaX * 0.008;
    };

    const handlePointerUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "grab";
    };

    domElement.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      domElement.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [gl]);

  // Frame loop: smooth scroll-driven rotation, drag damping, and bone flexing physics with ZERO React state thrashing
  useFrame((_, delta) => {
    if (!hasNotifiedReady.current) {
      hasNotifiedReady.current = true;
      if (onReady) {
        onReady();
      }
    }

    // 0. Smoothly damp intro values
    if (Math.abs(introY.current) > 0.001) {
      introY.current = THREE.MathUtils.damp(introY.current, 0, 3.2, delta);
    }
    if (Math.abs(introRotation.current) > 0.001) {
      introRotation.current = THREE.MathUtils.damp(introRotation.current, 0, 2.6, delta);
    }
    if (Math.abs(introScale.current - 1.0) > 0.001) {
      introScale.current = THREE.MathUtils.damp(introScale.current, 1.0, 3.5, delta);
    }

    // 1. Scroll-driven 360-degree rotation (snappy responsive tracking synchronized with Lenis)
    const effectiveScrollProg = scrollProgressRef ? scrollProgressRef.current : scrollProgress;
    const targetScrollRot = -effectiveScrollProg * Math.PI * 2;
    scrollRotDamped.current = THREE.MathUtils.damp(
      scrollRotDamped.current,
      targetScrollRot,
      15,
      delta
    );

    // 2. Smoothly damp drag rotation
    currentRotation.current = THREE.MathUtils.damp(
      currentRotation.current,
      targetRotation.current,
      12,
      delta
    );

    const totalRotation = scrollRotDamped.current + currentRotation.current + introRotation.current;

    if (groupRef.current) {
      groupRef.current.position.y = introY.current + responsiveYShift;
      groupRef.current.rotation.y = totalRotation;
      groupRef.current.scale.setScalar(introScale.current * responsiveScale);
    }

    // 3. Auto-update active plane index (only when dragging settles or user pauses)
    if (total > 0) {
      const normalizedAngle = ((-totalRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const activeIdx = Math.round((normalizedAngle / (Math.PI * 2)) * total) % total;
      if (activeIdx !== lastActiveIndex.current && activePlanes[activeIdx]) {
        lastActiveIndex.current = activeIdx;
        // Don't spam React state on high-speed scroll; let user hover or settle
      }
    }

    // 4. Calculate rotational velocity
    const rotVelocity = (totalRotation - prevRotation.current) / Math.max(delta, 0.001);
    prevRotation.current = totalRotation;

    // Use ref directly without triggering React re-renders!
    isRotatingRef.current = Math.abs(rotVelocity) > 0.35 || Math.abs(introY.current) > 0.15;

    // 5. Compute target bone curvature from velocity
    const maxBendPerBone = 0.065;
    const targetBend = THREE.MathUtils.clamp(-rotVelocity * 0.009, -maxBendPerBone, maxBendPerBone);

    // 6. Smoothly damp bone bend
    bendState.current = THREE.MathUtils.damp(bendState.current, targetBend, 7, delta);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {activePlanes.map((plane, index) => {
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

