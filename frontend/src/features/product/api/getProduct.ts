import { BASE_URL } from '@f/fe/constants';
import type { Product } from '@f/types/api-schemas';

/**
 * Fetches a product with ETag for editing
 * @param productId - Product UUID
 * @returns Product data and ETag header or Error response
 */
export async function getProduct(
  productId: string
): Promise<{ product: Product; etag: string }> {
  const response = await fetch(`${BASE_URL}/api/products/${productId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch product');
  }

  const etag = response.headers.get('ETag');
  if (!etag) {
    throw new Error('ETag header missing from response');
  }

  const product: Product = await response.json();
  return { product, etag };
}
