import styles from '../../../styles/EditProfileModal.module.css';

type ModalOverlayProps = {
  children: React.ReactNode;
  onClose: () => void;
};

export default function ModalOverlay({ children, onClose }: ModalOverlayProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      {children}
    </div>
  );
}
