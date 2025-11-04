import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { createProductController } from '../createProduct.controller';
import * as productsService from '../products.service';
import type { CreateProductInput } from '../products.validation';
import type { Product } from '@f/types/api-schemas';

vi.mock('../products.service', () => ({
  createProduct: vi.fn(),
}));

describe('createProduct.controller', () => {
  let mockRequest: Partial<Request<object, object, CreateProductInput>>;
  let mockResponse: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });

    mockRequest = {
      body: {
        title: 'Test Album',
        artist: 'Test Artist',
        imageKey: 'test-image-key',
      },
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    vi.clearAllMocks();
  });

  it('returns 201 with created product on success', async () => {
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

    vi.mocked(productsService.createProduct).mockResolvedValue(mockProduct);

    await createProductController(
      mockRequest as Request<object, object, CreateProductInput>,
      mockResponse as Response
    );

    expect(productsService.createProduct).toHaveBeenCalledWith(
      'Test Album',
      'Test Artist',
      'test-image-key'
    );
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith(mockProduct);
  });

  it('returns 400 on service error', async () => {
    const errorMessage = 'Invalid image metadata';
    vi.mocked(productsService.createProduct).mockRejectedValue(
      new Error(errorMessage)
    );

    await createProductController(
      mockRequest as Request<object, object, CreateProductInput>,
      mockResponse as Response
    );

    expect(productsService.createProduct).toHaveBeenCalledWith(
      'Test Album',
      'Test Artist',
      'test-image-key'
    );
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      title: 'Product Creation Failed',
      message: errorMessage,
    });
  });

  it('returns 400 with generic message on non-Error exception', async () => {
    vi.mocked(productsService.createProduct).mockRejectedValue('Unknown error');

    await createProductController(
      mockRequest as Request<object, object, CreateProductInput>,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      title: 'Product Creation Failed',
      message: 'Failed to create product',
    });
  });
});
