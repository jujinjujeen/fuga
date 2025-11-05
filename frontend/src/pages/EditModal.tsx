import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ProductSidebar } from '../features/product/components/ProductSidebar';
import { getProduct } from '../features/product/api/getProduct';
import type { Product } from '@f/types/api-schemas';

export const EditModal = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      navigate('/');
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const fetchedProduct = await getProduct(productId);
        setProduct(fetchedProduct);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const handleClose = () => {
    navigate('/');
  };

  if (loading) {
    return null;
  }

  if (error || !product) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-md">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
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
