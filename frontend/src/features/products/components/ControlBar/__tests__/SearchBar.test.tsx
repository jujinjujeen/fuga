import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('renders search input with placeholder', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    expect(
      screen.getByPlaceholderText('Search products...')
    ).toBeInTheDocument();
  });

  it('displays value prop', () => {
    const onChange = vi.fn();
    render(<SearchBar value="queen" onChange={onChange} />);

    expect(screen.getByDisplayValue('queen')).toBeInTheDocument();
  });

  it('calls onChange when user types', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Search products...');
    await user.type(input, 'queen');

    expect(onChange).toHaveBeenCalledTimes(5);
    // Each character triggers onChange separately, so check individual calls
    expect(onChange).toHaveBeenNthCalledWith(1, 'q');
    expect(onChange).toHaveBeenNthCalledWith(5, 'n');
  });

  it('shows clear button when value is not empty', () => {
    const onChange = vi.fn();
    render(<SearchBar value="queen" onChange={onChange} />);

    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('does not show clear button when value is empty', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('calls onChange with empty string when clear button clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar value="queen" onChange={onChange} />);

    const clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledWith('');
  });
});
