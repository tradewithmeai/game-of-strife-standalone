import { useState, useEffect } from 'react';

export interface OrientationData {
  isLandscape: boolean;
  isPortrait: boolean;
  angle: number;
}

export const useOrientation = (): OrientationData => {
  const [orientation, setOrientation] = useState<OrientationData>(() => {
    const angle = window.screen?.orientation?.angle ?? 0;
    const isLandscape = Math.abs(angle) === 90;
    return {
      isLandscape,
      isPortrait: !isLandscape,
      angle
    };
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      const angle = window.screen?.orientation?.angle ?? 0;
      const isLandscape = Math.abs(angle) === 90;
      
      setOrientation({
        isLandscape,
        isPortrait: !isLandscape,
        angle
      });
    };

    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Also listen for resize events as backup
    window.addEventListener('resize', handleOrientationChange);

    // Clean up listeners
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return orientation;
};