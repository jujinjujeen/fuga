import { describe, it, expect } from 'vitest';
import { mapProduct, mapProducts } from '../products.mapper';
import type { ProductWithImage } from '@f/be/types/shared';

describe('products.mapper', () => {
  const mockProduct: ProductWithImage = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Album',
    artist: 'Test Artist',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    image: {
      id: '223e4567-e89b-12d3-a456-426614174000',
      storageKey: 'uuid/test-image.jpg',
      width: 1200,
      height: 1200,
      format: 'jpeg',
      productId: '123e4567-e89b-12d3-a456-426614174000',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    },
  } as ProductWithImage;

  describe('mapProduct', () => {
    it('maps ProductWithImage to Product DTO correctly', () => {
      const S3_PUBLIC_ENDPOINT = process.env.S3_PUBLIC_ENDPOINT;

      const result = mapProduct(mockProduct);

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Album',
        artist: 'Test Artist',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        image: {
          url: `${S3_PUBLIC_ENDPOINT}/perm/uuid/test-image.jpg`,
          width: 1200,
          height: 1200,
          format: 'jpeg',
        },
      });
    });

    it('handles product with null image', () => {
      const productWithoutImage: ProductWithImage = {
        ...mockProduct,
        image: null,
      };
      const S3_PUBLIC_ENDPOINT = process.env.S3_PUBLIC_ENDPOINT;

      const result = mapProduct(productWithoutImage);

      expect(result.image).toEqual({
        url: `${S3_PUBLIC_ENDPOINT}/perm/undefined`,
        width: 0,
        height: 0,
        format: 'jpeg',
      });
    });
  });

  describe('mapProducts', () => {
    it('maps array of ProductWithImage to Product DTOs', () => {
      const mockProducts: ProductWithImage[] = [
        mockProduct,
        {
          ...mockProduct,
          id: '223e4567-e89b-12d3-a456-426614174001',
          title: 'Another Album',
          artist: 'Another Artist',
        },
      ];

      const result = mapProducts(mockProducts);

      expect(result).toHaveLength(2);
      expect(result?.[0]?.title).toBe('Test Album');
      expect(result?.[1]?.title).toBe('Another Album');
    });

    it('handles empty array', () => {
      const emptyArray: ProductWithImage[] = [];

      const result = mapProducts(emptyArray);

      expect(result).toEqual([]);
    });
  });
});
