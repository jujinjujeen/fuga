import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { updateProductController } from '../updateProduct.controller';
import * as productsService from '../products.service';
import { HTTP_STATUS, HTTP_LABEL } from '@f/be/constants';
import type { Product } from '@f/types/api-schemas';

type UpdateProductRequest = Request<
  { productId: string },
  object,
  { title: string; artist: string; imageKey?: string }
>;

vi.mock('../products.service', () => ({
  getProductById: vi.fn(),
  updateProduct: vi.fn(),
}));

describe('updateProduct.controller', () => {
  let mockRequest: Partial<UpdateProductRequest>;
  let mockResponse: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  const mockProduct: Product = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Album',
    artist: 'Test Artist',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    image: {
      url: 'http://example.com/image.jpg',
      width: 1200,
      height: 1200,
      format: 'jpeg',
    },
  };

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });

    mockRequest = {
      params: { productId: '123e4567-e89b-12d3-a456-426614174000' },
      body: {
        title: 'Updated Album',
        artist: 'Updated Artist',
      },
      headers: {},
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    vi.clearAllMocks();
  });

  it('returns 200 with updated product', async () => {
    const updatedProduct = {
      ...mockProduct,
      title: 'Updated Album',
      artist: 'Updated Artist',
      updatedAt: '2024-01-02T00:00:00.000Z',
    };

    vi.mocked(productsService.updateProduct).mockResolvedValue(updatedProduct);

    await updateProductController(
      mockRequest as UpdateProductRequest,
      mockResponse as Response
    );

    expect(productsService.updateProduct).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000',
      'Updated Album',
      'Updated Artist',
      undefined
    );
    expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(mockJson).toHaveBeenCalledWith(updatedProduct);
  });

  it('returns 404 when update service returns null', async () => {
    vi.mocked(productsService.updateProduct).mockResolvedValue(null);

    await updateProductController(
      mockRequest as UpdateProductRequest,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith({
      title: HTTP_LABEL.NOT_FOUND,
      message: 'Product with ID 123e4567-e89b-12d3-a456-426614174000 not found',
      code: HTTP_STATUS.NOT_FOUND,
    });
  });

  it('returns 400 when productId is missing', async () => {
    mockRequest.params = {} as { productId: string };

    await updateProductController(
      mockRequest as UpdateProductRequest,
      mockResponse as Response
    );

    expect(productsService.updateProduct).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      title: HTTP_LABEL.BAD_REQUEST,
      message: 'Product ID is required',
      code: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('handles optional imageKey in update', async () => {
    mockRequest.body = {
      title: 'Updated Album',
      artist: 'Updated Artist',
      imageKey: 'new-image-key',
    };

    const updatedProduct = { ...mockProduct, title: 'Updated Album' };
    vi.mocked(productsService.updateProduct).mockResolvedValue(updatedProduct);

    await updateProductController(
      mockRequest as UpdateProductRequest,
      mockResponse as Response
    );

    expect(productsService.updateProduct).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000',
      'Updated Album',
      'Updated Artist',
      'new-image-key'
    );
    expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
  });

  it('returns 500 on service error', async () => {
    const errorMessage = 'Database error';
    vi.mocked(productsService.updateProduct).mockRejectedValue(
      new Error(errorMessage)
    );

    await updateProductController(
      mockRequest as UpdateProductRequest,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      title: 'Failed to Update Product',
      message: errorMessage,
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  });
});
