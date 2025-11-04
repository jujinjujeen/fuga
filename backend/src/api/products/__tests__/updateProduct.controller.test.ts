import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { updateProductController } from '../updateProduct.controller';
import * as productsService from '../products.service';
import * as etagUtils from '@f/be/utils/etag';
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

vi.mock('@f/be/utils/etag', () => ({
  generateETag: vi.fn(),
  validateIfMatch: vi.fn(),
}));

describe('updateProduct.controller', () => {
  let mockRequest: Partial<UpdateProductRequest>;
  let mockResponse: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;
  let mockSetHeader: ReturnType<typeof vi.fn>;

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
    mockSetHeader = vi.fn();

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
      setHeader: mockSetHeader,
    };

    vi.clearAllMocks();
  });

  it('returns 200 with updated product when ETag matches', async () => {
    const updatedProduct = {
      ...mockProduct,
      title: 'Updated Album',
      artist: 'Updated Artist',
      updatedAt: '2024-01-02T00:00:00.000Z',
    };

    mockRequest.headers = { 'if-match': 'W/"abc123"' };

    vi.mocked(productsService.getProductById).mockResolvedValue(mockProduct);
    vi.mocked(etagUtils.generateETag).mockReturnValueOnce('W/"abc123"');
    vi.mocked(etagUtils.validateIfMatch).mockReturnValue(true);
    vi.mocked(productsService.updateProduct).mockResolvedValue(updatedProduct);
    vi.mocked(etagUtils.generateETag).mockReturnValueOnce('W/"def456"');

    await updateProductController(
      mockRequest as UpdateProductRequest,
      mockResponse as Response
    );

    expect(productsService.getProductById).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000'
    );
    expect(etagUtils.validateIfMatch).toHaveBeenCalledWith(
      'W/"abc123"',
      'W/"abc123"'
    );
    expect(productsService.updateProduct).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000',
      'Updated Album',
      'Updated Artist',
      undefined
    );
    expect(mockSetHeader).toHaveBeenCalledWith('ETag', 'W/"def456"');
    expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(mockJson).toHaveBeenCalledWith(updatedProduct);
  });

  it('returns 200 when no If-Match header is provided', async () => {
    const updatedProduct = { ...mockProduct, title: 'Updated Album' };

    vi.mocked(productsService.getProductById).mockResolvedValue(mockProduct);
    vi.mocked(etagUtils.generateETag).mockReturnValueOnce('W/"abc123"');
    vi.mocked(etagUtils.validateIfMatch).mockReturnValue(true);
    vi.mocked(productsService.updateProduct).mockResolvedValue(updatedProduct);
    vi.mocked(etagUtils.generateETag).mockReturnValueOnce('W/"def456"');

    await updateProductController(
      mockRequest as UpdateProductRequest,
      mockResponse as Response
    );

    expect(etagUtils.validateIfMatch).toHaveBeenCalledWith(
      undefined,
      'W/"abc123"'
    );
    expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
  });

  it('returns 409 when ETag does not match', async () => {
    mockRequest.headers = { 'if-match': 'W/"old123"' };

    vi.mocked(productsService.getProductById).mockResolvedValue(mockProduct);
    vi.mocked(etagUtils.generateETag).mockReturnValue('W/"abc123"');
    vi.mocked(etagUtils.validateIfMatch).mockReturnValue(false);

    await updateProductController(
      mockRequest as UpdateProductRequest,
      mockResponse as Response
    );

    expect(productsService.updateProduct).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith({
      title: HTTP_LABEL.CONFLICT,
      message: 'Resource has been modified by another request',
      code: HTTP_STATUS.CONFLICT,
    });
  });

  it('returns 404 when product not found before update', async () => {
    vi.mocked(productsService.getProductById).mockResolvedValue(null);

    await updateProductController(
      mockRequest as UpdateProductRequest,
      mockResponse as Response
    );

    expect(productsService.updateProduct).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith({
      title: HTTP_LABEL.NOT_FOUND,
      message: 'Product with ID 123e4567-e89b-12d3-a456-426614174000 not found',
      code: HTTP_STATUS.NOT_FOUND,
    });
  });

  it('returns 404 when update service returns null', async () => {
    vi.mocked(productsService.getProductById).mockResolvedValue(mockProduct);
    vi.mocked(etagUtils.generateETag).mockReturnValue('W/"abc123"');
    vi.mocked(etagUtils.validateIfMatch).mockReturnValue(true);
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

    expect(productsService.getProductById).not.toHaveBeenCalled();
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

    vi.mocked(productsService.getProductById).mockResolvedValue(mockProduct);
    vi.mocked(etagUtils.generateETag).mockReturnValue('W/"abc123"');
    vi.mocked(etagUtils.validateIfMatch).mockReturnValue(true);
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

    vi.mocked(productsService.getProductById).mockResolvedValue(mockProduct);
    vi.mocked(etagUtils.generateETag).mockReturnValue('W/"abc123"');
    vi.mocked(etagUtils.validateIfMatch).mockReturnValue(true);
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

  it('returns 500 with generic message on non-Error exception', async () => {
    vi.mocked(productsService.getProductById).mockResolvedValue(mockProduct);
    vi.mocked(etagUtils.generateETag).mockReturnValue('W/"abc123"');
    vi.mocked(etagUtils.validateIfMatch).mockReturnValue(true);
    vi.mocked(productsService.updateProduct).mockRejectedValue('Unknown error');

    await updateProductController(
      mockRequest as UpdateProductRequest,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      title: 'Failed to Update Product',
      message: 'Failed to update product',
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  });
});
