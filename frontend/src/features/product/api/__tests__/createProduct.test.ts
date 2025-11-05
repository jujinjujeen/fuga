import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProduct } from '../createProduct';
import type { Product, ProductCreate } from '@f/types/api-schemas';

// Mock fetch
global.fetch = vi.fn();

describe('createProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProductData: ProductCreate = {
    title: 'Test Album',
    artist: 'Test Artist',
    imageKey: 'test-key-123',
  };

  const mockProduct: Product = {
    id: 'product-123',
    title: 'Test Album',
    artist: 'Test Artist',
    image: {
      key: 'test-key-123',
      url: 'https://example.com/image.jpg',
    },
  } as Product;

  it('should successfully create a product', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => mockProduct,
    } as Response);

    const result = await createProduct(mockProductData);

    expect(result).toEqual(mockProduct);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/products'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockProductData),
      }
    );
  });

  it('should throw error when creation fails', async () => {
    const errorResponse = { message: 'Invalid product data' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => errorResponse,
    } as Response);

    await expect(createProduct(mockProductData)).rejects.toThrow(
      'Invalid product data'
    );
  });

  it('should throw generic error when response has no message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    await expect(createProduct(mockProductData)).rejects.toThrow(
      'Failed to create product'
    );
  });

  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    await expect(createProduct(mockProductData)).rejects.toThrow(
      'Network error'
    );
  });
});
