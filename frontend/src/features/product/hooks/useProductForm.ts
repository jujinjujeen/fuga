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
  imageKey: z.string().min(1, 'Image is required'),
});

export function useProductForm(initial?: Product) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          title: initial.title,
          artist: initial.artist,
          imageKey: initial.image?.url,
        }
      : {
          title: '',
          artist: '',
          imageKey: '',
        },
  });

  return form;
}
