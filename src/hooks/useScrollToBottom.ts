import { useEffect, useRef, useCallback } from 'react';
import type { DependencyList } from 'react';
import { TIMEOUT } from '../constants';

interface UseScrollToBottomProps {
  onReachBottom?: () => void;
  onManualScroll?: (isAtBottom: boolean) => void;
}

export function useScrollToBottom(
  dependencies: DependencyList,
  { onReachBottom, onManualScroll }: UseScrollToBottomProps = {}
) {
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasCalledCallbackRef = useRef(false);

  useEffect(() => {
    hasCalledCallbackRef.current = false;
  }, dependencies);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (lastMessageRef.current && !hasCalledCallbackRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        hasCalledCallbackRef.current = true;
        onReachBottom?.();
      }
    }, TIMEOUT + 100);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    const isAtBottom = distanceFromBottom < 100;
    onManualScroll?.(isAtBottom);

    if (isAtBottom && !hasCalledCallbackRef.current) {
      hasCalledCallbackRef.current = true;
      onReachBottom?.();
    }
  }, [onReachBottom, onManualScroll]);

  return { lastMessageRef, containerRef, handleScroll };
}