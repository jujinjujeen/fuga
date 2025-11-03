import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProductForm } from '../useProductForm';
import * as productsApi from '../../api/products';
import type { Product } from '@f/types/api-schemas';

// Mock the APIs
vi.mock('../../api/products', () => ({
  createProduct: vi.fn(),
}));

vi.mock('../useImageUpload', () => ({
  useImageUpload: vi.fn(() => ({
    imagePreview: null,
    storageKey: null,
    isUploading: false,
    error: null,
    fileInputRef: { current: null },
    handleFileChange: vi.fn(),
    clearSelection: vi.fn(),
    reset: vi.fn(),
    setError: vi.fn(),
  })),
}));

import * as useImageUploadModule from '../useImageUpload';

describe('useProductForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create mode', () => {
    it('initializes with empty form state', () => {
      const { result } = renderHook(() =>
        useProductForm({
          mode: 'create',
          onSuccess: mockOnSuccess,
          onClose: mockOnClose,
        })
      );

      expect(result.current.title).toBe('');
      expect(result.current.artist).toBe('');
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.errors).toEqual({});
      expect(result.current.isFormValid).toBe(false);
    });

    it('updates title and artist', () => {
      const { result } = renderHook(() =>
        useProductForm({
          mode: 'create',
        })
      );

      act(() => {
        result.current.setTitle('Test Album');
      });

      expect(result.current.title).toBe('Test Album');

      act(() => {
        result.current.setArtist('Test Artist');
      });

      expect(result.current.artist).toBe('Test Artist');
    });

    it('validates form and shows errors when fields are empty', async () => {
      const { result } = renderHook(() =>
        useProductForm({
          mode: 'create',
        })
      );

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as never);
      });

      expect(result.current.errors.title).toBe('Title is required');
      expect(result.current.errors.artist).toBe('Artist is required');
      expect(result.current.errors.image).toBe('Please upload an image');
      expect(productsApi.createProduct).not.toHaveBeenCalled();
    });

    it('successfully creates product when form is valid', async () => {
      // Mock useImageUpload with storageKey
      vi.mocked(useImageUploadModule.useImageUpload).mockReturnValue({
        imagePreview: 'data:image/jpeg;base64,mock',
        storageKey: 'uuid/test.jpg',
        isUploading: false,
        error: null,
        fileInputRef: { current: null },
        handleFileChange: vi.fn(),
        clearSelection: vi.fn(),
        reset: vi.fn(),
        setError: vi.fn(),
      });

      const mockProduct: Product = {
        id: '123',
        title: 'Test Album',
        artist: 'Test Artist',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        image: {
          url: 'http://example.com/image.jpg',
          width: 1200,
          height: 1200,
          format: 'jpeg',
        },
      };

      vi.mocked(productsApi.createProduct).mockResolvedValue(mockProduct);

      const { result } = renderHook(() =>
        useProductForm({
          mode: 'create',
          onSuccess: mockOnSuccess,
          onClose: mockOnClose,
        })
      );

      act(() => {
        result.current.setTitle('Test Album');
        result.current.setArtist('Test Artist');
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as never);
      });

      await waitFor(() => {
        expect(productsApi.createProduct).toHaveBeenCalledWith({
          title: 'Test Album',
          artist: 'Test Artist',
          imageKey: 'uuid/test.jpg',
        });
      });

      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
      expect(result.current.errors).toEqual({});
    });

    it('handles API error during product creation', async () => {
      // Mock useImageUpload with storageKey
      vi.mocked(useImageUploadModule.useImageUpload).mockReturnValue({
        imagePreview: 'data:image/jpeg;base64,mock',
        storageKey: 'uuid/test.jpg',
        isUploading: false,
        error: null,
        fileInputRef: { current: null },
        handleFileChange: vi.fn(),
        clearSelection: vi.fn(),
        reset: vi.fn(),
        setError: vi.fn(),
      });

      vi.mocked(productsApi.createProduct).mockRejectedValue(
        new Error('API Error')
      );

      const { result } = renderHook(() =>
        useProductForm({
          mode: 'create',
          onSuccess: mockOnSuccess,
          onClose: mockOnClose,
        })
      );

      act(() => {
        result.current.setTitle('Test Album');
        result.current.setArtist('Test Artist');
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as never);
      });

      await waitFor(() => {
        expect(result.current.errors.submit).toBe('API Error');
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('resets form to initial state', () => {
      const { result } = renderHook(() =>
        useProductForm({
          mode: 'create',
        })
      );

      act(() => {
        result.current.setTitle('Test Album');
        result.current.setArtist('Test Artist');
      });

      expect(result.current.title).toBe('Test Album');
      expect(result.current.artist).toBe('Test Artist');

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.title).toBe('');
      expect(result.current.artist).toBe('');
      expect(result.current.errors).toEqual({});
    });

    it('trims whitespace from title and artist before submission', async () => {
      // Mock useImageUpload with storageKey
      vi.mocked(useImageUploadModule.useImageUpload).mockReturnValue({
        imagePreview: 'data:image/jpeg;base64,mock',
        storageKey: 'uuid/test.jpg',
        isUploading: false,
        error: null,
        fileInputRef: { current: null },
        handleFileChange: vi.fn(),
        clearSelection: vi.fn(),
        reset: vi.fn(),
        setError: vi.fn(),
      });

      vi.mocked(productsApi.createProduct).mockResolvedValue({} as Product);

      const { result } = renderHook(() =>
        useProductForm({
          mode: 'create',
        })
      );

      act(() => {
        result.current.setTitle('  Test Album  ');
        result.current.setArtist('  Test Artist  ');
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as never);
      });

      await waitFor(() => {
        expect(productsApi.createProduct).toHaveBeenCalledWith({
          title: 'Test Album',
          artist: 'Test Artist',
          imageKey: 'uuid/test.jpg',
        });
      });
    });
  });

  describe('edit mode', () => {
    const mockInitialData: Product = {
      id: '123',
      title: 'Initial Album',
      artist: 'Initial Artist',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      image: {
        url: 'http://example.com/image.jpg',
        width: 1200,
        height: 1200,
        format: 'jpeg',
      },
    };

    it('initializes with initial data', () => {
      const { result } = renderHook(() =>
        useProductForm({
          mode: 'edit',
          initialData: mockInitialData,
        })
      );

      expect(result.current.title).toBe('Initial Album');
      expect(result.current.artist).toBe('Initial Artist');
    });

    it('updates form when initialData changes', () => {
      const { result, rerender } = renderHook(
        ({ initialData }) =>
          useProductForm({
            mode: 'edit',
            initialData,
          }),
        {
          initialProps: { initialData: mockInitialData },
        }
      );

      expect(result.current.title).toBe('Initial Album');

      const updatedData: Product = {
        ...mockInitialData,
        title: 'Updated Album',
        artist: 'Updated Artist',
      };

      rerender({ initialData: updatedData });

      expect(result.current.title).toBe('Updated Album');
      expect(result.current.artist).toBe('Updated Artist');
    });

    it('resets to initial data when handleReset is called', () => {
      const { result } = renderHook(() =>
        useProductForm({
          mode: 'edit',
          initialData: mockInitialData,
        })
      );

      act(() => {
        result.current.setTitle('Modified Album');
        result.current.setArtist('Modified Artist');
      });

      expect(result.current.title).toBe('Modified Album');

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.title).toBe('Initial Album');
      expect(result.current.artist).toBe('Initial Artist');
    });

    it('throws error when attempting to submit in edit mode (not implemented)', async () => {
      // Mock useImageUpload with storageKey
      vi.mocked(useImageUploadModule.useImageUpload).mockReturnValue({
        imagePreview: 'data:image/jpeg;base64,mock',
        storageKey: 'uuid/test.jpg',
        isUploading: false,
        error: null,
        fileInputRef: { current: null },
        handleFileChange: vi.fn(),
        clearSelection: vi.fn(),
        reset: vi.fn(),
        setError: vi.fn(),
      });

      const { result } = renderHook(() =>
        useProductForm({
          mode: 'edit',
          initialData: mockInitialData,
        })
      );

      act(() => {
        result.current.setTitle('Updated Album');
      });

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as never);
      });

      await waitFor(() => {
        expect(result.current.errors.submit).toBe(
          'Edit mode not yet implemented'
        );
      });
    });
  });

  describe('form validation', () => {
    it('marks form as invalid when uploading', () => {
      vi.mocked(useImageUploadModule.useImageUpload).mockReturnValue({
        imagePreview: 'data:image/jpeg;base64,mock',
        storageKey: 'uuid/test.jpg',
        isUploading: true, // Uploading
        error: null,
        fileInputRef: { current: null },
        handleFileChange: vi.fn(),
        clearSelection: vi.fn(),
        reset: vi.fn(),
        setError: vi.fn(),
      });

      const { result } = renderHook(() =>
        useProductForm({
          mode: 'create',
        })
      );

      act(() => {
        result.current.setTitle('Test Album');
        result.current.setArtist('Test Artist');
      });

      expect(result.current.isFormValid).toBe(false);
    });

    it('marks form as valid when all fields are filled and not uploading', () => {
      vi.mocked(useImageUploadModule.useImageUpload).mockReturnValue({
        imagePreview: 'data:image/jpeg;base64,mock',
        storageKey: 'uuid/test.jpg',
        isUploading: false,
        error: null,
        fileInputRef: { current: null },
        handleFileChange: vi.fn(),
        clearSelection: vi.fn(),
        reset: vi.fn(),
        setError: vi.fn(),
      });

      const { result } = renderHook(() =>
        useProductForm({
          mode: 'create',
        })
      );

      act(() => {
        result.current.setTitle('Test Album');
        result.current.setArtist('Test Artist');
      });

      expect(result.current.isFormValid).toBe(true);
    });
  });
});
