import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProduct } from '../updateProduct';
import type { Product, ProductCreate } from '@f/types/api-schemas';

// Mock fetch
global.fetch = vi.fn();

describe('updateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUpdateData: ProductCreate = {
    title: 'Updated Album',
    artist: 'Updated Artist',
    imageKey: 'updated-key-123',
  };

  const mockUpdatedProduct: Product = {
    id: 'product-123',
    title: 'Updated Album',
    artist: 'Updated Artist',
    image: {
      key: 'updated-key-123',
      url: 'https://example.com/updated-image.jpg',
    },
  } as Product;

  it('should successfully update a product', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockUpdatedProduct,
    } as Response);

    const result = await updateProduct('product-123', mockUpdateData);

    expect(result).toEqual(mockUpdatedProduct);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/products/product-123'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUpdateData),
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

    await expect(
      updateProduct('non-existent-id', mockUpdateData)
    ).rejects.toThrow('Product not found');
  });

  it('should throw error when validation fails', async () => {
    const errorResponse = { message: 'Title is required' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => errorResponse,
    } as Response);

    await expect(
      updateProduct('product-123', { ...mockUpdateData, title: '' })
    ).rejects.toThrow('Title is required');
  });

  it('should throw generic error when response has no message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    await expect(
      updateProduct('product-123', mockUpdateData)
    ).rejects.toThrow('Failed to update product');
  });

  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    await expect(
      updateProduct('product-123', mockUpdateData)
    ).rejects.toThrow('Network error');
  });
});
