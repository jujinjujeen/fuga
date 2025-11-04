import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { getProduct } from '../getProduct.controller';
import * as productsService from '../products.service';
import { HTTP_STATUS, HTTP_LABEL } from '@f/be/constants';
import type { Product } from '@f/types/api-schemas';

vi.mock('../products.service', () => ({
  getProductById: vi.fn(),
}));

describe('getProduct.controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });

    mockRequest = {
      params: {},
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    vi.clearAllMocks();
  });

  it('returns 200 with product on success', async () => {
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

    mockRequest.params = { productId: '123e4567-e89b-12d3-a456-426614174000' };
    vi.mocked(productsService.getProductById).mockResolvedValue(mockProduct);

    await getProduct(mockRequest as Request, mockResponse as Response);

    expect(productsService.getProductById).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000'
    );
    expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(mockJson).toHaveBeenCalledWith(mockProduct);
  });

  it('returns 404 when product not found', async () => {
    mockRequest.params = { productId: '123e4567-e89b-12d3-a456-426614174000' };
    vi.mocked(productsService.getProductById).mockResolvedValue(null);

    await getProduct(mockRequest as Request, mockResponse as Response);

    expect(productsService.getProductById).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000'
    );
    expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith({
      title: HTTP_LABEL.NOT_FOUND,
      message: 'Product with ID 123e4567-e89b-12d3-a456-426614174000 not found',
      code: HTTP_STATUS.NOT_FOUND,
    });
  });

  it('returns 400 when productId is missing', async () => {
    mockRequest.params = {};

    await getProduct(mockRequest as Request, mockResponse as Response);

    expect(productsService.getProductById).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      title: HTTP_LABEL.BAD_REQUEST,
      message: 'Product ID is required',
      code: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('returns 500 on service error', async () => {
    const errorMessage = 'Database error';
    mockRequest.params = { productId: '123e4567-e89b-12d3-a456-426614174000' };
    vi.mocked(productsService.getProductById).mockRejectedValue(
      new Error(errorMessage)
    );

    await getProduct(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      title: 'Failed to Fetch Product',
      message: errorMessage,
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  });

  it('returns 500 with generic message on non-Error exception', async () => {
    mockRequest.params = { productId: '123e4567-e89b-12d3-a456-426614174000' };
    vi.mocked(productsService.getProductById).mockRejectedValue(
      'Unknown error'
    );

    await getProduct(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      title: 'Failed to Fetch Product',
      message: 'Failed to fetch product',
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  });
});
