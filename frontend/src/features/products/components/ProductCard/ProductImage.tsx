import type { ProductResponse } from '@f/types/api-schemas';
import { Music } from 'lucide-react';

interface IProductImage {
  image: ProductResponse['image'];
  title: string;
}

export const ProductImage: React.FC<IProductImage> = ({ image, title }) => {
  return (
    <div className="relative aspect-square overflow-hidden bg-gray-100">
      {image?.url ? (
        <img
          src={image.url}
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Music
            size={48}
            className="text-gray-400 opacity-40"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};
