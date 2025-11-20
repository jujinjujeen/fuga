import { useProductForm } from '../hooks/useProductForm';
import { useCreateProduct } from '../hooks/useProductMutations';
import { ProductForm } from './common/ProductForm';
import type { ProductFormValues } from '../types';

interface CreateProductFormProps {
  onClose?: () => void;
}

export const CreateProductForm = ({ onClose }: CreateProductFormProps) => {
  const form = useProductForm();
  const createProductMutation = useCreateProduct();

  const onSubmit = async (values: ProductFormValues) => {
    createProductMutation.mutate(values, {
      onSuccess: () => {
        form.reset();
        onClose?.();
      },
      onError: (error) => {
        console.error('Failed to create product:', error);
        // Error handling can be improved with toast notifications
      },
    });
  };

  return (
    <ProductForm
      form={form}
      onSubmit={onSubmit}
      mode="create"
      submitting={createProductMutation.isPending}
    />
  );
};
