import type { SidebarProps } from '@f/fe/components/UI/Sidebar';
import { Sidebar } from '@f/fe/components/UI/Sidebar';
import { CreateProductForm } from './CreateProductForm';
import { EditProductForm } from './EditProductForm';
import { Package, X } from 'lucide-react';
import type { Product } from '@f/types/api-schemas';

type ProductSidebarProps = Omit<SidebarProps, 'children'> & {
  mode: 'create' | 'edit';
  product?: Product;
  onSuccess?: () => void;
};

export const ProductSidebar: React.FC<ProductSidebarProps> = ({
  isOpen,
  mode,
  product,
  onClose,
}) => {
  return (
    <Sidebar isOpen={isOpen} onClose={onClose}>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Create Product' : 'Edit Product'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'create' ? (
          <CreateProductForm onClose={onClose} />
        ) : product ? (
          <EditProductForm product={product} onClose={onClose} />
        ) : null}
      </div>
    </Sidebar>
  );
};
