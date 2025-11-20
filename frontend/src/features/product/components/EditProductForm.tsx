import { useProductForm } from '../hooks/useProductForm';
import { useUpdateProduct, useDeleteProduct } from '../hooks/useProductMutations';
import { ProductForm } from './common/ProductForm';
import type { Product } from '@f/types/api-schemas';
import type { ProductFormValues } from '../types';

interface EditProductFormProps {
  product: Product;
  onClose?: () => void;
}

export const EditProductForm = ({
  product,
  onClose,
}: EditProductFormProps) => {
  const form = useProductForm(product);
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const onSubmit = async (values: ProductFormValues) => {
    updateProductMutation.mutate(
      { id: product.id, product: values },
      {
        onSuccess: () => {
          onClose?.();
        },
        onError: (error) => {
          console.error('Failed to update product:', error);
          // Error handling can be improved with toast notifications
        },
      }
    );
  };

  const onDelete = async () => {
    deleteProductMutation.mutate(product.id, {
      onSuccess: () => {
        onClose?.();
      },
      onError: (error) => {
        console.error('Failed to delete product:', error);
        // Error handling can be improved with toast notifications
      },
    });
  };

  return (
    <ProductForm
      form={form}
      initialPreviewUrl={product.image?.url}
      onSubmit={onSubmit}
      onDelete={onDelete}
      mode="edit"
      submitting={updateProductMutation.isPending}
      isDeleting={deleteProductMutation.isPending}
    />
  );
};
