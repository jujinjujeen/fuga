import { BASE_URL } from '@f/fe/constants';

/**
 * Deletes a product
 * @param productId - Product UUID
 * @throws Error if deletion fails
 */
export async function deleteProduct(productId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/products/${productId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete product');
  }
}
