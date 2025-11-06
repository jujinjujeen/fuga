import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { ImageUploadField } from '../ImageUploadField';
import type { ProductFormValues } from '../../../types';
import { Theme } from '@radix-ui/themes';
import * as useImageUploadModule from '../../../hooks/useImageUpload';

// Mock the useImageUpload hook
vi.mock('../../../hooks/useImageUpload');

// Wrapper component
const TestWrapper = ({ initialPreviewUrl }: { initialPreviewUrl?: string }) => {
  const form = useForm<ProductFormValues>({
    defaultValues: {
      title: '',
      artist: '',
      imageKey: '',
    },
  });

  return (
    <Theme>
      <ImageUploadField form={form} initialPreviewUrl={initialPreviewUrl} />
    </Theme>
  );
};

describe('ImageUploadField', () => {
  const mockUpload = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');

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

  it('should render label with required asterisk', () => {
    render(<TestWrapper />);

    const label = screen.getByText('Product Image');
    expect(label).toBeInTheDocument();

    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
  });

  it('should render upload button when no image is present', () => {
    render(<TestWrapper />);

    const uploadText = screen.getByText('Click to upload image');
    expect(uploadText).toBeInTheDocument();

    const formatText = screen.getByText('PNG, JPG or WEBP (max 10MB)');
    expect(formatText).toBeInTheDocument();
  });

  it('should render preview image when previewUrl is available', () => {
    vi.mocked(useImageUploadModule.useImageUpload).mockReturnValue({
      status: 'done',
      error: null,
      storageKey: 'temp/image.jpg',
      previewUrl: 'blob:mock-url',
      upload: mockUpload,
      reset: mockReset,
    });

    render(<TestWrapper />);

    const image = screen.getByAltText('Product preview');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'blob:mock-url');
  });

  it('should render initial preview when provided', () => {
    render(<TestWrapper initialPreviewUrl="https://example.com/image.jpg" />);

    const image = screen.getByAltText('Product preview');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('should show change image button on hover when preview exists', () => {
    vi.mocked(useImageUploadModule.useImageUpload).mockReturnValue({
      status: 'done',
      error: null,
      storageKey: 'temp/image.jpg',
      previewUrl: 'blob:mock-url',
      upload: mockUpload,
      reset: mockReset,
    });

    render(<TestWrapper />);

    const changeButton = screen.getByText('Change Image');
    expect(changeButton).toBeInTheDocument();
  });

  it('should trigger file input when upload button is clicked', async () => {
    render(<TestWrapper />);

    const fileInput = screen.getByLabelText('Upload product image');
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveClass('hidden');

    // File input should accept specific image types
    expect(fileInput).toHaveAttribute(
      'accept',
      'image/png,image/jpeg,image/webp'
    );
  });

  it('should call upload when file is selected', async () => {
    const user = userEvent.setup();
    mockUpload.mockResolvedValueOnce('temp/uploaded-image.jpg');

    render(<TestWrapper />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(
      'Upload product image'
    ) as HTMLInputElement;

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith(file);
    });
  });

  it('should display uploading state', () => {
    vi.mocked(useImageUploadModule.useImageUpload).mockReturnValue({
      status: 'uploading',
      error: null,
      storageKey: null,
      previewUrl: null,
      upload: mockUpload,
      reset: mockReset,
    });

    render(<TestWrapper />);

    const uploadingText = screen.getByText('Uploading...');
    expect(uploadingText).toBeInTheDocument();
  });

  it('should disable upload button when uploading', () => {
    vi.mocked(useImageUploadModule.useImageUpload).mockReturnValue({
      status: 'uploading',
      error: null,
      storageKey: null,
      previewUrl: null,
      upload: mockUpload,
      reset: mockReset,
    });

    render(<TestWrapper />);

    const uploadButton = screen.getByText('Uploading...').closest('button');
    expect(uploadButton).toBeDisabled();
  });

  it('should disable upload button when presigning', () => {
    vi.mocked(useImageUploadModule.useImageUpload).mockReturnValue({
      status: 'presigning',
      error: null,
      storageKey: null,
      previewUrl: null,
      upload: mockUpload,
      reset: mockReset,
    });

    render(<TestWrapper />);

    const uploadButton = screen
      .getByText('Click to upload image')
      .closest('button');
    expect(uploadButton).toBeDisabled();
  });

  it('should display error message when error exists', () => {
    vi.mocked(useImageUploadModule.useImageUpload).mockReturnValue({
      status: 'error',
      error: 'File size too large',
      storageKey: null,
      previewUrl: null,
      upload: mockUpload,
      reset: mockReset,
    });

    render(<TestWrapper />);

    const errorMessage = screen.getByText('File size too large');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-red-600');
  });

  it('should accept custom name prop', () => {
    const CustomWrapper = () => {
      const form = useForm<ProductFormValues>({
        defaultValues: { title: '', artist: '', imageKey: '' },
      });
      return (
        <Theme>
          <ImageUploadField form={form} name="imageKey" />
        </Theme>
      );
    };

    render(<CustomWrapper />);

    const input = screen.getByLabelText('Upload product image');
    expect(input).toHaveAttribute('id', 'imageKey');
  });

  it('should accept custom label prop', () => {
    const CustomWrapper = () => {
      const form = useForm<ProductFormValues>({
        defaultValues: { title: '', artist: '', imageKey: '' },
      });
      return (
        <Theme>
          <ImageUploadField form={form} label="Custom Label" />
        </Theme>
      );
    };

    render(<CustomWrapper />);

    const label = screen.getByText('Custom Label');
    expect(label).toBeInTheDocument();
  });

  it('should not call upload when no file is selected', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);

    const fileInput = screen.getByLabelText(
      'Upload product image'
    ) as HTMLInputElement;

    // Trigger change without file
    await user.click(fileInput);

    expect(mockUpload).not.toHaveBeenCalled();
  });
});
