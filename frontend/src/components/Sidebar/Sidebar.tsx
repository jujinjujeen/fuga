import { Button, Heading, Text, TextField } from '@radix-ui/themes';
import classNames from 'classnames';
import { X, Upload, Music } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface ISidebar {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<ISidebar> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log({ title, artist, imageFile });
  };

  const handleReset = () => {
    setTitle('');
    setArtist('');
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Music
                  size={24}
                  className="text-indigo-600 dark:text-indigo-400"
                  aria-hidden="true"
                />
              </div>
              <Heading
                size="5"
                as="h2"
                className="font-semibold text-gray-700 dark:text-gray-300"
              >
                Add New Product
              </Heading>
            </div>
            <Button
              variant="ghost"
              color="gray"
              onClick={onClose}
              size="2"
              className="shrink-0 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-all"
              aria-label="Close sidebar"
            >
              <X size={20} aria-hidden="true" color="white" />
            </Button>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
          >
            {/* Image Upload */}
            <div className="space-y-3">
              <label
                htmlFor="cover-image"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Cover Image
              </label>
              <div
                className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
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
                    <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full group-hover:scale-110 transition-transform">
                      <Upload
                        size={40}
                        className="text-indigo-600 dark:text-indigo-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="space-y-1">
                      <Text
                        as="p"
                        size="3"
                        className="font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Click to upload cover image
                      </Text>
                      <Text
                        size="2"
                        className="text-gray-500 dark:text-gray-400"
                      >
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
                  onChange={handleImageChange}
                  className="hidden"
                  aria-describedby="cover-image-description"
                />
              </div>
              <Text
                id="cover-image-description"
                size="1"
                className="text-gray-500 dark:text-gray-400"
              >
                Upload cover image for the product
              </Text>
            </div>

            {/* Title Input */}
            <div className="space-y-3">
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Title <span className="text-red-500 text-xs">*</span>
              </label>
              <TextField.Root
                id="title"
                placeholder="Enter product title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="3"
                variant="soft"
                required
                aria-required="true"
                className="shadow-sm focus-within:shadow-md transition-shadow"
              />
            </div>

            {/* Artist Input */}
            <div className="space-y-3">
              <label
                htmlFor="artist"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Artist <span className="text-red-500 text-xs">*</span>
              </label>
              <TextField.Root
                id="artist"
                placeholder="Enter artist name"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                size="3"
                variant="soft"
                required
                aria-required="true"
                className="shadow-sm focus-within:shadow-md transition-shadow"
              />
            </div>
          </form>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 sm:p-6 flex gap-3 bg-gray-50 dark:bg-gray-900/50">
            <Button
              type="button"
              variant="soft"
              color="gray"
              onClick={handleReset}
              className="flex-1 transition-all hover:scale-105"
              size="3"
            >
              Reset
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              size="3"
              highContrast
              disabled={!title || !artist}
            >
              Create Product
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
