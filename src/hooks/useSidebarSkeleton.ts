import { useEffect, useState } from 'react';

export function useSidebarSkeleton(count: number, speed: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % count);
    }, speed); // скорость переключения

    return () => clearInterval(interval);
  }, [count, speed]);

  return index;
}
