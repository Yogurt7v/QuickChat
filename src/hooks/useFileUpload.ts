import { useState } from 'react';
import type { FileUploadState } from '../types';

export const useFileUpload = () => {
  const [uploadState, setUploadState] = useState<FileUploadState | null>(null);

  const startUpload = (file: File) => {
    setUploadState({
      status: 'pending',
      progress: 0,
      fileName: file.name,
      fileSize: file.size,
      file,
    });
  };

  const updateProgress = (progress: number) => {
    if (!uploadState) return;

    setUploadState(prev =>
      prev
        ? {
            ...prev,
            progress,
            status: progress < 100 ? 'uploading' : 'success',
          }
        : null
    );
  };

  const setError = (error: string) => {
    if (!uploadState) return;

    setUploadState(prev =>
      prev
        ? {
            ...prev,
            status: 'error',
            error,
          }
        : null
    );
  };

  const clearUpload = () => {
    setUploadState(null);
  };

  return {
    uploadState,
    startUpload,
    updateProgress,
    setError,
    clearUpload,
  };
};
