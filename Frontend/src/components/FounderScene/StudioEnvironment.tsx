import React from 'react';

interface StudioEnvironmentProps {
  isMobile: boolean;
}

export const StudioEnvironment: React.FC<StudioEnvironmentProps> = ({ isMobile }) => {
  // Optimized light parameters for 60fps performance & crisp shadows on all devices
  const keyLightPos: [number, number, number] = isMobile ? [11, 12, 13] : [18, 13, 19];
  const shadowFrustum = isMobile ? 10 : 16;
  const mapSize = 1024;

  return (
    <>
      {/* Primary Key Directional Light */}
      <directionalLight
        position={keyLightPos}
        intensity={isMobile ? 1.4 : 1.3}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={mapSize}
        shadow-mapSize-height={mapSize}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-shadowFrustum}
        shadow-camera-right={shadowFrustum}
        shadow-camera-top={shadowFrustum}
        shadow-camera-bottom={-shadowFrustum}
        shadow-bias={-0.00008}
        shadow-normalBias={0.0004}
      />

      {/* Ambient Fill Light */}
      <ambientLight intensity={isMobile ? 0.65 : 0.75} />

      {/* Optimized Shadow-Only Receiver Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[140, 140]} />
        <shadowMaterial opacity={isMobile ? 0.58 : 0.44} color="#000000" />
      </mesh>
    </>
  );
};

export default React.memo(StudioEnvironment);
