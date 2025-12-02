import { useEffect, useRef } from 'react';
import type { DependencyList } from 'react';

export function useScrollToBottom(dependencies: DependencyList) {
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timeout);
  }, dependencies);

  return lastMessageRef;
}
