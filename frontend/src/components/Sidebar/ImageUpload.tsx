import { Text } from '@radix-ui/themes';
import { Upload, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

interface ImageUploadProps {
  /**
   * Callback when image is selected and ready to upload
   * Returns the file and a callback to clear the selection
   */
  onImageSelected: (file: File, clear: () => void) => void;
  /**
   * Optional storage key after successful upload to presigned URL
   */
  storageKey?: string | null;
  /**
   * Loading state during upload
   */
  isUploading?: boolean;
  /**
   * Error message to display
   */
  error?: string | null;
  setError: (error: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FORMATS = ['image/png', 'image/jpeg', 'image/webp'];

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelected,
  storageKey,
  isUploading = false,
  setError,
  error,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearSelection = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      setError('Invalid file format. Please upload PNG, JPG, or WEBP.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size too large. Maximum size is 10MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notify parent
    onImageSelected(file, clearSelection);
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor="cover-image"
        className="block text-sm font-semibold text-gray-700 "
      >
        Cover Image <span className="text-red-500 text-xs">*</span>{' '}
        {storageKey && '(Uploaded)'}
      </label>

      <div
        className="relative border-2 border-dashed border-gray-300  rounded-2xl p-8 hover:border-indigo-400  hover:bg-indigo-50/50  transition-all cursor-pointer group"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {isUploading && (
          <div className="absolute inset-0 bg-white/90  rounded-2xl flex items-center justify-center z-10">
            <div className="text-center space-y-2">
              <Loader2
                size={40}
                className="text-indigo-600  animate-spin mx-auto"
              />
              <Text
                size="2"
                className="font-semibold text-gray-700 "
              >
                Uploading...
              </Text>
            </div>
          </div>
        )}

        {imagePreview ? (
          <div className="relative aspect-square w-full max-w-xs mx-auto">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover rounded-xl shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
              <div className="text-center space-y-2">
                <Upload
                  size={32}
                  className="text-white mx-auto"
                  aria-hidden="true"
                />
                <Text size="2" className="text-white font-semibold">
                  Click to change
                </Text>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
            <div className="p-4 bg-indigo-100  rounded-full group-hover:scale-110 transition-transform">
              <Upload
                size={40}
                className="text-indigo-600 "
                aria-hidden="true"
              />
            </div>
            <div className="space-y-1">
              <Text
                as="p"
                size="3"
                className="font-semibold text-gray-700 "
              >
                Click to upload cover image
              </Text>
              <Text size="2" className="text-gray-500 ">
                PNG, JPG, WEBP up to 10MB
              </Text>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          id="cover-image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
          aria-describedby="cover-image-description"
          disabled={isUploading}
        />
      </div>

      {error && (
        <Text size="1" className="text-red-500 ">
          {error}
        </Text>
      )}

      {!error && (
        <Text
          id="cover-image-description"
          size="1"
          className="text-gray-500 "
        >
          Upload cover image for the product
        </Text>
      )}
    </div>
  );
};
