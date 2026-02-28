const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
const PHOTO_MAX_WIDTH = 1280;
const PHOTO_MAX_HEIGHT = 1280;

export function resizePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > PHOTO_MAX_BYTES * 2) {
      reject(new Error('파일이 너무 큽니다 (최대 4MB)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > PHOTO_MAX_WIDTH || height > PHOTO_MAX_HEIGHT) {
          const ratio = Math.min(PHOTO_MAX_WIDTH / width, PHOTO_MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        while (estimateDataUrlBytes(dataUrl) > PHOTO_MAX_BYTES && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('이미지 로딩 실패'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsDataURL(file);
  });
}

export function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || '';
  return Math.ceil(base64.length * 3 / 4);
}

export function isValidPhotoDataUrl(dataUrl: string): boolean {
  return dataUrl.startsWith('data:image/') && estimateDataUrlBytes(dataUrl) <= PHOTO_MAX_BYTES;
}
