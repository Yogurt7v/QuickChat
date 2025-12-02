import type { User } from '../types';
import {
  updateUserProfile,
  uploadUserAvatar,
} from '../services/firestoreService';

type UseProfileSaveProps = {
  name: string;
  selectedFile: File | null;
  currentUser: User | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onClose: () => void;
};

export function useProfileSave({
  name,
  selectedFile,
  currentUser,
  isLoading,
  setIsLoading,
  onClose,
}: UseProfileSaveProps) {
  const handleSaveData = async () => {
    if (!name.trim() || !currentUser || isLoading) return;

    setIsLoading(true);
    try {
      const updates: { displayName: string; photoURL?: string } = {
        displayName: name.trim(),
      };

      if (selectedFile) {
        const photoURL = await uploadUserAvatar(currentUser.uid, selectedFile);
        updates.photoURL = photoURL;
      }

      await updateUserProfile(currentUser.uid, updates);
      onClose();
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSaveData };
}
