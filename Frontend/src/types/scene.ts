export type SceneState = 'overview' | 'focusing' | 'focused' | 'returning';

export interface PersonConfig {
  id: string;
  position: [number, number, number];
  rotationY?: number;
  rotationX?: number;
  rotationZ?: number;
  scale: number;
  phaseOffset: number;
  idleSpeed: number;
  isFounder?: boolean;
}
