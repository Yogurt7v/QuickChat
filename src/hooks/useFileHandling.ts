import { useRef, useEffect } from 'react';
import type { User } from '../types';

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
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
