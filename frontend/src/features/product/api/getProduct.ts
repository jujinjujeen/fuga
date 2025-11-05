import { BASE_URL } from '@f/fe/constants';
import type { Product } from '@f/types/api-schemas';

/**
 * Fetches a product by ID
 * @param productId - Product UUID
 * @returns Product data or error response
 */
export async function getProduct(productId: string): Promise<Product> {
  const response = await fetch(`${BASE_URL}/api/products/${productId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch product');
  }

  return response.json();
}
