import type { ProductResponse } from '@f/types/api-schemas';
import { Music } from 'lucide-react';

interface IProductImage {
  image: ProductResponse['image'];
  title: string;
}

export const ProductImage: React.FC<IProductImage> = ({ image, title }) => {
  return (
    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100  ">
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
            className="text-indigo-400  opacity-50"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};
