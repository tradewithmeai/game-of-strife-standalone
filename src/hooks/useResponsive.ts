import { useState, useEffect } from 'react';
import { isMobile, isTablet, isTouchDevice, getDeviceType, getOptimalTouchSize, getOptimalSpacing } from '@/utils/deviceDetection';

export const useResponsive = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isTouchDevice: false,
    deviceType: 'desktop' as 'mobile' | 'tablet' | 'desktop',
    touchSize: 36,
    spacing: 8
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo({
        isMobile: isMobile(),
        isTablet: isTablet(),
        isTouchDevice: isTouchDevice(),
        deviceType: getDeviceType(),
        touchSize: getOptimalTouchSize(),
        spacing: getOptimalSpacing()
      });
    };

    // Initial detection
    updateDeviceInfo();

    // Update on resize (for responsive testing)
    const handleResize = () => {
      updateDeviceInfo();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive classes for common use cases
  const getButtonClasses = (baseClasses: string = '') => {
    const { isMobile, touchSize } = deviceInfo;
    const sizeClasses = isMobile 
      ? 'px-6 py-4 text-sm min-h-[48px]' // Large touch targets
      : 'px-4 py-2 text-xs min-h-[36px]'; // Normal desktop size
    
    return `${baseClasses} ${sizeClasses}`;
  };

  const getSpacingClasses = () => {
    const { isMobile } = deviceInfo;
    return isMobile ? 'space-y-4' : 'space-y-2';
  };

  const getContainerClasses = () => {
    const { isMobile } = deviceInfo;
    return isMobile ? 'p-6' : 'p-4';
  };

  const getTextClasses = () => {
    const { isMobile } = deviceInfo;
    return isMobile ? 'text-sm' : 'text-xs';
  };

  return {
    ...deviceInfo,
    getButtonClasses,
    getSpacingClasses,
    getContainerClasses,
    getTextClasses
  };
};