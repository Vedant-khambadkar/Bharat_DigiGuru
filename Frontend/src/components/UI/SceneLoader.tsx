import React from 'react';
import { useProgress } from '@react-three/drei';

export const SceneLoader: React.FC = () => {
  const { active, progress } = useProgress();

  if (!active || progress >= 100) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-sm select-none transition-opacity duration-500">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
        <span className="font-mono text-xs tracking-[0.25em] text-neutral-800 uppercase">
          Loading 3D Scene {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

export default SceneLoader;
