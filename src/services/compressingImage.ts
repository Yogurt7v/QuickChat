import { MAX_FILE_SIZE_MB } from '../constants';

export async function compressImage(
  file: File,
  maxWidth = 600,
  maxSizeMB = MAX_FILE_SIZE_MB
): Promise<Blob> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  let quality = 0.8;

  const compressOnce = (quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          blob => {
            if (blob) resolve(blob);
            else reject('Ошибка сжатия');
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = reject;
    });
  };

  let resultBlob = await compressOnce(quality);

  // если слишком большой — понижаем качество
  while (resultBlob.size > maxSizeBytes && quality > 0.1) {
    quality -= 0.1;
    resultBlob = await compressOnce(quality);
  }

  return resultBlob;
}
