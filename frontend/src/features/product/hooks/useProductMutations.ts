import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct } from '../api/createProduct';
import { updateProduct } from '../api/updateProduct';
import { deleteProduct } from '../api/deleteProduct';
import { productQueryKeys } from '@f/fe/features/products/queryKeys';
import type { ProductCreate } from '@f/types/api-schemas';

/**
 * Hook for creating a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: ProductCreate) => createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
  });
}

/**
 * Hook for updating an existing product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, product }: { id: string; product: ProductCreate }) =>
      updateProduct(id, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
  });
}

/**
 * Hook for deleting a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    },
  });
}
