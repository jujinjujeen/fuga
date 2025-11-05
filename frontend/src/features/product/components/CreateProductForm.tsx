import { useState } from 'react';
import { useProductForm } from '../hooks/useProductForm';
import { createProduct } from '../api/createProduct';
import { ProductForm } from './common/ProductForm';

interface CreateProductFormProps {
  onClose?: () => void;
}

export const CreateProductForm = ({ onClose }: CreateProductFormProps) => {
  const form = useProductForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await createProduct({
        ...values,
      });
      form.reset();
      onClose?.();
    } catch (error) {
      console.error('Failed to create product:', error);
      // Error handling can be improved with toast notifications
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProductForm
      form={form}
      onSubmit={onSubmit}
      mode="create"
      submitting={submitting}
    />
  );
};
