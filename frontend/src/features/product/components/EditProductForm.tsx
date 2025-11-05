import { useState } from 'react';
import { useProductForm } from '../hooks/useProductForm';
import { updateProduct } from '../api/updateProduct';
import { deleteProduct } from '../api/deleteProduct';
import { ProductForm } from './common/ProductForm';
import type { Product } from '@f/types/api-schemas';
// import { useQueryClient } from '@tanstack/react-query';

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
  const [isDeleting, setIsDeleting] = useState(false);
  // const queryClient = useQueryClient();

  const onSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await updateProduct(product.id, values);
      // queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose?.();
    } catch (error) {
      console.error('Failed to update product:', error);
      // Error handling can be improved with toast notifications
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      // queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose?.();
    } catch (error) {
      console.error('Failed to delete product:', error);
      // Error handling can be improved with toast notifications
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProductForm
      form={form}
      initialPreviewUrl={product.image?.url}
      onSubmit={onSubmit}
      onDelete={onDelete}
      mode="edit"
      submitting={submitting}
      isDeleting={isDeleting}
    />
  );
};
