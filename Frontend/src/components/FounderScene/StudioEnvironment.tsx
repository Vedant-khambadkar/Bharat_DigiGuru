import React from 'react';

interface StudioEnvironmentProps {
  isMobile: boolean;
}

export const StudioEnvironment: React.FC<StudioEnvironmentProps> = ({ isMobile }) => {
  // Optimized light parameters for 60fps performance & crisp shadows
  const keyLightPos: [number, number, number] = isMobile ? [14, 11, 15] : [18, 13, 19];
  const shadowFrustum = isMobile ? 12 : 16;
  const mapSize = isMobile ? 512 : 1024;

  return (
    <>
      {/* Primary Key Directional Light */}
      <directionalLight
        position={keyLightPos}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={mapSize}
        shadow-mapSize-height={mapSize}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-camera-left={-shadowFrustum}
        shadow-camera-right={shadowFrustum}
        shadow-camera-top={shadowFrustum}
        shadow-camera-bottom={-shadowFrustum}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />

      {/* Ambient Fill Light */}
      <ambientLight intensity={0.8} />

      {/* Optimized Shadow-Only Receiver Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[140, 140]} />
        <shadowMaterial opacity={0.36} color="#000000" />
      </mesh>
    </>
  );
};

export default React.memo(StudioEnvironment);
