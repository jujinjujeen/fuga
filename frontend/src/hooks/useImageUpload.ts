import { useState, useRef, useCallback } from 'react';
import { getPresignedUrl, uploadFileToPresignedUrl } from '../api/upload';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FORMATS = ['image/png', 'image/jpeg', 'image/webp'];

interface UseImageUploadReturn {
  imagePreview: string | null;
  storageKey: string | null;
  isUploading: boolean;
  error: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearSelection: () => void;
  reset: () => void;
  setError: (error: string) => void;
}

/**
 * Custom hook for handling image uploads with presigned URLs
 * Handles validation, preview, and upload logic
 */
export const useImageUpload = (): UseImageUploadReturn => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [storageKey, setStorageKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearSelection = useCallback(() => {
    setImagePreview(null);
    setStorageKey(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const reset = useCallback(() => {
    clearSelection();
    setError(null);
    setIsUploading(false);
  }, [clearSelection]);

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

  const createPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset previous error
      setError(null);

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        clearSelection();
        return;
      }

      // Create preview
      try {
        const preview = await createPreview(file);
        setImagePreview(preview);
      } catch {
        setError('Failed to create image preview');
        clearSelection();
        return;
      }

      // Upload to presigned URL
      setIsUploading(true);
      try {
        const response = await getPresignedUrl(file.name, file.type, file.size);

        if ('title' in response) {
          throw new Error(response.message || 'Failed to get presigned URL');
        }

        // Upload file directly to S3/MinIO using presigned POST
        await uploadFileToPresignedUrl(response.url, response.fields, file);

        setStorageKey(response.storageKey);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        clearSelection();
      } finally {
        setIsUploading(false);
      }
    },
    [validateFile, createPreview, clearSelection]
  );

  return {
    imagePreview,
    storageKey,
    isUploading,
    error,
    fileInputRef,
    handleFileChange,
    clearSelection,
    reset,
    setError,
  };
};
