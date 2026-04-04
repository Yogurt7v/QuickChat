import { useEffect, useRef } from 'react';
import type { DependencyList } from 'react';
import { TIMEOUT } from '../constants';

export function useScrollToBottom(dependencies: DependencyList) {
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, TIMEOUT + 100);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return lastMessageRef;
}
