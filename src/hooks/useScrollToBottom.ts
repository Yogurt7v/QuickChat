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
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    hasCalledCallbackRef.current = false;
  }, dependencies);

  // Intersection Observer for detecting when last message is visible
  useEffect(() => {
    const lastMessage = lastMessageRef.current;
    const container = containerRef.current;
    if (!lastMessage || !container) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        
        if (entry && entry.isIntersecting && !hasCalledCallbackRef.current) {
          hasCalledCallbackRef.current = true;
          onReachBottom?.();
        }
      },
      {
        threshold: 0.5,
        root: container,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencies, onReachBottom]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
  }, [onManualScroll]);

  return { lastMessageRef, containerRef, handleScroll };
}
