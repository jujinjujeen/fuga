import { useState } from 'react';
import { useProductForm } from '../hooks/useProductForm';
import { updateProduct } from '../api/updateProduct';
import { ProductForm } from './common/ProductForm';
import type { Product } from '@f/types/api-schemas';

interface EditProductFormProps {
  product: Product;
  onClose?: () => void;
}

export const EditProductForm = ({
  product,
  onClose,
}: EditProductFormProps) => {
  const form = useProductForm(product);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await updateProduct(product.id, values);
      onClose?.();
    } catch (error) {
      console.error('Failed to update product:', error);
      // Error handling can be improved with toast notifications
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProductForm
      form={form}
      initialPreviewUrl={product.image?.url}
      onSubmit={onSubmit}
      mode="edit"
      submitting={submitting}
    />
  );
};
