import { useState, useEffect } from 'react';

export const useIsMobile = (): boolean => {
  const getIsMobile = () => {
    if (typeof window === 'undefined') return false;

    const userAgent = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return (
      /android|iphone|ipod|blackberry|windows phone|mobile/i.test(userAgent) ||
      (hasTouch && width < 768)
    );
  };

  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkDevice = () => setIsMobile(getIsMobile());

    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
};
