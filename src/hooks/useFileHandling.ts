import { useRef, useEffect } from 'react';
import type { User } from '../types';
import { compressImage } from '../services/compressingImage';
import { MAX_FILE_SIZE_MB } from '../constants';

type UseFileHandlingProps = {
  setSelectedFile: (file: File | null) => void;
  setPreviewUrl: (url: string | null) => void;
  currentUser: User | null;
};

export function useFileHandling({
  setSelectedFile,
  setPreviewUrl,
  currentUser,
}: UseFileHandlingProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const compressedBlob = await compressImage(file, 600, MAX_FILE_SIZE_MB);

    const compressedFile = new File([compressedBlob], file.name, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    const newUrl = URL.createObjectURL(compressedFile);
    previewUrlRef.current = newUrl;
    setSelectedFile(compressedFile);
    setPreviewUrl(newUrl);
  };

  const handleClear = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setSelectedFile(null);
    setPreviewUrl(currentUser?.photoURL || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  return {
    fileInputRef,
    handleFileSelect,
    handleClear,
  };
}
