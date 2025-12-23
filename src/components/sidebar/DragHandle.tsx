import { useRef } from 'react';
import styles from '../../styles/DragHandle.module.css';

type DragHandleProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listeners: any;
  isMobile?: boolean;
  onLongPress?: (position: { x: number; y: number }) => void;
};

export default function DragHandle({
  attributes,
  listeners,
  isMobile,
  onLongPress,
}: DragHandleProps) {
  const longPressTimerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = e => {
    e.stopPropagation();
    if (!isMobile || !onLongPress) return;

    clearTimer();
    const touch = e.touches[0];
    longPressTimerRef.current = window.setTimeout(() => {
      onLongPress({ x: touch.clientX, y: touch.clientY });
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 700);
  };

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = e => {
    e.stopPropagation();
    clearTimer();
  };

  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = e => {
    e.stopPropagation();
    clearTimer();
  };

  const dndProps = !isMobile ? { ...attributes, ...listeners } : {};

  return (
    <div
      className={styles.dragHandle}
      {...dndProps}
      onClick={e => e.stopPropagation()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      ⠿
    </div>
  );
}
