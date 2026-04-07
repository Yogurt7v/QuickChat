import arrowUp from '../../assets/arrow-up.svg';
import { useIsSafariPWA } from '../../hooks/useIsSafari';

interface ScrollToTopButtonProps {
  className: string;
}

export function ScrollToTopButton({ className }: ScrollToTopButtonProps) {
  const isSafari = useIsSafariPWA();

  if (!isSafari) return null;

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={className}
      onClick={handleScrollToTop}
      aria-label="Прокрутить вверх"
    >
      <img src={arrowUp} alt="Вверх" />
    </button>
  );
}
