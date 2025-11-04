import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { listProducts } from '../listProducts.controller';
import * as productsService from '../products.service';
import type { Product } from '@f/types/api-schemas';

vi.mock('../products.service', () => ({
  getAllProducts: vi.fn(),
}));

describe('listProducts.controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });

    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    vi.clearAllMocks();
  });

  it('returns 200 with products list on success', async () => {
    const mockProducts: Product[] = [
      {
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
      },
    ];

    vi.mocked(productsService.getAllProducts).mockResolvedValue(mockProducts);

    await listProducts(mockRequest as Request, mockResponse as Response);

    expect(productsService.getAllProducts).toHaveBeenCalledOnce();
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({ products: mockProducts });
  });

  it('returns 500 on service error', async () => {
    const errorMessage = 'Database connection failed';
    vi.mocked(productsService.getAllProducts).mockRejectedValue(
      new Error(errorMessage)
    );

    await listProducts(mockRequest as Request, mockResponse as Response);

    expect(productsService.getAllProducts).toHaveBeenCalledOnce();
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      title: 'Failed to Fetch Products',
      message: errorMessage,
    });
  });

  it('returns 500 with generic message on non-Error exception', async () => {
    vi.mocked(productsService.getAllProducts).mockRejectedValue(
      'Unknown error'
    );

    await listProducts(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      title: 'Failed to Fetch Products',
      message: 'Failed to fetch products',
    });
  });
});
