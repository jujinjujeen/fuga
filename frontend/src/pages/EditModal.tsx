import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ProductSidebar } from '../features/product/components/ProductSidebar';
import { useProduct } from '../features/product/hooks/useProduct';

export const EditModal = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const { data: product, isLoading, error } = useProduct(productId);

  useEffect(() => {
    if (!productId) {
      navigate('/');
    }
  }, [productId, navigate]);

  const handleClose = () => {
    navigate('/');
  };

  if (isLoading) {
    return null;
  }

  if (error || !product) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-md">
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'Product not found'}
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProductSidebar
      isOpen={true}
      onClose={handleClose}
      mode="edit"
      product={product}
    />
  );
};

export default EditModal;
