import { useEffect, useState } from 'react';
import { ProductCard } from '../ProductCard';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { ErrorMessage } from '../UI/ErrorMessage';
import { EmptyState } from '../UI/EmptyState';
import { getProducts } from '../../api/products';
import type { Product } from '@f/types/api-schemas';

interface ProductListProps {
  refreshTrigger?: number;
}

/**
 * ProductList - Grid layout of product cards
 */
export const ProductList: React.FC<ProductListProps> = ({
  refreshTrigger = 0,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getProducts();

        // Check if response is an error
        if ('title' in response) {
          throw new Error(response.message || 'Failed to fetch products');
        }

        setProducts(response.products);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load products'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ErrorMessage error={error} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState message="No products found. Add your first product to get started!" />
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 animate-fade-in"
      role="list"
      aria-label="Products"
    >
      {products.map((product) => (
        <div key={product.id} role="listitem">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};
