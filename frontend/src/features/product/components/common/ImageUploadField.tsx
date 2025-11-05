import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '../../types';
import { useImageUpload } from '../../hooks/useImageUpload';
import { Button } from '@radix-ui/themes';
import { useRef } from 'react';
import { ImageIcon, Upload } from 'lucide-react';

type Props = {
  form: UseFormReturn<ProductFormValues>;
  name?: keyof ProductFormValues; // default imageKey
  label?: string;
};

export const ImageUploadField: React.FC<Props> = ({
  form,
  name = 'imageKey',
  label = 'Product Image',
}) => {
  const { status, error, previewUrl, upload } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const key = await upload(file);
    if (key) {
      debugger;
      form.setValue(name, key, { shouldDirty: true, shouldValidate: true });
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900" htmlFor={name}>
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>

      <div className="relative">
        {previewUrl ? (
          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 group">
            <img
              src={previewUrl}
              alt="Product preview"
              className="m-auto h-full object-cover"
            />
            <div className="absolute inset-0 opacity-0 bg-black/20 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="classic"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Image
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={status === 'uploading' || status === 'presigning'}
            className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'uploading' ? (
              <>
                <div className="animate-spin text-2xl">⏳</div>
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8" />
                <span className="text-sm font-medium">
                  Click to upload image
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG or WEBP (max 10MB)
                </span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          id={name}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleSelect}
          className="hidden"
          aria-label="Upload product image"
        />
      </div>
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <ImageIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};
