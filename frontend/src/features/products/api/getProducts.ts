import { BASE_URL } from '@f/fe/constants';
import type { ProductsResponse, ErrorResponse } from '@f/types/api-schemas';

/**
 * Fetches all products
 * @returns List of products or error response
 */
export async function getProducts(): Promise<ProductsResponse | ErrorResponse> {
  const response = await fetch(`${BASE_URL}/api/products`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch products');
  }

  return response.json();
}
