import { BASE_URL } from '@f/fe/constants';
import type {
  Product,
  ProductCreate,
} from '@f/types/api-schemas';

/**
 * Updates an existing product
 * @param productId - Product UUID
 * @param product - Updated product data
 * @param etag - ETag from GET request for optimistic concurrency control
 * @returns Updated product or error response
 */
export async function updateProduct(
  productId: string,
  product: ProductCreate,
  etag: string
): Promise<Product> {
  const response = await fetch(`${BASE_URL}/api/products/${productId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'If-Match': etag,
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update product');
  }

  return response.json();
}
