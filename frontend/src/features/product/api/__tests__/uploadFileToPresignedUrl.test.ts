import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadFileToPresignedUrl } from '../uploadFileToPresignedUrl';

// Mock fetch
global.fetch = vi.fn();

describe('uploadFileToPresignedUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUrl = 'https://s3.amazonaws.com/bucket';
  const mockFields = {
    key: 'temp/test-image.jpg',
    'x-amz-algorithm': 'AWS4-HMAC-SHA256',
    'x-amz-credential': 'credentials',
    'x-amz-date': '20240101T000000Z',
    policy: 'policy-string',
    'x-amz-signature': 'signature',
  };
  const mockFile = new File(['test content'], 'test-image.jpg', {
    type: 'image/jpeg',
  });

  it('should successfully upload file to presigned URL', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as Response);

    await uploadFileToPresignedUrl(mockUrl, mockFields, mockFile);

    expect(fetch).toHaveBeenCalledWith(mockUrl, {
      method: 'POST',
      body: expect.any(FormData),
    });

    const callArgs = vi.mocked(fetch).mock.calls[0];
    const formData = callArgs[1]?.body as FormData;

    // Verify all fields are in FormData
    Object.entries(mockFields).forEach(([key]) => {
      expect(formData.has(key)).toBe(true);
    });
    expect(formData.has('file')).toBe(true);
  });

  it('should append fields in correct order (fields before file)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as Response);

    await uploadFileToPresignedUrl(mockUrl, mockFields, mockFile);

    const callArgs = vi.mocked(fetch).mock.calls[0];
    const formData = callArgs[1]?.body as FormData;

    // Get all entries
    const entries = Array.from(formData.entries());

    // File should be last
    const lastEntry = entries[entries.length - 1];
    expect(lastEntry[0]).toBe('file');
  });

  it('should throw error when upload fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as Response);

    await expect(
      uploadFileToPresignedUrl(mockUrl, mockFields, mockFile)
    ).rejects.toThrow('Failed to upload file to presigned URL');
  });

  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    await expect(
      uploadFileToPresignedUrl(mockUrl, mockFields, mockFile)
    ).rejects.toThrow('Network error');
  });

  it('should handle expired presigned URL', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as Response);

    await expect(
      uploadFileToPresignedUrl(mockUrl, mockFields, mockFile)
    ).rejects.toThrow('Failed to upload file to presigned URL');
  });

  it('should upload different file types', async () => {
    const pngFile = new File(['png content'], 'test-image.png', {
      type: 'image/png',
    });

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as Response);

    await uploadFileToPresignedUrl(mockUrl, mockFields, pngFile);

    expect(fetch).toHaveBeenCalledWith(mockUrl, {
      method: 'POST',
      body: expect.any(FormData),
    });
  });
});
