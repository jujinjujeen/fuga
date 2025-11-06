import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useImageUpload } from '../useImageUpload';
import * as getPresignedUrlModule from '../../api/getPresignedUrl';
import * as uploadFileToPresignedUrlModule from '../../api/uploadFileToPresignedUrl';
import type { PresignResponse } from '@f/types/api-schemas';

// Mock the API functions
vi.mock('../../api/getPresignedUrl');
vi.mock('../../api/uploadFileToPresignedUrl');

describe('useImageUpload', () => {
  const mockPresignedResponse = {
    url: 'https://s3.amazonaws.com/bucket',
    fields: {
      key: 'temp/test-image.jpg',
    },
    storageKey: 'temp/test-image.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  });

  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useImageUpload());

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBe(null);
    expect(result.current.storageKey).toBe(null);
    expect(result.current.previewUrl).toBe(null);
  });

  it('should initialize with initial image URL', () => {
    const initialUrl = 'https://example.com/temp/existing-image.jpg';
    const { result } = renderHook(() => useImageUpload(initialUrl));

    expect(result.current.previewUrl).toBe(initialUrl);
    expect(result.current.storageKey).toBe('temp/existing-image.jpg');
  });

  it('should successfully upload valid file', async () => {
    vi.mocked(getPresignedUrlModule.getPresignedUrl).mockResolvedValueOnce(
      mockPresignedResponse
    );
    vi.mocked(
      uploadFileToPresignedUrlModule.uploadFileToPresignedUrl
    ).mockResolvedValueOnce();

    const { result } = renderHook(() => useImageUpload());

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    let uploadResult: string | null = null;
    await act(async () => {
      uploadResult = await result.current.upload(file);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('done');
    });

    expect(uploadResult).toBe('temp/test-image.jpg');
    expect(result.current.storageKey).toBe('temp/test-image.jpg');
    expect(result.current.previewUrl).toBe('blob:mock-url');
    expect(result.current.error).toBe(null);
  });

  it('should reject file with invalid format', async () => {
    const { result } = renderHook(() => useImageUpload());

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    let uploadResult: string | null = null;
    await act(async () => {
      uploadResult = await result.current.upload(file);
    });

    expect(uploadResult).toBe(null);
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(
      'Invalid file format. Please upload PNG, JPG, or WEBP.'
    );
  });

  it('should reject file exceeding size limit', async () => {
    const { result } = renderHook(() => useImageUpload());

    // Create file larger than 10MB
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    let uploadResult: string | null = null;
    await act(async () => {
      uploadResult = await result.current.upload(largeFile);
    });

    expect(uploadResult).toBe(null);
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(
      'File size too large. Maximum size is 10MB.'
    );
  });

  it('should accept PNG files', async () => {
    vi.mocked(getPresignedUrlModule.getPresignedUrl).mockResolvedValueOnce(
      mockPresignedResponse
    );
    vi.mocked(
      uploadFileToPresignedUrlModule.uploadFileToPresignedUrl
    ).mockResolvedValueOnce();

    const { result } = renderHook(() => useImageUpload());

    const file = new File(['test'], 'test.png', { type: 'image/png' });

    await act(async () => {
      await result.current.upload(file);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('done');
    });
  });

  it('should accept WEBP files', async () => {
    vi.mocked(getPresignedUrlModule.getPresignedUrl).mockResolvedValueOnce(
      mockPresignedResponse
    );
    vi.mocked(
      uploadFileToPresignedUrlModule.uploadFileToPresignedUrl
    ).mockResolvedValueOnce();

    const { result } = renderHook(() => useImageUpload());

    const file = new File(['test'], 'test.webp', { type: 'image/webp' });

    await act(async () => {
      await result.current.upload(file);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('done');
    });
  });

  it('should handle presign error', async () => {
    vi.mocked(getPresignedUrlModule.getPresignedUrl).mockRejectedValueOnce(
      new Error('Presign failed')
    );

    const { result } = renderHook(() => useImageUpload());

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    let uploadResult: string | null = null;
    await act(async () => {
      uploadResult = await result.current.upload(file);
    });

    expect(uploadResult).toBe(null);
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Presign failed');
  });

  it('should handle upload error', async () => {
    vi.mocked(getPresignedUrlModule.getPresignedUrl).mockResolvedValueOnce(
      mockPresignedResponse
    );
    vi.mocked(
      uploadFileToPresignedUrlModule.uploadFileToPresignedUrl
    ).mockRejectedValueOnce(new Error('Upload failed'));

    const { result } = renderHook(() => useImageUpload());

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    let uploadResult: string | null = null;
    await act(async () => {
      uploadResult = await result.current.upload(file);
    });

    expect(uploadResult).toBe(null);
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Upload failed');
  });

  it('should update status to presigning during presign phase', async () => {
    let resolvePresign: (value: PresignResponse) => void;
    const presignPromise = new Promise<PresignResponse>((resolve) => {
      resolvePresign = resolve;
    });

    vi.mocked(getPresignedUrlModule.getPresignedUrl).mockReturnValueOnce(
      presignPromise
    );
    vi.mocked(
      uploadFileToPresignedUrlModule.uploadFileToPresignedUrl
    ).mockResolvedValueOnce();

    const { result } = renderHook(() => useImageUpload());

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.upload(file);
    });

    // Should be in presigning state
    await waitFor(() => {
      expect(result.current.status).toBe('presigning');
    });

    // Resolve the promise
    await act(async () => {
      resolvePresign(mockPresignedResponse);
      await presignPromise;
    });

    await waitFor(() => {
      expect(result.current.status).toBe('done');
    });
  });

  it('should update status to uploading during upload phase', async () => {
    let resolveUpload: () => void;
    const uploadPromise = new Promise<void>((resolve) => {
      resolveUpload = resolve;
    });

    vi.mocked(getPresignedUrlModule.getPresignedUrl).mockResolvedValueOnce(
      mockPresignedResponse
    );
    vi.mocked(
      uploadFileToPresignedUrlModule.uploadFileToPresignedUrl
    ).mockReturnValueOnce(uploadPromise);

    const { result } = renderHook(() => useImageUpload());

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.upload(file);
    });

    // Wait for upload phase
    await waitFor(() => {
      expect(result.current.status).toBe('uploading');
    });

    // Resolve the promise
    await act(async () => {
      resolveUpload();
      await uploadPromise;
    });

    await waitFor(() => {
      expect(result.current.status).toBe('done');
    });
  });

  it('should reset all state when reset is called', async () => {
    vi.mocked(getPresignedUrlModule.getPresignedUrl).mockResolvedValueOnce(
      mockPresignedResponse
    );
    vi.mocked(
      uploadFileToPresignedUrlModule.uploadFileToPresignedUrl
    ).mockResolvedValueOnce();

    const { result } = renderHook(() => useImageUpload());

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Upload file
    await act(async () => {
      await result.current.upload(file);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('done');
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBe(null);
    expect(result.current.storageKey).toBe(null);
    expect(result.current.previewUrl).toBe(null);
  });

  it('should handle error without message', async () => {
    vi.mocked(getPresignedUrlModule.getPresignedUrl).mockRejectedValueOnce({
      message: undefined,
    });

    const { result } = renderHook(() => useImageUpload());

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.upload(file);
    });

    expect(result.current.error).toBe('Upload failed');
  });
});
