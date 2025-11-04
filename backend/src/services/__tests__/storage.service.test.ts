import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generatePresignedUploadUrl,
  objectExists,
  moveObjectToPermanent,
  removeObject,
} from '../storage.service';

// Mock AWS SDK
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(),
  GetObjectCommand: vi.fn(),
  HeadObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
  CopyObjectCommand: vi.fn(),
}));

vi.mock('@aws-sdk/s3-presigned-post', () => ({
  createPresignedPost: vi.fn(),
}));

// Mock S3 clients
vi.mock('@f/be/lib/s3', () => ({
  s3ClientInt: {
    send: vi.fn(),
  },
  s3PublicClient: {},
  TMP_BUCKET: 'test-tmp-bucket',
  PERM_BUCKET: 'test-perm-bucket',
}));

import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { s3ClientInt } from '@f/be/lib/s3';

describe('storage.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generatePresignedUploadUrl', () => {
    it('generates presigned URL for valid inputs', async () => {
      vi.mocked(createPresignedPost).mockResolvedValue({
        url: 'https://s3.example.com/tmp-bucket',
        fields: { key: 'test-key', policy: 'test-policy' },
      });

      const result = await generatePresignedUploadUrl(
        'test-image.jpg',
        'image/jpeg',
        1024 * 1024 // 1MB
      );

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('fields');
      expect(result).toHaveProperty('storageKey');
      expect(result.storageKey).toMatch(/^[0-9a-f-]+\/test-image\.jpg$/);
      expect(createPresignedPost).toHaveBeenCalledOnce();
    });

    it('throws error for invalid filename', async () => {
      await expect(
        generatePresignedUploadUrl('', 'image/jpeg', 1024)
      ).rejects.toThrow('Invalid filename');
    });

    it('throws error for invalid file type', async () => {
      await expect(
        generatePresignedUploadUrl('test.pdf', 'application/pdf', 1024)
      ).rejects.toThrow('Invalid file type');
    });

    it('throws error for file size exceeding limit', async () => {
      await expect(
        generatePresignedUploadUrl(
          'test.jpg',
          'image/jpeg',
          11 * 1024 * 1024 // 11MB > 10MB limit
        )
      ).rejects.toThrow('Invalid file size');
    });
  });

  describe('objectExists', () => {
    it('returns true when object exists', async () => {
      vi.mocked(s3ClientInt.send).mockResolvedValue();

      const result = await objectExists('test-key');

      expect(result).toBe(true);
    });

    it('returns false when object not found', async () => {
      const notFoundError = Object.assign(new Error('Not Found'), {
        name: 'NotFound',
      });
      vi.mocked(s3ClientInt.send).mockRejectedValue(notFoundError);

      const result = await objectExists('nonexistent-key');

      expect(result).toBe(false);
    });

    it('throws error for other S3 errors', async () => {
      const s3Error = Object.assign(new Error('S3 Error'), {
        name: 'InternalError',
      });
      vi.mocked(s3ClientInt.send).mockRejectedValue(s3Error);

      await expect(objectExists('test-key')).rejects.toThrow(
        'Failed to check object existence'
      );
    });
  });

  describe('moveObjectToPermanent', () => {
    it('successfully moves object from temp to perm bucket', async () => {
      vi.mocked(s3ClientInt.send).mockResolvedValue();

      await moveObjectToPermanent('test-key');

      expect(s3ClientInt.send).toHaveBeenCalledTimes(2); // Copy + Delete
    });

    it('cleans up partial copy on failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const copyError = new Error('Copy failed');
      vi.mocked(s3ClientInt.send)
        .mockRejectedValueOnce(copyError) // Copy fails
        .mockResolvedValueOnce(); // Cleanup succeeds

      await expect(moveObjectToPermanent('test-key')).rejects.toThrow(
        'Failed to move object to permanent storage'
      );

      expect(s3ClientInt.send).toHaveBeenCalledTimes(2); // Copy attempt + Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe('removeObject', () => {
    it('successfully removes object from temp bucket', async () => {
      vi.mocked(s3ClientInt.send).mockResolvedValue();

      await removeObject('test-key', 'temp');

      expect(s3ClientInt.send).toHaveBeenCalledOnce();
    });

    it('throws error when deletion fails', async () => {
      vi.mocked(s3ClientInt.send).mockRejectedValue(new Error('Delete failed'));

      await expect(removeObject('test-key', 'temp')).rejects.toThrow(
        'Failed to delete object from storage'
      );
    });
  });
});
