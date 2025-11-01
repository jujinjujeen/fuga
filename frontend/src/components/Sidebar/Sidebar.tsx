import classNames from 'classnames';
import { useState, useEffect } from 'react';
import { SidebarHeader } from './SidebarHeader';
import { ImageUpload } from './ImageUpload';
import { ProductFormFields } from './ProductFormFields';
import { SidebarFooter } from './SidebarFooter';
import { getPresignedUrl, uploadFileToPresignedUrl } from '../../api/upload';

interface ISidebar {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<ISidebar> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageSelected = async (file: File, clear: () => void) => {
    setIsUploading(true);
    setErrors({ ...errors, image: '' });

    try {
      // Get presigned URL from backend
      const response = await getPresignedUrl(file.name, file.type, file.size);

      // Check if response is an error
      if ('title' in response) {
        throw new Error(response.message || 'Failed to get presigned URL');
      }

      // Upload file directly to S3/MinIO using presigned URL
      await uploadFileToPresignedUrl(response.url, file);

      // Store storage key for form submission
      setImageKey(response.storageKey);
    } catch (err) {
      setErrors({
        ...errors,
        image: err instanceof Error ? err.message : 'Upload failed',
      });
      clear(); // Clear selection on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit form to backend
    console.log({ title, artist, imageKey });
  };

  const handleReset = () => {
    setTitle('');
    setArtist('');
    setImageKey(null);
    setErrors({ ...errors, image: '' });
  };

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={classNames([
          'fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md z-40 transition-all duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ])}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Sidebar */}
      <aside
        className={classNames([
          'fixed top-0 right-0 h-full w-full sm:w-[420px] md:w-[500px] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-all duration-300 ease-out',
          isOpen ? 'translate-x-0 scale-100' : 'translate-x-full scale-95',
        ])}
        aria-label="Add product form"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full">
          <SidebarHeader title="Add New Product" onClose={onClose} />

          {/* Form Content */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
          >
            <ImageUpload
              onImageSelected={handleImageSelected}
              storageKey={imageKey}
              isUploading={isUploading}
              setError={(err: string) => setErrors({ ...errors, image: err })}
              error={errors.image}
            />

            <ProductFormFields
              title={title}
              artist={artist}
              onTitleChange={setTitle}
              onArtistChange={setArtist}
              errors={errors}
            />
          </form>

          <SidebarFooter
            onReset={handleReset}
            onSubmit={handleSubmit}
            isSubmitDisabled={!title || !artist || !imageKey || isUploading}
          />
        </div>
      </aside>
    </>
  );
};
