// Device detection utilities

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check user agent
  const userAgent = window.navigator.userAgent;
  const mobileKeywords = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // Check touch capability
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check screen size (mobile typically < 768px width)
  const isSmallScreen = window.innerWidth < 768;
  
  return mobileKeywords.test(userAgent) || (hasTouchScreen && isSmallScreen);
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  const tabletKeywords = /iPad|Android.*(?!Mobile)/i;
  
  // Large touch screen (between mobile and desktop)
  const isLargeTouch = 'ontouchstart' in window && 
    window.innerWidth >= 768 && 
    window.innerWidth <= 1024;
  
  return tabletKeywords.test(userAgent) || isLargeTouch;
};

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
};

export const getOptimalTouchSize = (): number => {
  // Apple/Google recommend 44px minimum for touch targets
  const device = getDeviceType();
  
  switch (device) {
    case 'mobile':
      return 48; // Larger for mobile
    case 'tablet':
      return 44; // Standard size
    default:
      return 36; // Smaller for desktop with mouse
  }
};

export const getOptimalSpacing = (): number => {
  const device = getDeviceType();
  
  switch (device) {
    case 'mobile':
      return 16; // More spacing on mobile
    case 'tablet':
      return 12;
    default:
      return 8;
  }
};