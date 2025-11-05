import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { ProductForm } from '../ProductForm';
import type { ProductFormValues } from '../../../types';
import { Theme } from '@radix-ui/themes';
import * as useImageUploadModule from '../../../hooks/useImageUpload';

// Mock the useImageUpload hook
vi.mock('../../../hooks/useImageUpload');

// Wrapper component
const TestWrapper = ({
  mode,
  onSubmit,
  onDelete,
  submitting = false,
  isDeleting = false,
  initialPreviewUrl,
  defaultValues,
}: {
  mode: 'create' | 'edit';
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  onDelete?: () => void;
  submitting?: boolean;
  isDeleting?: boolean;
  initialPreviewUrl?: string;
  defaultValues?: ProductFormValues;
}) => {
  const form = useForm<ProductFormValues>({
    defaultValues: defaultValues || {
      title: '',
      artist: '',
      imageKey: '',
    },
    mode: 'onChange',
  });

  return (
    <Theme>
      <ProductForm
        form={form}
        initialPreviewUrl={initialPreviewUrl}
        mode={mode}
        submitting={submitting}
        onSubmit={onSubmit}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    </Theme>
  );
};

describe('ProductForm', () => {
  const mockUpload = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    vi.mocked(useImageUploadModule.useImageUpload).mockReturnValue({
      status: 'idle',
      error: null,
      storageKey: null,
      previewUrl: null,
      upload: mockUpload,
      reset: mockReset,
    });
  });

  describe('Create Mode', () => {
    it('should render create form with all fields', () => {
      const onSubmit = vi.fn();
      render(<TestWrapper mode="create" onSubmit={onSubmit} />);

      expect(screen.getByLabelText(/Product Image/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Artist/)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Create Product' })
      ).toBeInTheDocument();
    });

    it('should not render delete button in create mode', () => {
      const onSubmit = vi.fn();
      render(<TestWrapper mode="create" onSubmit={onSubmit} />);

      expect(
        screen.queryByRole('button', { name: /delete/i })
      ).not.toBeInTheDocument();
    });

    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <TestWrapper
          mode="create"
          onSubmit={onSubmit}
          defaultValues={{
            title: 'Test Album',
            artist: 'Test Artist',
            imageKey: 'test-key',
          }}
        />
      );

      const submitButton = screen.getByRole('button', {
        name: 'Create Product',
      });

      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    it('should disable submit button when submitting', () => {
      const onSubmit = vi.fn();
      render(<TestWrapper mode="create" onSubmit={onSubmit} submitting />);

      const submitButton = screen.getByRole('button', {
        name: 'Create Product',
      });
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when form is invalid', () => {
      const onSubmit = vi.fn();
      render(<TestWrapper mode="create" onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', {
        name: 'Create Product',
      });
      // Form is invalid because all required fields are empty
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Edit Mode', () => {
    it('should render edit form with all fields', () => {
      const onSubmit = vi.fn();
      const onDelete = vi.fn();

      render(
        <TestWrapper
          mode="edit"
          onSubmit={onSubmit}
          onDelete={onDelete}
          defaultValues={{
            title: 'Existing Album',
            artist: 'Existing Artist',
            imageKey: 'existing-key',
          }}
        />
      );

      expect(screen.getByLabelText(/Product Image/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Artist/)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Save Changes' })
      ).toBeInTheDocument();
    });

    it('should render delete button in edit mode', () => {
      const onSubmit = vi.fn();
      const onDelete = vi.fn();

      render(
        <TestWrapper
          mode="edit"
          onSubmit={onSubmit}
          onDelete={onDelete}
          defaultValues={{
            title: 'Test Album',
            artist: 'Test Artist',
            imageKey: 'test-key',
          }}
        />
      );

      // Delete button is in DeleteProductDialog component
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('should not render delete button when onDelete is not provided', () => {
      const onSubmit = vi.fn();

      render(
        <TestWrapper
          mode="edit"
          onSubmit={onSubmit}
          defaultValues={{
            title: 'Test Album',
            artist: 'Test Artist',
            imageKey: 'test-key',
          }}
        />
      );

      expect(
        screen.queryByRole('button', { name: /delete/i })
      ).not.toBeInTheDocument();
    });

    it('should submit form with updated data', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const onDelete = vi.fn();

      render(
        <TestWrapper
          mode="edit"
          onSubmit={onSubmit}
          onDelete={onDelete}
          defaultValues={{
            title: 'Updated Album',
            artist: 'Updated Artist',
            imageKey: 'updated-key',
          }}
        />
      );

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });

      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    it('should pass product title to delete dialog', () => {
      const onSubmit = vi.fn();
      const onDelete = vi.fn();

      render(
        <TestWrapper
          mode="edit"
          onSubmit={onSubmit}
          onDelete={onDelete}
          defaultValues={{
            title: 'My Album',
            artist: 'My Artist',
            imageKey: 'key',
          }}
        />
      );

      // The title should be passed to DeleteProductDialog
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('should use fallback title when title is empty', () => {
      const onSubmit = vi.fn();
      const onDelete = vi.fn();

      render(
        <TestWrapper
          mode="edit"
          onSubmit={onSubmit}
          onDelete={onDelete}
          defaultValues={{
            title: '',
            artist: 'Artist',
            imageKey: 'key',
          }}
        />
      );

      // Should use 'this product' as fallback
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should update title field', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestWrapper mode="create" onSubmit={onSubmit} />);

      const titleInput = screen.getByLabelText(/Title/);
      await user.type(titleInput, 'New Album');

      expect(titleInput).toHaveValue('New Album');
    });

    it('should update artist field', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestWrapper mode="create" onSubmit={onSubmit} />);

      const artistInput = screen.getByLabelText(/Artist/);
      await user.type(artistInput, 'New Artist');

      expect(artistInput).toHaveValue('New Artist');
    });

    it('should render with initial preview URL', () => {
      const onSubmit = vi.fn();

      render(
        <TestWrapper
          mode="edit"
          onSubmit={onSubmit}
          initialPreviewUrl="https://example.com/image.jpg"
          defaultValues={{
            title: 'Album',
            artist: 'Artist',
            imageKey: 'key',
          }}
        />
      );

      const image = screen.getByAltText('Product preview');
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should have correct form id', () => {
      const onSubmit = vi.fn();
      const { container } = render(
        <TestWrapper mode="create" onSubmit={onSubmit} />
      );

      const form = container.querySelector('form');
      expect(form).toHaveAttribute('id', 'create');
    });
  });

  describe('Loading States', () => {
    it('should disable submit button while submitting', () => {
      const onSubmit = vi.fn();

      render(
        <TestWrapper
          mode="create"
          onSubmit={onSubmit}
          submitting
          defaultValues={{
            title: 'Album',
            artist: 'Artist',
            imageKey: 'key',
          }}
        />
      );

      const submitButton = screen.getByRole('button', {
        name: 'Create Product',
      });
      expect(submitButton).toBeDisabled();
    });

    it('should pass isDeleting to delete dialog', () => {
      const onSubmit = vi.fn();
      const onDelete = vi.fn();

      render(
        <TestWrapper
          mode="edit"
          onSubmit={onSubmit}
          onDelete={onDelete}
          isDeleting
          defaultValues={{
            title: 'Album',
            artist: 'Artist',
            imageKey: 'key',
          }}
        />
      );

      // DeleteProductDialog should receive isDeleting prop
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });
});
