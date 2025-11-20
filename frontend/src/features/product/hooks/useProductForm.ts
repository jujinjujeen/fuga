import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ProductFormValues } from '../types';
import type { Product } from '@f/types/api-schemas';

const schema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters'),
  artist: z
    .string()
    .min(1, 'Artist is required')
    .max(100, 'Artist must be at most 100 characters'),
  upc: z
    .string()
    .length(12, 'UPC id should be exactly 12 symbols')
    .regex(/^\d+$/, 'UPC id should be only numerical'),
  imageKey: z.string().min(1, 'Image is required'),
});

export function useProductForm(initial?: Product) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: initial
      ? {
          title: initial.title,
          artist: initial.artist,
          imageKey: initial.image?.key || '',
          upc: initial.upc || '',
        }
      : {
          title: '',
          artist: '',
          imageKey: '',
          upc: '',
        },
  });

  return form;
}
