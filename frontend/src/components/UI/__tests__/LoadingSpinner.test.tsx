import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../test/testUtils';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default message', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('🎶')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Loading products..." />);

    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('has spinning animation class', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByText('🎶');
    expect(spinner.classList.contains('animate-spin')).toBe(true);
  });
});