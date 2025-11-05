import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '../../types';
import { Button } from '@radix-ui/themes';
import { ProductField } from './ProductField';
import { ImageUploadField } from './ImageUploadField';

type ProductFormProps = {
  form: UseFormReturn<ProductFormValues>;
  initialPreviewUrl?: string;
  mode: 'create' | 'edit';
  submitting?: boolean;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
};

export const ProductForm = ({
  form,
  initialPreviewUrl,
  mode,
  submitting,
  onSubmit,
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
            <ImageUploadField
              form={form}
              initialPreviewUrl={initialPreviewUrl}
            />

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
