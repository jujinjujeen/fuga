import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProduct, getAllProducts } from '../products.service';
import type { ProductWithImage } from '@f/be/types/shared';

// Mock dependencies
vi.mock('@f/be/services/image.service', () => ({
  imageService: {
    getImageMetadata: vi.fn(),
  },
}));

vi.mock('../products.repo', () => ({
  createProduct: vi.fn(),
  getAllProducts: vi.fn(),
}));

vi.mock('@f/be/lib/redisClient', () => ({
  deleteCache: vi.fn(),
  getKeyHelper: vi.fn(),
}));

vi.mock('@f/be/services/storage.service', () => ({
  moveObjectToPermanent: vi.fn(),
  removeObject: vi.fn(),
}));

vi.mock('@f/be/mappers/products.mapper', () => ({
  mapProducts: vi.fn(),
  mapProduct: vi.fn(),
}));

import { imageService } from '@f/be/services/image.service';
import {
  createProduct as createProductDb,
  getAllProducts as getAllProductsDb,
} from '../products.repo';
import { deleteCache, getKeyHelper } from '@f/be/lib/redisClient';
import {
  moveObjectToPermanent,
  removeObject,
} from '@f/be/services/storage.service';
import { mapProducts, mapProduct } from '@f/be/mappers/products.mapper';
import { Product } from '@f/types/api-schemas';

describe('products.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProduct', () => {
    const mockImageMetadata = {
      width: 1200,
      height: 1200,
      format: 'jpeg' as const,
    };

    const mockProduct: ProductWithImage = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Album',
      artist: 'Test Artist',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      image: {
        id: '223e4567-e89b-12d3-a456-426614174000',
        storageKey: 'test-key',
        width: 1200,
        height: 1200,
        format: 'jpeg',
        productId: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    } as ProductWithImage;

    it('creates product and moves image to permanent storage', async () => {
      const mockMappedProduct: Product = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Album',
        artist: 'Test Artist',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        image: {
          url: 'http://localhost:9000/perm/test-key',
          width: 1200,
          height: 1200,
          format: 'jpeg',
        },
      };

      vi.mocked(imageService.getImageMetadata).mockResolvedValue(
        mockImageMetadata
      );
      vi.mocked(moveObjectToPermanent).mockResolvedValue();
      vi.mocked(createProductDb).mockResolvedValue(mockProduct);
      vi.mocked(mapProduct).mockReturnValue(mockMappedProduct);
      vi.mocked(getKeyHelper).mockReturnValue('/products-cache-key');
      vi.mocked(deleteCache).mockResolvedValue(undefined);

      const result = await createProduct(
        'Test Album',
        'Test Artist',
        'test-key'
      );

      expect(imageService.getImageMetadata).toHaveBeenCalledWith('test-key');
      expect(moveObjectToPermanent).toHaveBeenCalledWith('test-key');
      expect(createProductDb).toHaveBeenCalledWith({
        title: 'Test Album',
        artist: 'Test Artist',
        image: {
          create: {
            storageKey: 'test-key',
            width: 1200,
            height: 1200,
            format: 'jpeg',
          },
        },
      });
      expect(mapProduct).toHaveBeenCalledWith(mockProduct);
      expect(deleteCache).toHaveBeenCalled();
      expect(result).toEqual(mockMappedProduct);
    });

    it('cleans up image when image metadata validation fails', async () => {
      const validationError = new Error('Unsupported image format');
      vi.mocked(imageService.getImageMetadata).mockRejectedValue(
        validationError
      );
      vi.mocked(removeObject).mockResolvedValue();

      await expect(
        createProduct('Test Album', 'Test Artist', 'test-key')
      ).rejects.toThrow('Unsupported image format');

      expect(removeObject).toHaveBeenCalledWith('test-key');
    });

    it('cleans up image when image metadata is invalid', async () => {
      const validationError = new Error('Invalid image metadata');
      vi.mocked(imageService.getImageMetadata).mockRejectedValue(
        validationError
      );
      vi.mocked(removeObject).mockResolvedValue();

      await expect(
        createProduct('Test Album', 'Test Artist', 'test-key')
      ).rejects.toThrow('Invalid image metadata');

      expect(removeObject).toHaveBeenCalledWith('test-key');
    });

    it('does not clean up image when error is unrelated to image validation', async () => {
      vi.mocked(imageService.getImageMetadata).mockResolvedValue(
        mockImageMetadata
      );
      vi.mocked(moveObjectToPermanent).mockRejectedValue(new Error('S3 error'));

      await expect(
        createProduct('Test Album', 'Test Artist', 'test-key')
      ).rejects.toThrow('S3 error');

      expect(removeObject).not.toHaveBeenCalled();
    });
  });

  describe('getAllProducts', () => {
    it('retrieves all products and maps them to DTOs', async () => {
      const mockProducts: ProductWithImage[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Album',
          artist: 'Test Artist',
          createdAt: new Date(),
          updatedAt: new Date(),
          image: null,
        } as ProductWithImage,
      ];

      const mockMappedProducts: Product[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Album',
          artist: 'Test Artist',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
          image: {
            url: 'http://localhost:9000/perm-bucket/test-key',
            width: 1200,
            height: 1200,
            format: 'jpeg',
          },
        },
      ];

      vi.mocked(getAllProductsDb).mockResolvedValue(mockProducts);
      vi.mocked(mapProducts).mockReturnValue(mockMappedProducts);

      const result = await getAllProducts();

      expect(getAllProductsDb).toHaveBeenCalledOnce();
      expect(mapProducts).toHaveBeenCalledWith(mockProducts);
      expect(result).toEqual(mockMappedProducts);
    });
  });
});
