import { useState } from 'react';
import type { User } from '../types';

export function useProfileState(currentUser: User | null) {
  const [name, setName] = useState(currentUser?.displayName || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentUser?.photoURL || null
  );
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setName(currentUser?.displayName || '');
    setSelectedFile(null);
    setPreviewUrl(currentUser?.photoURL || null);
    setIsLoading(false);
  };

  return {
    name,
    setName,
    selectedFile,
    setSelectedFile,
    previewUrl,
    setPreviewUrl,
    isLoading,
    setIsLoading,
    resetState,
  };
}
