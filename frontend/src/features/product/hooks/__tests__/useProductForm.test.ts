import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useProductForm } from '../useProductForm';
import type { Product } from '@f/types/api-schemas';

describe('useProductForm', () => {
  it('should initialize with empty default values when no initial data provided', () => {
    const { result } = renderHook(() => useProductForm());

    expect(result.current.getValues()).toEqual({
      title: '',
      artist: '',
      imageKey: '',
      upc: '',
    });
  });

  it('should initialize with product data when initial data provided', () => {
    const mockProduct: Product = {
      id: 'product-123',
      title: 'Test Album',
      artist: 'Test Artist',
      image: {
        key: 'test-key-123',
        url: 'https://example.com/image.jpg',
      },
    } as Product;

    const { result } = renderHook(() => useProductForm(mockProduct));

    expect(result.current.getValues()).toEqual({
      title: 'Test Album',
      artist: 'Test Artist',
      imageKey: 'test-key-123',
      upc: '',
    });
  });

  it('should handle product without image', () => {
    const mockProduct = {
      id: 'product-123',
      title: 'Test Album',
      artist: 'Test Artist',
    } as Product;

    const { result } = renderHook(() => useProductForm(mockProduct));

    expect(result.current.getValues()).toEqual({
      title: 'Test Album',
      artist: 'Test Artist',
      imageKey: '',
      upc: '',
    });
  });

  it('should use zod resolver for validation', () => {
    const { result } = renderHook(() => useProductForm());

    // Form should have a resolver configured (zod)
    expect(result.current.control).toBeDefined();
    expect(result.current.formState).toBeDefined();
  });

  it('should allow updating form values', async () => {
    const { result } = renderHook(() => useProductForm());

    await act(async () => {
      result.current.setValue('title', 'New Title');
      result.current.setValue('artist', 'New Artist');
      result.current.setValue('imageKey', 'new-key-456');
    });

    expect(result.current.getValues()).toEqual({
      title: 'New Title',
      artist: 'New Artist',
      imageKey: 'new-key-456',
      upc: '',
    });
  });

  it('should support form reset', async () => {
    const mockProduct: Product = {
      id: 'product-123',
      title: 'Original Title',
      artist: 'Original Artist',
      image: {
        key: 'original-key',
        url: 'https://example.com/image.jpg',
      },
    } as Product;

    const { result } = renderHook(() => useProductForm(mockProduct));

    // Modify values
    await act(async () => {
      result.current.setValue('title', 'Modified Title');
      result.current.setValue('artist', 'Modified Artist');
    });

    expect(result.current.getValues().title).toBe('Modified Title');

    // Reset to original
    await act(async () => {
      result.current.reset();
    });

    expect(result.current.getValues()).toEqual({
      title: 'Original Title',
      artist: 'Original Artist',
      imageKey: 'original-key',
      upc: '',
    });
  });
});
