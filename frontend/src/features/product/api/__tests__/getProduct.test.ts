import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProduct } from '../getProduct';
import type { Product } from '@f/types/api-schemas';

// Mock fetch
global.fetch = vi.fn();

describe('getProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProduct: Product = {
    id: 'product-123',
    title: 'Test Album',
    artist: 'Test Artist',
    image: {
      key: 'test-key-123',
      url: 'https://example.com/image.jpg',
    },
  } as Product;

  it('should successfully fetch a product', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockProduct,
    } as Response);

    const result = await getProduct('product-123');

    expect(result).toEqual(mockProduct);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/products/product-123'),
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  });

  it('should throw error when product not found', async () => {
    const errorResponse = { message: 'Product not found' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => errorResponse,
    } as Response);

    await expect(getProduct('non-existent-id')).rejects.toThrow(
      'Product not found'
    );
  });

  it('should throw generic error when response has no message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    await expect(getProduct('product-123')).rejects.toThrow(
      'Failed to fetch product'
    );
  });

  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    await expect(getProduct('product-123')).rejects.toThrow('Network error');
  });
});
