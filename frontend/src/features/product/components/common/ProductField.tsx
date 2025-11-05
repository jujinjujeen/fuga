import { TextField } from '@radix-ui/themes';
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '../../types';

interface ProductFieldProps {
  id: 'title' | 'artist';
  placeholder?: string;
  label: string;
  form: UseFormReturn<ProductFormValues>;
}

export const ProductField: React.FC<ProductFieldProps> = ({
  id,
  placeholder,
  label,
  form,
}) => {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-900">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      <TextField.Root
        id={id}
        {...register(id)}
        placeholder={placeholder}
        className={errors.title ? 'border-red-500' : ''}
      />
      {errors[id] && (
        <p className="text-sm text-red-600">{errors[id].message}</p>
      )}
    </div>
  );
};
