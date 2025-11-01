import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../test/testUtils';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default message', () => {
    render(<LoadingSpinner />);

    const message = screen.getByText('Loading...');
    const spinner = screen.getByText('🏁');

    expect(document.body.contains(message)).toBe(true);
    expect(document.body.contains(spinner)).toBe(true);
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Loading races..." />);

    const message = screen.getByText('Loading races...');
    expect(document.body.contains(message)).toBe(true);
  });

  it('has spinning animation class', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByText('🏁');
    expect(spinner.classList.contains('animate-spin')).toBe(true);
  });
});