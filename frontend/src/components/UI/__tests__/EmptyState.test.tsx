import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../../test/testUtils';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders with default icon and message', () => {
    render(<EmptyState message="No data available" />);

    const icon = screen.getByText('📭');
    const message = screen.getByText('No data available');

    expect(document.body.contains(icon)).toBe(true);
    expect(document.body.contains(message)).toBe(true);
  });

  it('renders with custom icon', () => {
    render(<EmptyState message="No races" icon="🏁" />);

    const icon = screen.getByText('🏁');
    const message = screen.getByText('No races');

    expect(document.body.contains(icon)).toBe(true);
    expect(document.body.contains(message)).toBe(true);
  });
});