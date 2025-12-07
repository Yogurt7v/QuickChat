// Константы
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

// Запрещённые MIME-типы
const FORBIDDEN_MIME_TYPES = [
  'application/x-msdownload', // .exe
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-mach-binary',
  'application/vnd.android.package-archive', // .apk
  'application/x-java-applet',
  'application/x-jar',
  'application/x-bat', // .bat
  'application/x-shellscript', // .sh
  'application/x-powershell', // .ps1
  'application/x-ms-shortcut', // .lnk
];

// Запрещённые расширения
const FORBIDDEN_EXTENSIONS = [
  '.exe',
  '.msi',
  '.bat',
  '.cmd',
  '.sh',
  '.ps1',
  '.jar',
  '.apk',
  '.dmg',
  '.pkg',
  '.app',
  '.scr',
  '.com',
  '.vb',
  '.vbs',
  '.js',
  '.jse',
];

// Основная функция валидации
export const validateFile = (
  file: File
): { isValid: boolean; error?: string } => {
  // Проверка размера
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `Файл слишком большой. Максимум: 25 MB.`,
    };
  }

  // Проверка MIME-типа
  if (FORBIDDEN_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Этот тип файла запрещён.',
    };
  }

  // Проверка расширения
  const fileName = file.name.toLowerCase();
  const hasForbiddenExtension = FORBIDDEN_EXTENSIONS.some(ext =>
    fileName.endsWith(ext)
  );

  if (hasForbiddenExtension) {
    return {
      isValid: false,
      error: 'Это расширение файла запрещено.',
    };
  }

  return { isValid: true };
};
