import { TextField } from '@radix-ui/themes';

interface ProductFormFieldsProps {
  title: string;
  artist: string;
  errors?: Record<string, string>;
  onTitleChange: (value: string) => void;
  onArtistChange: (value: string) => void;
}

export const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  title,
  artist,
  onTitleChange,
  onArtistChange,
}) => {
  return (
    <>
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
          onChange={(e) => onTitleChange(e.target.value)}
          size="3"
          variant="soft"
          maxLength={255}
          required
          aria-required="true"
          className="shadow-sm focus-within:shadow-md transition-shadow"
        />
      </div>

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
          onChange={(e) => onArtistChange(e.target.value)}
          size="3"
          variant="soft"
          required
          maxLength={255}
          aria-required="true"
          className="shadow-sm focus-within:shadow-md transition-shadow"
        />
      </div>
    </>
  );
};
