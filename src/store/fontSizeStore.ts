import { create } from 'zustand';

export type FontSize = 1 | 2 | 3 | 4 | 5;

interface FontSizeState {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const getInitialFontSize = (): FontSize => {
  const stored = localStorage.getItem('fontSize');
  if (stored && ['1', '2', '3', '4', '5'].includes(stored)) {
    return parseInt(stored) as FontSize;
  }
  return 2;
};

export const useFontSizeStore = create<FontSizeState>(set => ({
  fontSize: getInitialFontSize(),
  setFontSize: fontSize => {
    localStorage.setItem('fontSize', fontSize.toString());
    document.documentElement.setAttribute('data-font-size', fontSize.toString());
    set({ fontSize });
  },
}));
