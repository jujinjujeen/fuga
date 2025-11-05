import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DeleteProductDialog } from '../components/common/DeleteProductDialog';
import { Theme } from '@radix-ui/themes';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Theme>{children}</Theme>
);

describe('DeleteProductDialog', () => {
  it('renders delete button', () => {
    const onConfirm = vi.fn();
    render(
      <DeleteProductDialog
        productTitle="Test Product"
        isDeleting={false}
        onConfirm={onConfirm}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('shows confirmation dialog on button click', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    
    render(
      <DeleteProductDialog
        productTitle="Test Product"
        isDeleting={false}
        onConfirm={onConfirm}
      />,
      { wrapper: Wrapper }
    );

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(screen.getByText('Delete Product')).toBeInTheDocument();
    expect(screen.getByText(/Test Product/)).toBeInTheDocument();
  });

  it('shows cancel button in dialog', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <DeleteProductDialog
        productTitle="Test Product"
        isDeleting={false}
        onConfirm={onConfirm}
      />,
      { wrapper: Wrapper }
    );

    // Open dialog
    await user.click(screen.getByRole('button', { name: /delete/i }));

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Delete Product')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('shows deleting state', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    
    render(
      <DeleteProductDialog
        productTitle="Test Product"
        isDeleting={true}
        onConfirm={onConfirm}
      />,
      { wrapper: Wrapper }
    );

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });
});
