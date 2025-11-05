import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '@f/prismaInstance';
import { deleteProduct } from '../products.repo';

describe('products.repo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully and return it with image', async () => {
      const mockProduct = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Product',
        artist: 'Test Artist',
        version: 'v1',
        createdAt: new Date(),
        updatedAt: new Date(),
        image: {
          id: 'img-123',
          productId: '123e4567-e89b-12d3-a456-426614174000',
          storageKey: 'test-key',
          width: 500,
          height: 500,
          format: 'jpeg' as const,
          createdAt: new Date(),
        },
      };

      vi.mocked(prisma.product.delete).mockResolvedValue(mockProduct);

      const result = await deleteProduct('123e4567-e89b-12d3-a456-426614174000');

      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        include: { image: true },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should return null when product does not exist (P2025 error)', async () => {
      const prismaError = {
        code: 'P2025',
        message: 'Record to delete does not exist.',
      };

      vi.mocked(prisma.product.delete).mockRejectedValue(prismaError);

      const result = await deleteProduct('non-existent-id');

      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
        include: { image: true },
      });
      expect(result).toBeNull();
    });

    it('should throw error for non-P2025 errors', async () => {
      const genericError = new Error('Database connection failed');

      vi.mocked(prisma.product.delete).mockRejectedValue(genericError);

      await expect(deleteProduct('some-id')).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle product without image', async () => {
      const mockProductWithoutImage = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Product',
        artist: 'Test Artist',
        version: 'v1',
        createdAt: new Date(),
        updatedAt: new Date(),
        image: null,
      };

      vi.mocked(prisma.product.delete).mockResolvedValue(
        mockProductWithoutImage
      );

      const result = await deleteProduct('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockProductWithoutImage);
      expect(result?.image).toBeNull();
    });
  });
});
