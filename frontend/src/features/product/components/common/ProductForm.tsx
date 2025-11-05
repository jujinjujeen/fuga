import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '../../types';
import { Button } from '@radix-ui/themes';
import { ProductField } from './ProductField';
import { ImageUploadField } from './ImageUploadField';

type ProductFormProps = {
  form: UseFormReturn<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  mode: 'create' | 'edit';
  submitting?: boolean;
};

export const ProductForm = ({
  form,
  onSubmit,
  mode,
  submitting,
}: ProductFormProps) => {
  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  return (
    <div className="flex-1">
      <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-6">
        <form
          id="create"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 space-y-6"
        >
          <div className="flex-col flex-1 space-y-6">
            <ImageUploadField form={form} />

            <ProductField
              id="title"
              label="Title"
              placeholder="Enter product title"
              form={form}
            />
            <ProductField
              id="artist"
              label="Artist"
              placeholder="Enter artist name"
              form={form}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {mode === 'edit' && (
              <Button variant="outline" type="button" onClick={() => {}}>
                Delete
              </Button>
            )}
            <Button
              type="submit"
              disabled={submitting || !isValid}
              className="flex-1"
            >
              {mode === 'create' ? 'Create Product' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
