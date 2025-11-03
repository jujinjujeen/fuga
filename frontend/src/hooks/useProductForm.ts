import { useState, useCallback, useEffect } from 'react';
import { createProduct } from '../api/products';
import type { Product } from '@f/types/api-schemas';
import { useImageUpload } from './useImageUpload';

interface UseProductFormProps {
  mode: 'create' | 'edit';
  initialData?: Product;
  onSuccess?: () => void;
  onClose?: () => void;
}

interface UseProductFormReturn {
  // Form state
  title: string;
  artist: string;
  isSubmitting: boolean;
  errors: Record<string, string>;

  // Form handlers
  setTitle: (title: string) => void;
  setArtist: (artist: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleReset: () => void;

  // Image upload (delegated to useImageUpload)
  imageUpload: ReturnType<typeof useImageUpload>;

  // Validation
  isFormValid: boolean;
}

/**
 * Custom hook for managing product form state and submission
 * Supports both create and edit modes
 */
export const useProductForm = ({
  mode,
  initialData,
  onSuccess,
  onClose,
}: UseProductFormProps): UseProductFormReturn => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [artist, setArtist] = useState(initialData?.artist || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const imageUpload = useImageUpload();

  // Update form when initial data changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setArtist(initialData.artist);
    }
  }, [initialData]);

  const handleReset = useCallback(() => {
    setTitle(initialData?.title || '');
    setArtist(initialData?.artist || '');
    setErrors({});
    imageUpload.reset();
  }, [initialData, imageUpload]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!artist.trim()) {
      newErrors.artist = 'Artist is required';
    }

    if (!imageUpload.storageKey) {
      newErrors.image = 'Please upload an image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, artist, imageUpload.storageKey]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        if (mode === 'create') {
          await createProduct({
            title: title.trim(),
            artist: artist.trim(),
            imageKey: imageUpload.storageKey!,
          });
        } else {
          // Edit mode - would call updateProduct API
          // TODO: Implement when edit API is available
          throw new Error('Edit mode not yet implemented');
        }

        // Success - reset form and close
        handleReset();
        onClose?.();
        onSuccess?.();
      } catch (err) {
        setErrors({
          submit: err instanceof Error ? err.message : 'Operation failed',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      mode,
      title,
      artist,
      imageUpload.storageKey,
      validateForm,
      onSuccess,
      onClose,
      handleReset,
    ]
  );

  const isFormValid =
    !!title.trim() &&
    !!artist.trim() &&
    !!imageUpload.storageKey &&
    !imageUpload.isUploading;

  return {
    title,
    artist,
    isSubmitting,
    errors,
    setTitle,
    setArtist,
    handleSubmit,
    handleReset,
    imageUpload,
    isFormValid,
  };
};
