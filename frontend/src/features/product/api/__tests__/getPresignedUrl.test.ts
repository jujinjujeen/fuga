import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPresignedUrl } from '../getPresignedUrl';
import type { PresignResponse } from '@f/types/api-schemas';

// Mock fetch
global.fetch = vi.fn();

describe('getPresignedUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPresignResponse: PresignResponse = {
    url: 'https://s3.amazonaws.com/bucket',
    fields: {
      key: 'temp/test-image.jpg',
      'x-amz-algorithm': 'AWS4-HMAC-SHA256',
      'x-amz-credential': 'credentials',
      'x-amz-date': '20240101T000000Z',
      policy: 'policy-string',
      'x-amz-signature': 'signature',
    },
    storageKey: 'temp/test-image.jpg',
  };

  it('should successfully get presigned URL', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPresignResponse,
    } as Response);

    const result = await getPresignedUrl('test-image.jpg', 'image/jpeg', 12345);

    expect(result).toEqual(mockPresignResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/presign'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test-image.jpg',
          fileType: 'image/jpeg',
          fileSize: 12345,
        }),
      }
    );
  });

  it('should throw error when presign fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid file type' }),
    } as Response);

    await expect(
      getPresignedUrl('test-image.txt', 'text/plain', 12345)
    ).rejects.toThrow('Failed to get presigned URL');
  });

  it('should throw error when file size exceeds limit', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 413,
      json: async () => ({ message: 'File too large' }),
    } as Response);

    const largeFileSize = 20 * 1024 * 1024; // 20MB
    await expect(
      getPresignedUrl('large-image.jpg', 'image/jpeg', largeFileSize)
    ).rejects.toThrow('Failed to get presigned URL');
  });

  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    await expect(
      getPresignedUrl('test-image.jpg', 'image/jpeg', 12345)
    ).rejects.toThrow('Network error');
  });

  it('should handle different file types', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPresignResponse,
    } as Response);

    await getPresignedUrl('test-image.png', 'image/png', 54321);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/presign'),
      expect.objectContaining({
        body: JSON.stringify({
          fileName: 'test-image.png',
          fileType: 'image/png',
          fileSize: 54321,
        }),
      })
    );
  });
});
