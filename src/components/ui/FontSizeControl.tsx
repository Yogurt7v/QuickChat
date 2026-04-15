import type { FC } from 'react';
import { useFontSize } from '../../hooks/useFontSize';
import type { FontSize } from '../../store/fontSizeStore';
import styles from './FontSizeControl.module.css';

const FONT_SIZES: { size: FontSize; fontSize: string }[] = [
  { size: 1, fontSize: '12px' },
  { size: 2, fontSize: '14px' },
  { size: 3, fontSize: '16px' },
  { size: 4, fontSize: '18px' },
  { size: 5, fontSize: '22px' },
];

const FontSizeControl: FC = () => {
  const { fontSize, setFontSize } = useFontSize();

  const handleClick = (e: React.MouseEvent, size: FontSize) => {
    e.stopPropagation();
    setFontSize(size);
  };

  return (
    <div className={styles.buttons}>
      {FONT_SIZES.map(({ size, fontSize: fs }) => (
        <button
          key={size}
          type="button"
          className={`${styles.button} ${fontSize === size ? styles.active : ''}`}
          style={{ fontSize: fs }}
          onClick={e => handleClick(e, size)}
          aria-label={`Размер шрифта ${size}`}
        >
          А
        </button>
      ))}
    </div>
  );
};

export default FontSizeControl;
