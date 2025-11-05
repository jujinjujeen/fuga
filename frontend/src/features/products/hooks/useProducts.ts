import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/getProducts';
import { productQueryKeys } from '../queryKeys';
import type { Product } from '@f/types/api-schemas';

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch products with optional search
 * @param search - Optional search query
 * @returns Products data, loading state, and error
 */
export const useProducts = (search?: string): UseProductsResult => {
  const { data, isLoading, error } = useQuery({
    queryKey: productQueryKeys.list(search),
    queryFn: async () => {
      const response = await getProducts(search);

      // Check if response is an error
      if ('title' in response) {
        throw new Error(response.message || 'Failed to fetch products');
      }

      return response.products;
    },
  });

  return {
    products: data || [],
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
};
