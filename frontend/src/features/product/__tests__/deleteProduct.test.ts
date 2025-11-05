import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteProduct } from '../api/deleteProduct';

// Mock fetch
global.fetch = vi.fn();

describe('deleteProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully delete a product', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as Response);

    await deleteProduct('test-id-123');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/products/test-id-123'),
      {
        method: 'DELETE',
      }
    );
  });

  it('should throw error when delete fails', async () => {
    const errorResponse = { message: 'Product not found' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => errorResponse,
    } as Response);

    await expect(deleteProduct('non-existent-id')).rejects.toThrow(
      'Product not found'
    );
  });

  it('should throw generic error when response has no message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    await expect(deleteProduct('test-id')).rejects.toThrow(
      'Failed to delete product'
    );
  });
});
