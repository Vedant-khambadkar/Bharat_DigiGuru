import React from 'react';
import desktopVignette from '../../assets/Monochrome Vignette White Space.png';
import mobileVignette from '../../assets/Minimalist Black and White Vignette  mobile.png';

interface VignetteOverlayProps {
  isMobile?: boolean;
}

export const VignetteOverlay: React.FC<VignetteOverlayProps> = ({ isMobile }) => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 select-none overflow-hidden"
    >
      <img
        src={isMobile ? mobileVignette : desktopVignette}
        alt=""
        className="w-full h-full object-fill pointer-events-none select-none mix-blend-multiply transition-opacity duration-500"
      />
    </div>
  );
};

export default VignetteOverlay;
