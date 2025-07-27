import { useState, useEffect } from 'react';

export interface OrientationData {
  isLandscape: boolean;
  isPortrait: boolean;
  angle: number;
}

export const useOrientation = (): OrientationData => {
  const [orientation, setOrientation] = useState<OrientationData>(() => {
    // Safe fallback approach using window dimensions
    if (typeof window === 'undefined') {
      return { isLandscape: false, isPortrait: true, angle: 0 };
    }
    
    const isLandscape = window.innerWidth > window.innerHeight;
    return {
      isLandscape,
      isPortrait: !isLandscape,
      angle: isLandscape ? 90 : 0
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientationChange = () => {
      // Use window dimensions as primary method (more reliable)
      const isLandscape = window.innerWidth > window.innerHeight;
      
      setOrientation({
        isLandscape,
        isPortrait: !isLandscape,
        angle: isLandscape ? 90 : 0
      });
    };

    // Use resize event (more universally supported)
    window.addEventListener('resize', handleOrientationChange);
    
    // Try orientation change event if available
    if ('onorientationchange' in window) {
      window.addEventListener('orientationchange', handleOrientationChange);
    }

    // Clean up listeners
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      if ('onorientationchange' in window) {
        window.removeEventListener('orientationchange', handleOrientationChange);
      }
    };
  }, []);

  return orientation;
};