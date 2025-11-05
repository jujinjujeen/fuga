import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts } from '../useProducts';
import * as getProductsModule from '../../api/getProducts';
import type { Product } from '@f/types/api-schemas';
import { createElement } from 'react';

const mockProducts: Product[] = [
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
  {
    id: 'test-id-2',
    title: 'Test Product 2',
    artist: 'Test Artist 2',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    image: {
      url: 'http://example.com/image2.jpg',
      width: 500,
      height: 500,
      format: 'jpeg',
    },
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
};

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and returns products successfully', async () => {
    vi.spyOn(getProductsModule, 'getProducts').mockResolvedValue({
      products: mockProducts,
    });

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.products).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.error).toBeNull();
    expect(getProductsModule.getProducts).toHaveBeenCalledWith(undefined);
  });

  it('fetches products with search query', async () => {
    const searchQuery = 'queen';
    const filteredProducts = [mockProducts[0]];

    vi.spyOn(getProductsModule, 'getProducts').mockResolvedValue({
      products: filteredProducts,
    });

    const { result } = renderHook(() => useProducts(searchQuery), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual(filteredProducts);
    expect(result.current.error).toBeNull();
    expect(getProductsModule.getProducts).toHaveBeenCalledWith(searchQuery);
  });

  it('handles error response', async () => {
    const errorMessage = 'Failed to fetch products';
    vi.spyOn(getProductsModule, 'getProducts').mockResolvedValue({
      title: 'Error',
      message: errorMessage,
      code: 500,
    });

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('handles network error', async () => {
    const errorMessage = 'Network error';
    vi.spyOn(getProductsModule, 'getProducts').mockRejectedValue(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('returns empty array when no products found', async () => {
    vi.spyOn(getProductsModule, 'getProducts').mockResolvedValue({
      products: [],
    });

    const { result } = renderHook(() => useProducts('nonexistent'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
