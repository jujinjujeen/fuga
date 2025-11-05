import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { EditProductForm } from '../components/EditProductForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Theme } from '@radix-ui/themes';
import * as updateProductModule from '../api/updateProduct';
import * as deleteProductModule from '../api/deleteProduct';
import type { Product } from '@f/types/api-schemas';

vi.mock('../api/updateProduct');
vi.mock('../api/deleteProduct');

const mockProduct: Product = {
  id: 'test-id',
  title: 'Test Product',
  artist: 'Test Artist',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  image: {
    url: 'http://test.com/image.jpg',
    key: 'test-key',
    width: 500,
    height: 500,
    format: 'jpeg',
  },
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <Theme>{children}</Theme>
  </QueryClientProvider>
);

describe('EditProductForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('renders edit form with product data', () => {
    render(<EditProductForm product={mockProduct} />, { wrapper: Wrapper });

    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Artist')).toBeInTheDocument();
  });

  it('shows delete button in edit mode', () => {
    render(<EditProductForm product={mockProduct} />, { wrapper: Wrapper });

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('successfully deletes product and closes form', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    vi.spyOn(deleteProductModule, 'deleteProduct').mockResolvedValue();

    render(<EditProductForm product={mockProduct} onClose={onClose} />, {
      wrapper: Wrapper,
    });

    // Open delete dialog
    await user.click(screen.getByRole('button', { name: /delete/i }));

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText('Delete Product')).toBeInTheDocument();
    });

    const confirmButtons = screen.getAllByRole('button', { name: /delete/i });
    const confirmButton = confirmButtons[confirmButtons.length - 1];
    await user.click(confirmButton);

    await waitFor(() => {
      expect(deleteProductModule.deleteProduct).toHaveBeenCalledWith('test-id');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('handles delete error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    vi.spyOn(deleteProductModule, 'deleteProduct').mockRejectedValue(
      new Error('Delete failed')
    );

    render(<EditProductForm product={mockProduct} />, { wrapper: Wrapper });

    await user.click(screen.getByRole('button', { name: /delete/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Delete Product')).toBeInTheDocument();
    });

    const confirmButtons = screen.getAllByRole('button', { name: /delete/i });
    const confirmButton = confirmButtons[confirmButtons.length - 1];
    await user.click(confirmButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to delete product:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
