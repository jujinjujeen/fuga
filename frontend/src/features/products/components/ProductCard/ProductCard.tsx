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
      className="group relative overflow-hidden rounded-lg bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
      onClick={handleClick}
    >
      <ProductImage image={image} title={title} />

      {/* Product Info */}
      <div className="p-4 space-y-1.5">
        <h3 className="font-semibold text-gray-900 truncate text-sm leading-tight">
          {title}
        </h3>
        <p className="text-xs text-gray-500 truncate font-medium">{artist}</p>
      </div>
    </Card>
  );
};
