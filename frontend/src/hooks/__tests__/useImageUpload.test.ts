import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useImageUpload } from '../useImageUpload';
import * as uploadApi from '../../api/upload';

// Mock the upload API
vi.mock('../../api/upload', () => ({
  getPresignedUrl: vi.fn(),
  uploadFileToPresignedUrl: vi.fn(),
}));

describe('useImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useImageUpload());

    expect(result.current.imagePreview).toBeNull();
    expect(result.current.storageKey).toBeNull();
    expect(result.current.isUploading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.fileInputRef.current).toBeNull();
  });

  it('validates file type and shows error for invalid format', async () => {
    const { result } = renderHook(() => useImageUpload());

    const invalidFile = new File(['content'], 'test.pdf', {
      type: 'application/pdf',
    });

    const event = {
      target: {
        files: [invalidFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleFileChange(event);
    });

    expect(result.current.error).toBe(
      'Invalid file format. Please upload PNG, JPG, or WEBP.'
    );
    expect(result.current.imagePreview).toBeNull();
    expect(result.current.storageKey).toBeNull();
  });

  it('validates file size and shows error for large files', async () => {
    const { result } = renderHook(() => useImageUpload());

    // Create file larger than 10MB
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    const event = {
      target: {
        files: [largeFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleFileChange(event);
    });

    expect(result.current.error).toBe(
      'File size too large. Maximum size is 10MB.'
    );
    expect(result.current.imagePreview).toBeNull();
    expect(result.current.storageKey).toBeNull();
  });

  it('successfully uploads valid file and sets storage key', async () => {
    const { result } = renderHook(() => useImageUpload());

    const validFile = new File(['content'], 'test.jpg', {
      type: 'image/jpeg',
    });

    const mockPresignResponse = {
      url: 'https://s3.example.com/bucket',
      fields: { key: 'test-key' },
      storageKey: 'uuid/test.jpg',
    };

    vi.mocked(uploadApi.getPresignedUrl).mockResolvedValue(
      mockPresignResponse
    );
    vi.mocked(uploadApi.uploadFileToPresignedUrl).mockResolvedValue();

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onloadend: null as ((this: FileReader, ev: ProgressEvent) => void) | null,
      result: 'data:image/jpeg;base64,mock',
    };

    global.FileReader = vi.fn(() => mockFileReader) as never;

    const event = {
      target: {
        files: [validFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      const promise = result.current.handleFileChange(event);

      // Simulate FileReader onloadend
      if (mockFileReader.onloadend) {
        mockFileReader.onloadend.call(mockFileReader as never, {} as ProgressEvent);
      }

      await promise;
    });

    await waitFor(() => {
      expect(result.current.storageKey).toBe('uuid/test.jpg');
    });

    expect(uploadApi.getPresignedUrl).toHaveBeenCalledWith(
      'test.jpg',
      'image/jpeg',
      validFile.size
    );
    expect(uploadApi.uploadFileToPresignedUrl).toHaveBeenCalledWith(
      mockPresignResponse.url,
      mockPresignResponse.fields,
      validFile
    );
    expect(result.current.error).toBeNull();
  });

  it('handles upload error and clears selection', async () => {
    const { result } = renderHook(() => useImageUpload());

    const validFile = new File(['content'], 'test.jpg', {
      type: 'image/jpeg',
    });

    vi.mocked(uploadApi.getPresignedUrl).mockRejectedValue(
      new Error('Upload failed')
    );

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onloadend: null as ((this: FileReader, ev: ProgressEvent) => void) | null,
      result: 'data:image/jpeg;base64,mock',
    };

    global.FileReader = vi.fn(() => mockFileReader) as never;

    const event = {
      target: {
        files: [validFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      const promise = result.current.handleFileChange(event);

      // Simulate FileReader onloadend
      if (mockFileReader.onloadend) {
        mockFileReader.onloadend.call(mockFileReader as never, {} as ProgressEvent);
      }

      await promise;
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Upload failed');
    });

    expect(result.current.imagePreview).toBeNull();
    expect(result.current.storageKey).toBeNull();
    expect(result.current.isUploading).toBe(false);
  });

  it('clears selection when clearSelection is called', () => {
    const { result } = renderHook(() => useImageUpload());

    // Manually set some state for testing
    act(() => {
      result.current.setError('Some error');
    });

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.imagePreview).toBeNull();
    expect(result.current.storageKey).toBeNull();
  });

  it('resets all state when reset is called', () => {
    const { result } = renderHook(() => useImageUpload());

    // Set some state
    act(() => {
      result.current.setError('Some error');
    });

    expect(result.current.error).toBe('Some error');

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.imagePreview).toBeNull();
    expect(result.current.storageKey).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isUploading).toBe(false);
  });
});
