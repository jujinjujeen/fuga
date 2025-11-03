import { SidebarHeader } from './SidebarHeader';
import { ImageUpload } from './ImageUpload';
import { ProductFormFields } from './ProductFormFields';
import { SidebarFooter } from './SidebarFooter';
import type { Product } from '@f/types/api-schemas';
import { useProductForm } from '../../hooks/useProductForm';

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialData?: Product;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  mode,
  initialData,
  onSuccess,
  onClose,
}) => {
  const {
    title,
    artist,
    isSubmitting,
    errors,
    setTitle,
    setArtist,
    handleSubmit,
    handleReset,
    imageUpload,
    isFormValid,
  } = useProductForm({
    mode,
    initialData,
    onSuccess,
    onClose,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SidebarHeader
        title={mode === 'create' ? 'Add New Product' : 'Edit Product'}
        onClose={onClose || (() => {})}
      />

      {/* Form Content */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
      >
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <ImageUpload
          imagePreview={imageUpload.imagePreview}
          storageKey={imageUpload.storageKey}
          isUploading={imageUpload.isUploading}
          error={imageUpload.error}
          fileInputRef={imageUpload.fileInputRef}
          onFileChange={imageUpload.handleFileChange}
        />

        <ProductFormFields
          title={title}
          artist={artist}
          onTitleChange={setTitle}
          onArtistChange={setArtist}
          errors={errors}
        />
      </form>

      {/* Footer */}
      <SidebarFooter
        onReset={handleReset}
        onSubmit={handleSubmit}
        isSubmitDisabled={!isFormValid}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
