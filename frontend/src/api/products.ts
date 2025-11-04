import type {
  ProductCreate,
  Product,
  ErrorResponse,
  ProductsResponse,
} from '@f/types/api-schemas';
const BASE_URL = import.meta.env.VITE_BASE_URL || '';

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

/**
 * Gets a single product by ID
 * @param productId - Product UUID
 * @returns Product or error response
 */
export async function getProduct(
  productId: string
): Promise<Product | ErrorResponse> {
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

/**
 * Creates a new product
 * @param product - Product data including title, artist, and imageKey
 * @returns Created product or error response
 */
export async function createProduct(
  product: ProductCreate
): Promise<Product | ErrorResponse> {
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
