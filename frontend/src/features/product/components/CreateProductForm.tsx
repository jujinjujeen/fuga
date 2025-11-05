import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProductForm } from '../hooks/useProductForm';
import { createProduct } from '../api/createProduct';
import { ProductForm } from './common/ProductForm';
import { productQueryKeys } from '@f/fe/features/products/queryKeys';

interface CreateProductFormProps {
  onClose?: () => void;
}

export const CreateProductForm = ({ onClose }: CreateProductFormProps) => {
  const form = useProductForm();
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const onSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await createProduct({
        ...values,
      });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
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
