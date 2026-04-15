import { useEffect } from 'react';
import { useFontSizeStore } from '../store/fontSizeStore';

export function useFontSize() {
  const { fontSize, setFontSize } = useFontSizeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize.toString());
  }, [fontSize]);

  return { fontSize, setFontSize };
}
