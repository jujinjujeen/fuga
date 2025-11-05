import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as productsService from '../products.service';
import * as productsRepo from '../products.repo';
import * as storageService from '@f/be/services/storage.service';
import { imageService } from '@f/be/services/image.service';
import { deleteCache, getKeyHelper } from '@f/be/lib/redisClient';
import { mapProduct, mapProducts } from '@f/be/mappers/products.mapper';

// Mock dependencies
vi.mock('../products.repo');
vi.mock('@f/be/services/storage.service');
vi.mock('@f/be/services/image.service');
vi.mock('@f/be/lib/redisClient', () => ({
  deleteCache: vi.fn(),
  getKeyHelper: vi.fn((key) => key),
}));
vi.mock('@f/be/mappers/products.mapper');

// Helper to create mock product
const mockProduct = (overrides = {}) => ({
  id: '123-uuid',
  title: 'Test Product',
  artist: 'Test Artist',
  version: 'v1',
  createdAt: new Date(),
  updatedAt: new Date(),
  image: {
    id: 'img-123',
    productId: '123-uuid',
    storageKey: 'test-key',
    width: 500,
    height: 500,
    format: 'jpeg' as const,
    createdAt: new Date(),
  },
  ...overrides,
});

const mockImageMetadata = {
  width: 500,
  height: 500,
  format: 'jpeg' as const,
};

