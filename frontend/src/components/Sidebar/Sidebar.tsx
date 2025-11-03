import classNames from 'classnames';
import { useEffect } from 'react';
import { SidebarHeader } from './SidebarHeader';
import { ProductForm } from './ProductForm';
import type { Product } from '@f/types/api-schemas';

interface ISidebar {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated?: () => void;
  mode?: 'create' | 'edit';
  initialData?: Product;
}

export const Sidebar: React.FC<ISidebar> = ({
  isOpen,
  onClose,
  onProductCreated,
  mode = 'create',
  initialData,
}) => {

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={classNames([
          'fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md z-40 transition-all duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ])}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Sidebar */}
      <aside
        className={classNames([
          'fixed top-0 right-0 h-full w-full sm:w-[420px] md:w-[500px] bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out',
          isOpen ? 'translate-x-0 scale-100' : 'translate-x-full scale-95',
        ])}
        aria-label="Add product form"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full">
          <SidebarHeader
            title={mode === 'create' ? 'Add New Product' : 'Edit Product'}
            onClose={onClose}
          />

          <ProductForm
            mode={mode}
            initialData={initialData}
            onSuccess={onProductCreated}
            onClose={onClose}
          />
        </div>
      </aside>
    </>
  );
};
