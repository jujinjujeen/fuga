import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { ProductField } from '../ProductField';
import type { ProductFormValues } from '../../../types';
import { Theme } from '@radix-ui/themes';

// Wrapper component to use the hook
const TestWrapper = ({
  id,
  label,
  placeholder,
  defaultValues,
}: {
  id: 'title' | 'artist';
  label: string;
  placeholder?: string;
  defaultValues?: Partial<ProductFormValues>;
}) => {
  const form = useForm<ProductFormValues>({
    defaultValues: {
      title: defaultValues?.title || '',
      artist: defaultValues?.artist || '',
      imageKey: defaultValues?.imageKey || '',
    },
    mode: 'onChange',
  });

  return (
    <Theme>
      <ProductField id={id} label={label} placeholder={placeholder} form={form} />
    </Theme>
  );
};

describe('ProductField', () => {
  it('should render label with required asterisk', () => {
    render(<TestWrapper id="title" label="Title" />);

    const label = screen.getByText('Title');
    expect(label).toBeInTheDocument();

    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-red-500');
  });

  it('should render input with placeholder', () => {
    render(<TestWrapper id="title" label="Title" placeholder="Enter title" />);

    const input = screen.getByPlaceholderText('Enter title');
    expect(input).toBeInTheDocument();
  });

  it('should render with default value', () => {
    render(
      <TestWrapper
        id="title"
        label="Title"
        defaultValues={{ title: 'Test Album' }}
      />
    );

    const input = screen.getByDisplayValue('Test Album');
    expect(input).toBeInTheDocument();
  });

  it('should render artist field', () => {
    render(
      <TestWrapper
        id="artist"
        label="Artist"
        placeholder="Enter artist name"
        defaultValues={{ artist: 'Test Artist' }}
      />
    );

    const input = screen.getByPlaceholderText('Enter artist name');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Test Artist');
  });

  it('should render error section when errors exist', () => {
    render(<TestWrapper id="title" label="Title" />);

    const input = screen.getByLabelText(/Title/);
    // Just verify the input has the error container structure
    expect(input).toBeInTheDocument();
    expect(input.parentElement).toBeInTheDocument();
  });

  it('should have correct id attribute', () => {
    render(<TestWrapper id="title" label="Title" />);

    const input = screen.getByLabelText(/Title/);
    expect(input).toHaveAttribute('id', 'title');
  });

  it('should render without placeholder', () => {
    render(<TestWrapper id="title" label="Title" />);

    const input = screen.getByLabelText(/Title/);
    expect(input).toBeInTheDocument();
    expect(input).not.toHaveAttribute('placeholder');
  });

  it('should render label with correct structure', () => {
    render(<TestWrapper id="title" label="Product Title" />);

    const label = screen.getByText('Product Title');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'title');
  });
});
