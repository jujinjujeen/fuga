import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../../test/testUtils';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  const mockError = new Error('Test error message');

  it('renders error message correctly', () => {
    render(<ErrorMessage error={mockError} />);

    const emoji = screen.getByText('❌');
    const title = screen.getByText('Oops! Something went wrong');
    const message = screen.getByText('Test error message');

    expect(document.body.contains(emoji)).toBe(true);
    expect(document.body.contains(title)).toBe(true);
    expect(document.body.contains(message)).toBe(true);
  });

  it('does not show retry button by default', () => {
    render(<ErrorMessage error={mockError} />);

    const retryButton = screen.queryByText('Try Again');
    expect(retryButton).toBeNull();
  });

  it('shows retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage error={mockError} onRetry={onRetry} />);

    const retryButton = screen.getByText('Try Again');
    expect(document.body.contains(retryButton)).toBe(true);
  });

  it('calls onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn();
    const { user } = render(
      <ErrorMessage error={mockError} onRetry={onRetry} />
    );

    const retryButton = screen.getByText('Try Again');
    await user.click(retryButton);
    expect(onRetry).toHaveBeenCalledOnce();
  });
});