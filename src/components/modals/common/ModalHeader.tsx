import styles from '../EditProfileModal/EditProfileModal.module.css';
import uiStyles from '../../ui/ui.module.css';

type ModalHeaderProps = {
  onClose: () => void;
  disabled?: boolean;
};

export default function ModalHeader({
  onClose,
  disabled,
}: ModalHeaderProps) {
  return (
    <div className={styles.exitButtonContainer}>
      <button className={uiStyles.roundButton} onClick={onClose} disabled={disabled}>
        X
      </button>
    </div>
  );
}
