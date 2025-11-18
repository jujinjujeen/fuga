import { useQuery } from '@tanstack/react-query';
import { getProduct } from '../api/getProduct';
import { productQueryKeys } from '@f/fe/features/products/queryKeys';

/**
 * Hook to fetch a single product by ID using Tanstack Query
 * @param productId - Product UUID
 * @returns Query result with product data, loading state, and error
 */
export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: productQueryKeys.detail(productId!),
    queryFn: () => getProduct(productId!),
    enabled: !!productId,
  });
}
