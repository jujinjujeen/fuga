import { Card } from '@radix-ui/themes';
import type { Product } from '@f/types/api-schemas';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard - Displays a single product in a card layout
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { title, artist, image } = product;

  return (
    <Card variant='surface' className="group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer bg-white dark:bg-gray-800">
      {/* Album Cover */}
      <ProductImage image={image} title={title} />

      {/* Product Info */}
      <div className="p-4 space-y-1">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-lg">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {artist}
        </p>
      </div>
    </Card>
  );
};
