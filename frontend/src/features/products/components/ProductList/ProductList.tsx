import { ProductCard } from '../ProductCard';
import { LoadingSpinner } from '@f/fe/components/UI/LoadingSpinner';
import { ErrorMessage } from '@f/fe/components/UI/ErrorMessage';
import { EmptyState } from '@f/fe/components/UI/EmptyState';
import { useProducts } from '../../hooks/useProducts';
import type { Product } from '@f/types/api-schemas';

interface ProductListProps {
  search?: string;
  onProductClick?: (product: Product) => void;
}

/**
 * ProductList - Grid layout of product cards
 */
export const ProductList: React.FC<ProductListProps> = ({
  search,
  onProductClick,
}) => {
  const { products, isLoading, error } = useProducts(search);

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
        <EmptyState
          message={
            search
              ? `No products found for "${search}"`
              : 'No products found. Add your first product to get started!'
          }
        />
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
          <ProductCard product={product} onClick={onProductClick} />
        </div>
      ))}
    </div>
  );
};
