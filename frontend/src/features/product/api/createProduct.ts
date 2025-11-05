import type {
  Product,
  ProductCreate,
} from '@f/types/api-schemas';
import { BASE_URL } from '@f/fe/constants';

/**
 * Creates a new product
 * @param product - Product data including title, artist, and imageKey
 * @returns Created product or error response
 */
export async function createProduct(
  product: ProductCreate
): Promise<Product> {
  const response = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create product');
  }

  return response.json();
}
