import { useState, useEffect } from 'react';

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const width = window.innerWidth;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Комбинированная проверка: User Agent + Viewport + Touch
      const isMobileDevice =
        /android|iphone|ipod|blackberry|windows phone|mobile/i.test(
          userAgent
        ) ||
        (hasTouch && width < 768);

      setIsMobile(isMobileDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  return isMobile;
};
