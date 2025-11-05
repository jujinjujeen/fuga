import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProducts } from '../getProducts';

global.fetch = vi.fn();

vi.mock('@f/fe/constants', () => ({
  BASE_URL: 'http://localhost:5444',
}));

describe('getProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all products without search parameter', async () => {
    const mockProducts = [
      {
        id: 'test-id-1',
        title: 'Test Product 1',
        artist: 'Test Artist 1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        image: {
          url: 'http://example.com/image1.jpg',
          width: 500,
          height: 500,
          format: 'jpeg',
        },
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ products: mockProducts }),
    } as Response);

    const result = await getProducts();

    expect(fetch).toHaveBeenCalledWith('http://localhost:5444/api/products', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result).toEqual({ products: mockProducts });
  });

  it('fetches products with search parameter', async () => {
    const searchQuery = 'queen';
    const mockProducts = [
      {
        id: 'test-id-1',
        title: 'Queen Album',
        artist: 'Queen',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        image: {
          url: 'http://example.com/image1.jpg',
          width: 500,
          height: 500,
          format: 'jpeg',
        },
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ products: mockProducts }),
    } as Response);

    const result = await getProducts(searchQuery);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5444/api/products?q=queen',
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    expect(result).toEqual({ products: mockProducts });
  });

  it('throws error when fetch fails', async () => {
    const errorMessage = 'Failed to fetch products';
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: errorMessage }),
    } as Response);

    await expect(getProducts()).rejects.toThrow(errorMessage);
  });

  it('throws generic error when no error message provided', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    await expect(getProducts()).rejects.toThrow('Failed to fetch products');
  });
});
