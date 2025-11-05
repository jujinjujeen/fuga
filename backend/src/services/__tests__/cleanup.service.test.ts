import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanupTempStorage, listTempObjects } from '../cleanup.service';
import * as s3Module from '@f/be/lib/s3';
import {
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

// Mock S3 client
vi.mock('@f/be/lib/s3', () => ({
  s3ClientInt: {
    send: vi.fn(),
  },
  TMP_BUCKET: 'test-tmp-bucket',
}));

// Mock console methods
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('cleanup.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
  });

  describe('listTempObjects', () => {
    it('lists all objects from temp bucket', async () => {
      const mockObjects = [
        {
          Key: 'test-key-1',
          LastModified: new Date('2024-01-01T10:00:00Z'),
        },
        {
          Key: 'test-key-2',
          LastModified: new Date('2024-01-01T11:00:00Z'),
        },
      ];

      (vi.mocked(s3Module.s3ClientInt.send) as any).mockResolvedValueOnce({
        Contents: mockObjects,
        NextContinuationToken: undefined,
        $metadata: {},
      });

      const result = await listTempObjects();

      expect(result).toHaveLength(2);
      expect(result[0]?.key).toBe('test-key-1');
      expect(result[1]?.key).toBe('test-key-2');
      expect(s3Module.s3ClientInt.send).toHaveBeenCalledWith(
        expect.any(ListObjectsV2Command)
      );
    });

    it('handles pagination correctly', async () => {
      (vi.mocked(s3Module.s3ClientInt.send) as any)
        .mockResolvedValueOnce({
          Contents: [
            {
              Key: 'key-1',
              LastModified: new Date('2024-01-01T10:00:00Z'),
            },
          ],
          NextContinuationToken: 'token-123',
          $metadata: {},
        })
        .mockResolvedValueOnce({
          Contents: [
            {
              Key: 'key-2',
              LastModified: new Date('2024-01-01T11:00:00Z'),
            },
          ],
          NextContinuationToken: undefined,
          $metadata: {},
        });

      const result = await listTempObjects();

      expect(result).toHaveLength(2);
      expect(s3Module.s3ClientInt.send).toHaveBeenCalledTimes(2);
    });

    it('returns empty array when bucket is empty', async () => {
      (vi.mocked(s3Module.s3ClientInt.send) as any).mockResolvedValueOnce({
        Contents: [],
        NextContinuationToken: undefined,
        $metadata: {},
      });

      const result = await listTempObjects();

      expect(result).toEqual([]);
    });

    it('throws error when listing fails', async () => {
      vi.mocked(s3Module.s3ClientInt.send).mockRejectedValueOnce(
        new Error('S3 error')
      );

      await expect(listTempObjects()).rejects.toThrow(
        'Failed to list temporary objects'
      );
    });
  });

  describe('cleanupTempStorage', () => {
    it('deletes files older than TTL', async () => {
      const now = Date.now();
      const oldDate = new Date(now - 10 * 60 * 1000); // 10 minutes ago (older than 5 min TTL)
      const recentDate = new Date(now - 2 * 60 * 1000); // 2 minutes ago (newer than TTL)

      // Mock listing objects
      (vi.mocked(s3Module.s3ClientInt.send) as any).mockResolvedValueOnce({
        Contents: [
          { Key: 'old-file.jpg', LastModified: oldDate },
          { Key: 'recent-file.jpg', LastModified: recentDate },
        ],
        NextContinuationToken: undefined,
        $metadata: {},
      });

      // Mock deleting old file
      (vi.mocked(s3Module.s3ClientInt.send) as any).mockResolvedValueOnce({
        $metadata: {},
      });

      const result = await cleanupTempStorage();

      expect(result.deletedCount).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(s3Module.s3ClientInt.send).toHaveBeenCalledTimes(2); // 1 list + 1 delete
    });

    it('handles deletion errors gracefully', async () => {
      const now = Date.now();
      const oldDate = new Date(now - 10 * 60 * 1000);

      // Mock listing objects
      (vi.mocked(s3Module.s3ClientInt.send) as any).mockResolvedValueOnce({
        Contents: [{ Key: 'old-file.jpg', LastModified: oldDate }],
        NextContinuationToken: undefined,
        $metadata: {},
      });

      // Mock deletion failure
      vi.mocked(s3Module.s3ClientInt.send).mockRejectedValueOnce(
        new Error('Delete failed')
      );

      const result = await cleanupTempStorage();

      expect(result.deletedCount).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('old-file.jpg');
    });

    it('does not delete recent files', async () => {
      const now = Date.now();
      const recentDate = new Date(now - 2 * 60 * 1000); // 2 minutes ago

      // Mock listing objects
      (vi.mocked(s3Module.s3ClientInt.send) as any).mockResolvedValueOnce({
        Contents: [{ Key: 'recent-file.jpg', LastModified: recentDate }],
        NextContinuationToken: undefined,
        $metadata: {},
      });

      const result = await cleanupTempStorage();

      expect(result.deletedCount).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(s3Module.s3ClientInt.send).toHaveBeenCalledTimes(1); // Only listing, no deletion
    });

    it('handles empty bucket', async () => {
      (vi.mocked(s3Module.s3ClientInt.send) as any).mockResolvedValueOnce({
        Contents: [],
        NextContinuationToken: undefined,
        $metadata: {},
      });

      const result = await cleanupTempStorage();

      expect(result.deletedCount).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });
});
