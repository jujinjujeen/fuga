import { Card } from '@radix-ui/themes';
import type { Product } from '@f/types/api-schemas';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

/**
 * ProductCard - Displays a single product in a card layout
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
}) => {
  const { title, artist, image } = product;

  const handleClick = () => {
    onClick?.(product);
  };

  return (
    <Card
      variant="surface"
      className="group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer bg-white "
      onClick={handleClick}
    >
      {/* Album Cover */}
      <ProductImage image={image} title={title} />

      {/* Product Info */}
      <div className="p-4 space-y-1">
        <h3 className="font-semibold text-gray-900  truncate text-lg">
          {title}
        </h3>
        <p className="text-sm text-gray-600 truncate">{artist}</p>
      </div>
    </Card>
  );
};
