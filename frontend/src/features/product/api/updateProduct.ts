import { BASE_URL } from '@f/fe/constants';
import type {
  Product,
  ProductCreate,
} from '@f/types/api-schemas';

/**
 * Updates an existing product
 * @param productId - Product UUID
 * @param product - Updated product data
 * @returns Updated product or error response
 */
export async function updateProduct(
  productId: string,
  product: ProductCreate
): Promise<Product> {
  const response = await fetch(`${BASE_URL}/api/products/${productId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update product');
  }

  return response.json();
}
