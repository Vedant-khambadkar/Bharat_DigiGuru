import type { PersonConfig } from '../../types/scene';


export const DESKTOP_PEOPLE: PersonConfig[] = [
  // 1. Far Left Mid
  { id: 'p_far_left', position: [-4.4, 0, 0.4], rotationY: 37.1, rotationX: 0, rotationZ: 0, scale: 0.98, phaseOffset: 0.2, idleSpeed: 0.8 },

  // 2. Mid Left Row 1
  { id: 'p_mid_left_1', position: [-3.1, 0, 1.3], rotationY: -1.12, rotationX: 0, rotationZ: 0, scale: 0.96, phaseOffset: 1.1, idleSpeed: 0.85 },

  // 3. Left Back (Behind p2)
  { id: 'p_left_back', position: [-5.6, 0, -1.0], rotationY: 3.18, rotationX: 0, rotationZ: 0, scale: 1.0, phaseOffset: 2.3, idleSpeed: 0.82 },

  // 4. Mid Left Row 2
  { id: 'p_mid_left_2', position: [-2.0, 0, 0.0], rotationY: -0.15, rotationX: 0, rotationZ: 0, scale: 0.96, phaseOffset: 3.5, idleSpeed: 0.88 },

  // 5. Center-Front Left
  { id: 'p_center_f_left', position: [-3.3, 0, -3.7], rotationY: 1.05, rotationX: 0, rotationZ: 0, scale: 0.99, phaseOffset: 4.2, idleSpeed: 0.9 },

  // 6. Mid Center (Behind p5)
  { id: 'p_center_mid', position: [-0.4, 0, -0.4], rotationY: -0.08, rotationX: 0, rotationZ: 0, scale: 0.98, phaseOffset: 0.7, idleSpeed: 0.86 },

  // 7. Highest Center Apex (Back center leader)
  { id: 'p_apex', position: [-1.0, 0, -5.2], rotationY: 0.0, rotationX: 0, rotationZ: 0, scale: 1.02, phaseOffset: 1.8, idleSpeed: 0.83 },



  // 8. Right of Apex
  { id: 'p_apex_right', position: [0.7, 0, -1.6], rotationY: 0.18, rotationX: 0, rotationZ: 0, scale: 0.97, phaseOffset: 2.9, idleSpeed: 0.87 },

  // 9. Back Right Row
  { id: 'p_back_right', position: [3.4, 0, -1.5], rotationY: -0.2, rotationX: 0, rotationZ: 0, scale: 0.99, phaseOffset: 3.8, idleSpeed: 0.91 },

  // 10. Center-Front Right
  { id: 'p_center_f_right', position: [0.8, 0, 3.6], rotationY: -4.22, rotationX: 0, rotationZ: 0, scale: 0.98, phaseOffset: 4.6, idleSpeed: 0.84 },

  // 11. Downstage Front-Right
  { id: 'p_downstage_r', position: [4.3, 0, 1.1], rotationY: -37, rotationX: 0, rotationZ: 0, scale: 1.0, phaseOffset: 0.5, idleSpeed: 0.89 },

  // 12. Mid Right (Behind p11)
  { id: 'p_mid_right', position: [1.9, 0, 0.2], rotationY: -1.12, rotationX: 0, rotationZ: 0, scale: 0.96, phaseOffset: 1.6, idleSpeed: 0.85 },

  // 13. Far Right Back
  { id: 'p_far_r_back', position: [2.5, 0, -5.2], rotationY: 25, rotationX: 0, rotationZ: 0, scale: 1.0, phaseOffset: 2.7, idleSpeed: 0.9 },

  // 14. Far Right Front
  { id: 'p_far_r_front', position: [2.8, 0, 4.7], rotationY: -0.05, rotationX: 0, rotationZ: 0, scale: 0.97, phaseOffset: 3.6, idleSpeed: 0.86 },

  // 15. Far Right Isolated Person
  { id: 'p_far_r_isolated', position: [6.0, 0, -0.9], rotationY: 18, rotationX: 0, rotationZ: 0, scale: 1.01, phaseOffset: 4.4, idleSpeed: 0.88 },
];

// Isolated Founder: standing downstage in foreground facing the scene with briefcase
export const DESKTOP_FOUNDER: PersonConfig = {
  id: 'founder',
  position: [-1.6, 0, 3.9],
  rotationY: 2.3,
  rotationX: 0.0,
  rotationZ: 0.0,
  scale: 0.9,
  phaseOffset: 0.0,
  idleSpeed: 0.85,
  isFounder: true,
};

// Mobile portrait setup: Calibrated for vertical phone screens (no edge clipping, clean wedge depth)
export const MOBILE_PEOPLE: PersonConfig[] = [
  // 1. Apex Leader in the back center (with glowing beacon)
  { id: 'mp_apex', position: [0.0, 0, -10.8], rotationY: 0.0, scale: 0.92, phaseOffset: 0.1, idleSpeed: 0.85 },

  // 2. Deep Back Left
  { id: 'mp_deep_l', position: [-0.85, 0, -13.8], rotationY: -0.28, scale: 0.9, phaseOffset: 1.2, idleSpeed: 0.88 },

  // 3. Deep Back Right
  { id: 'mp_deep_r', position: [2.85, 0, -3.8], rotationY: -10.28, scale: 0.9, phaseOffset: 2.3, idleSpeed: 0.82 },

  // 4. Mid Left Row
  { id: 'mp_mid_l1', position: [-3.15, 0, -12.4], rotationY: 5.42, scale: 0.88, phaseOffset: 3.1, idleSpeed: 0.89 },

  // 5. Mid Inner Left
  { id: 'mp_mid_l2', position: [1.5, 0, -2.9], rotationY: 78.14, scale: 0.88, phaseOffset: 0.7, idleSpeed: 0.86 },

  // 6. Mid Inner Right
  { id: 'mp_mid_r1', position: [1, 0, -7.0], rotationY: -0.16, scale: 0.88, phaseOffset: 4.1, idleSpeed: 0.91 },

  // 7. Mid Right Row
  { id: 'mp_mid_r2', position: [-2.15, 0, -2.3], rotationY: -50.42, scale: 0.88, phaseOffset: 1.8, idleSpeed: 0.84 },

  // 8. Forward Flank Left
  { id: 'mp_front_l', position: [-0.95, 0, -2.6], rotationY: 15.55, scale: 0.86, phaseOffset: 2.9, idleSpeed: 0.87 },

  // 9. Forward Flank Right
  { id: 'mp_front_r', position: [3.05, 0, -14.5], rotationY: -0.55, scale: 0.86, phaseOffset: 3.8, idleSpeed: 0.9 },

  { id: 'mp_front_r', position: [5.05, 0, -14.5], rotationY: -20.55, scale: 0.86, phaseOffset: 3.8, idleSpeed: 0.9 },
];

export const MOBILE_FOUNDER: PersonConfig = {
  id: 'founder-mobile',
  position: [-0.2, 0, 1.3],
  rotationY: 0.12,
  rotationX: 0.0,
  rotationZ: 0.0,
  scale: 0.88,
  phaseOffset: 0.0,
  idleSpeed: 0.85,
  isFounder: true,
};
