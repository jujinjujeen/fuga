import { useState } from 'react';
import { useProductForm } from '../hooks/useProductForm';
import { createProduct } from '../api/createProduct';
import { ProductForm } from './common/ProductForm';

export const CreateProductForm = () => {
  const form = useProductForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await createProduct({
        ...values,
      });
      form.reset();
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
