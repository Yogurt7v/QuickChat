import { useMemo } from 'react';

export function useIsSafariPWA(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;

    const navigator = window.navigator as any;
    const ua = navigator.userAgent.toLowerCase();
    const vendor = navigator.vendor.toLowerCase();

    // 1. Проверяем, запущено ли приложение как PWA (на iOS или Desktop)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      navigator.standalone === true; // Специфично для iOS Safari

    // 2. Проверка на движок Apple (WebKit)
    const isApple = vendor.includes('apple');

    // 3. Исключаем сторонние браузеры на iOS (Chrome, Firefox)
    // В режиме PWA сторонние браузеры обычно не запускаются,
    // но проверка лишней не будет.
    const isNotOthers =
      !ua.includes('crios') && !ua.includes('fxios') && !ua.includes('edgios');

    // Если это Apple + не сторонний браузер + (это либо режим PWA, либо в UA есть Safari)
    return isApple && isNotOthers && (isStandalone || ua.includes('safari'));
  }, []);
}
