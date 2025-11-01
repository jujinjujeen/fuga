import { Button } from '@radix-ui/themes';
import { Plus } from 'lucide-react';

type AddButtonProps = {
  onAdd: () => void;
};

export const AddButton: React.FC<AddButtonProps> = ({ onAdd }) => {
  return (
    <Button
      onClick={onAdd}
      size={{ initial: '3', sm: '3' }}
      variant="solid"
      highContrast
      className="shrink-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      aria-label="Add new product"
    >
      <Plus size={20} aria-hidden="true" />
      <span className="hidden sm:inline font-medium">Add Product</span>
    </Button>
  );
};
