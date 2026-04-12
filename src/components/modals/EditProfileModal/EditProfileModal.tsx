import styles from './EditProfileModal.module.css';
import type { EditProfileModalProps } from '../../../types';
import { useProfileState } from '../../../hooks/useProfileState';
import { useFileHandling } from '../../../hooks/useFileHandling';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';
import { useProfileSave } from '../../../hooks/useProfileSave';
import ModalOverlay from '../common/ModalOverlay';
import ModalHeader from '../common/ModalHeader';
import AvatarUploader from '../../profile/AvatarUploader';
import ProfileForm from '../../profile/ProfileForm';
import ModalButtons from '../common/ModalButtons';

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
}: EditProfileModalProps) {
  const {
    name,
    setName,
    selectedFile,
    setSelectedFile,
    previewUrl,
    setPreviewUrl,
    isLoading,
    setIsLoading,
  } = useProfileState(currentUser);

  const { handleFileSelect, handleClear } = useFileHandling({
    setSelectedFile,
    setPreviewUrl,
    currentUser,
  });

  useKeyboardShortcuts(onClose);

  const { handleSaveData } = useProfileSave({
    name,
    selectedFile,
    currentUser,
    isLoading,
    setIsLoading,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <ModalOverlay onClose={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.container}>
          <ModalHeader
            onClose={onClose}
            disabled={isLoading}
          />
          <AvatarUploader
            previewUrl={previewUrl}
            name={name}
            isLoading={isLoading}
            onClear={handleClear}
          />
          <ProfileForm
            name={name}
            setName={setName}
            onFileSelect={handleFileSelect}
            isLoading={isLoading}
            isOpen={isOpen}
          />
          <ModalButtons
            onSave={handleSaveData}
            onCancel={onClose}
            isLoading={isLoading}
            canSave={!!name.trim()}
          />
        </div>
      </div>
    </ModalOverlay>
  );
}
