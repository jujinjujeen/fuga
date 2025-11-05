import { BASE_URL } from '@f/fe/constants';
import type { ProductsResponse, ErrorResponse } from '@f/types/api-schemas';

/**
 * Fetches all products with optional search
 * @param search - Optional search query to filter by title or artist
 * @returns List of products or error response
 */
export async function getProducts(
  search?: string
): Promise<ProductsResponse | ErrorResponse> {
  let url = `${BASE_URL}/api/products`;
  if (search) {
    const params = new URLSearchParams({ q: search });
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch products');
  }

  return response.json();
}
