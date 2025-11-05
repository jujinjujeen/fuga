import { useState, useCallback, useEffect } from 'react';
import { getPresignedUrl } from '../api/getPresignedUrl';
import { uploadFileToPresignedUrl } from '../api/uploadFileToPresignedUrl';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FORMATS = ['image/png', 'image/jpeg', 'image/webp'];

type Status = 'idle' | 'presigning' | 'uploading' | 'done' | 'error';

export function useImageUpload(initialImageUrl?: string) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [storageKey, setStorageKey] = useState<string | null>(
    initialImageUrl?.split('/').slice(-2).join('/') || null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImageUrl || null
  );

  useEffect(() => {
    if (error) {
      setStatus('error');
    }
  }, [error]);

  const validateFile = useCallback((file: File): string | null => {
    // Validate file type
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Invalid file format. Please upload PNG, JPG, or WEBP.';
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File size too large. Maximum size is 10MB.';
    }

    return null;
  }, []);

  const upload = useCallback(async (file: File) => {
    setError(null);
    setStatus('presigning');
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return null;
    }

    try {
      const presigned = await getPresignedUrl(file.name, file.type, file.size);
      setStatus('uploading');
      await uploadFileToPresignedUrl(presigned.url, presigned.fields, file);
      setStorageKey(presigned.storageKey);
      setPreviewUrl(URL.createObjectURL(file));
      setStatus('done');
      return presigned.storageKey;
    } catch (err: any) {
      setError(err.message ?? 'Upload failed');
      setStatus('error');
      return null;
    }
  }, []);

  return {
    status,
    error,
    storageKey,
    previewUrl,
    upload,
    reset: () => {
      setStatus('idle');
      setError(null);
      setStorageKey(null);
      setPreviewUrl(null);
    },
  };
}
