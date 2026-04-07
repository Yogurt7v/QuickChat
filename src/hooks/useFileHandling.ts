import { useRef, useEffect } from 'react';
import type { User } from '../types';
import { compressImage } from '../services/compressingImage';
import { MAX_FILE_SIZE_MB } from '../constants';

type UseFileHandlingProps = {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  setPreviewUrl: (url: string | null) => void;
  currentUser: User | null;
};

export function useFileHandling({
  selectedFile,
  setSelectedFile,
  setPreviewUrl,
  currentUser,
}: UseFileHandlingProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const compressedBlob = await compressImage(file, 600, MAX_FILE_SIZE_MB);

    const compressedFile = new File([compressedBlob], file.name, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    setSelectedFile(compressedFile);
    setPreviewUrl(URL.createObjectURL(compressedFile));
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(currentUser?.photoURL || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (selectedFile) {
        URL.revokeObjectURL(URL.createObjectURL(selectedFile));
      }
    };
  }, [selectedFile]);

  return {
    fileInputRef,
    handleFileSelect,
    handleClear,
  };
}
