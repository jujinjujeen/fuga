import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '../Sidebar';
import userEvent from '@testing-library/user-event';

describe('Sidebar', () => {
  it('renders children when open', () => {
    render(
      <Sidebar isOpen={true} onClose={vi.fn()}>
        <div>Test Content</div>
      </Sidebar>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct visibility classes when open', () => {
    render(
      <Sidebar isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </Sidebar>
    );

    const sidebar = screen.getByRole('dialog');
    expect(sidebar).toHaveClass('translate-x-0');
    expect(sidebar).toHaveClass('scale-100');
  });

  it('applies correct visibility classes when closed', () => {
    render(
      <Sidebar isOpen={false} onClose={vi.fn()}>
        <div>Content</div>
      </Sidebar>
    );

    const sidebar = screen.getByRole('dialog');
    expect(sidebar).toHaveClass('translate-x-full');
    expect(sidebar).toHaveClass('scale-95');
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Sidebar isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Sidebar>
    );

    // Get backdrop (first child before the sidebar)
    const backdrop = document.querySelector('.backdrop-blur-md');
    expect(backdrop).toBeInTheDocument();

    if (backdrop) {
      await user.click(backdrop);
      expect(onClose).toHaveBeenCalledOnce();
    }
  });

  it('uses custom width classes when provided', () => {
    render(
      <Sidebar isOpen={true} onClose={vi.fn()} width="w-96">
        <div>Content</div>
      </Sidebar>
    );

    const sidebar = screen.getByRole('dialog');
    expect(sidebar).toHaveClass('w-96');
  });

  it('uses custom aria-label when provided', () => {
    render(
      <Sidebar isOpen={true} onClose={vi.fn()} ariaLabel="Custom sidebar">
        <div>Content</div>
      </Sidebar>
    );

    const sidebar = screen.getByRole('dialog');
    expect(sidebar).toHaveAttribute('aria-label', 'Custom sidebar');
  });

  it('can render any content as children', () => {
    render(
      <Sidebar isOpen={true} onClose={vi.fn()}>
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
          <button>Button</button>
        </div>
      </Sidebar>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument();
  });
});
