import { TextField } from '@radix-ui/themes';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const clearSearch = () => {
    onChange('');
  };

  return (
    <TextField.Root
      placeholder="Search products..."
      id="search"
      variant="soft"
      size={{ initial: '3', sm: '3' }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 min-w-0 shadow-md focus-within:shadow-lg transition-shadow"
      aria-label="Search products"
    >
      <TextField.Slot>
        <Search size={18} className="text-slate-500" aria-hidden="true" />
      </TextField.Slot>
      {value && (
        <TextField.Slot>
          <button
            onClick={clearSearch}
            className="hover:opacity-70 hover:scale-110 transition-all rounded-full p-1"
            aria-label="Clear search"
            type="button"
          >
            <X size={18} className="text-slate-500" aria-hidden="true" />
          </button>
        </TextField.Slot>
      )}
    </TextField.Root>
  );
};