describe('products.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProduct', () => {
    it('creates product with image, promotes to storage, invalidates cache', async () => {
      const product = mockProduct();
      vi.mocked(imageService.getImageMetadata).mockResolvedValue(mockImageMetadata);
      vi.mocked(storageService.moveObjectToPermanent).mockResolvedValue(undefined);
      vi.mocked(productsRepo.createProduct).mockResolvedValue(product);
      vi.mocked(mapProduct).mockReturnValue(product as any);

      await productsService.createProduct('Title', 'Artist', 'img-key');

      expect(imageService.getImageMetadata).toHaveBeenCalledWith('img-key');
      expect(storageService.moveObjectToPermanent).toHaveBeenCalledWith('img-key');
      expect(productsRepo.createProduct).toHaveBeenCalledWith({
        title: 'Title',
        artist: 'Artist',
        image: {
          create: {
            storageKey: 'img-key',
            width: 500,
            height: 500,
            format: 'jpeg',
          },
        },
      });
      expect(deleteCache).toHaveBeenCalledWith('/products');
    });

    it('cleans up image on metadata error', async () => {
      vi.mocked(imageService.getImageMetadata).mockRejectedValue(
        new Error('Unsupported image format')
      );

      await expect(
        productsService.createProduct('Title', 'Artist', 'img-key')
      ).rejects.toThrow('Unsupported image format');

      expect(storageService.removeObject).toHaveBeenCalledWith('img-key');
    });

    it('cleans up image on invalid metadata error', async () => {
      vi.mocked(imageService.getImageMetadata).mockRejectedValue(
        new Error('Invalid image metadata')
      );

      await expect(
        productsService.createProduct('Title', 'Artist', 'img-key')
      ).rejects.toThrow('Invalid image metadata');

      expect(storageService.removeObject).toHaveBeenCalledWith('img-key');
    });
  });

  describe('getAllProducts', () => {
    it('retrieves and maps all products without search', async () => {
      const products = [mockProduct(), mockProduct({ id: '456-uuid' })];
      vi.mocked(productsRepo.getAllProducts).mockResolvedValue(products);
      vi.mocked(mapProducts).mockReturnValue(products as any);

      const result = await productsService.getAllProducts();

      expect(productsRepo.getAllProducts).toHaveBeenCalledWith(undefined);
      expect(mapProducts).toHaveBeenCalledWith(products);
      expect(result).toEqual(products);
    });

    it('retrieves and maps products with search query', async () => {
      const products = [mockProduct({ title: 'Queen Album' })];
      vi.mocked(productsRepo.getAllProducts).mockResolvedValue(products);
      vi.mocked(mapProducts).mockReturnValue(products as any);

      const result = await productsService.getAllProducts('queen');

      expect(productsRepo.getAllProducts).toHaveBeenCalledWith('queen');
      expect(mapProducts).toHaveBeenCalledWith(products);
      expect(result).toEqual(products);
    });
  });

  describe('getProductById', () => {
    it('retrieves and maps product by id', async () => {
      const product = mockProduct();
      vi.mocked(productsRepo.getProductById).mockResolvedValue(product);
      vi.mocked(mapProduct).mockReturnValue(product as any);

      const result = await productsService.getProductById('123-uuid');

      expect(productsRepo.getProductById).toHaveBeenCalledWith('123-uuid');
      expect(mapProduct).toHaveBeenCalledWith(product);
      expect(result).toEqual(product);
    });

    it('returns null when product not found', async () => {
      vi.mocked(productsRepo.getProductById).mockResolvedValue(null);

      const result = await productsService.getProductById('non-existent');

      expect(result).toBeNull();
      expect(mapProduct).not.toHaveBeenCalled();
    });
  });

  describe('updateProduct', () => {
    it('updates product without image change', async () => {
      const product = mockProduct();
      vi.mocked(productsRepo.updateProduct).mockResolvedValue(product);
      vi.mocked(mapProduct).mockReturnValue(product as any);

      await productsService.updateProduct('123-uuid', 'New Title', 'New Artist');

      expect(productsRepo.updateProduct).toHaveBeenCalledWith('123-uuid', {
        title: 'New Title',
        artist: 'New Artist',
      });
      expect(deleteCache).toHaveBeenCalledWith('/products');
      expect(deleteCache).toHaveBeenCalledWith('/products/123-uuid');
    });

    it('updates product with new image, removes old image', async () => {
      const oldProduct = mockProduct({ image: { ...mockProduct().image, storageKey: 'old-key' } });
      const newProduct = mockProduct({ image: { ...mockProduct().image, storageKey: 'new-key' } });
      
      vi.mocked(productsRepo.getProductById).mockResolvedValue(oldProduct);
      vi.mocked(imageService.getImageMetadata).mockResolvedValue(mockImageMetadata);
      vi.mocked(storageService.moveObjectToPermanent).mockResolvedValue(undefined);
      vi.mocked(productsRepo.updateProduct).mockResolvedValue(newProduct);
      vi.mocked(mapProduct).mockReturnValue(newProduct as any);
      vi.mocked(storageService.removeObject).mockResolvedValue(undefined);

      await productsService.updateProduct('123-uuid', 'Title', 'Artist', 'new-key');

      expect(storageService.moveObjectToPermanent).toHaveBeenCalledWith('new-key');
      expect(productsRepo.updateProduct).toHaveBeenCalledWith('123-uuid', {
        title: 'Title',
        artist: 'Artist',
        image: {
          update: {
            storageKey: 'new-key',
            width: 500,
            height: 500,
            format: 'jpeg',
          },
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(storageService.removeObject).toHaveBeenCalledWith('old-key', 'perm');
    });

    it('skips image update if same key provided', async () => {
      const product = mockProduct({ image: { ...mockProduct().image, storageKey: 'same-key' } });
      
      vi.mocked(productsRepo.getProductById).mockResolvedValue(product);
      vi.mocked(productsRepo.updateProduct).mockResolvedValue(product);
      vi.mocked(mapProduct).mockReturnValue(product as any);

      await productsService.updateProduct('123-uuid', 'Title', 'Artist', 'same-key');

      expect(imageService.getImageMetadata).not.toHaveBeenCalled();
      expect(storageService.moveObjectToPermanent).not.toHaveBeenCalled();
    });

    it('returns null when product not found', async () => {
      vi.mocked(productsRepo.updateProduct).mockResolvedValue(null);

      const result = await productsService.updateProduct('non-existent', 'Title', 'Artist');

      expect(result).toBeNull();
    });

    it('cleans up new image on metadata error', async () => {
      vi.mocked(productsRepo.getProductById).mockResolvedValue(mockProduct());
      vi.mocked(imageService.getImageMetadata).mockRejectedValue(
        new Error('Unsupported image format')
      );

      await expect(
        productsService.updateProduct('123-uuid', 'Title', 'Artist', 'new-key')
      ).rejects.toThrow('Unsupported image format');

      expect(storageService.removeObject).toHaveBeenCalledWith('new-key');
    });
  });

  describe('deleteProduct', () => {
    it('deletes product and removes image from storage', async () => {
      const product = mockProduct();
      vi.mocked(productsRepo.deleteProduct).mockResolvedValue(product);
      vi.mocked(storageService.removeObject).mockResolvedValue(undefined);

      const result = await productsService.deleteProduct('123-uuid');

      expect(productsRepo.deleteProduct).toHaveBeenCalledWith('123-uuid');
      expect(storageService.removeObject).toHaveBeenCalledWith('test-key', 'perm');
      expect(deleteCache).toHaveBeenCalledWith('/products');
      expect(deleteCache).toHaveBeenCalledWith('/products/123-uuid');
      expect(result).toBe(true);
    });

    it('returns false when product not found', async () => {
      vi.mocked(productsRepo.deleteProduct).mockResolvedValue(null);

      const result = await productsService.deleteProduct('non-existent');

      expect(result).toBe(false);
      expect(storageService.removeObject).not.toHaveBeenCalled();
      expect(deleteCache).not.toHaveBeenCalled();
    });

    it('deletes product without image', async () => {
      const product = mockProduct({ image: null });
      vi.mocked(productsRepo.deleteProduct).mockResolvedValue(product);

      const result = await productsService.deleteProduct('123-uuid');

      expect(result).toBe(true);
      expect(storageService.removeObject).not.toHaveBeenCalled();
    });
  });
});
