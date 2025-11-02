import { Card } from '@radix-ui/themes';
import { Music } from 'lucide-react';
import type { Product } from '@f/types/api-schemas';

interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard - Displays a single product in a card layout
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { title, artist, image } = product;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer bg-white dark:bg-gray-800">
      {/* Album Cover */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-700 dark:to-gray-900">
        {image?.url ? (
          <img
            src={image.url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music
              size={64}
              className="text-indigo-400 dark:text-indigo-600 opacity-50"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

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
