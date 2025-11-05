import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { deleteProductController } from '../deleteProduct.controller';
import * as productsService from '../products.service';
import { HTTP_STATUS, HTTP_LABEL } from '@f/be/constants';

// Mock dependencies
vi.mock('../products.service');

describe('deleteProduct.controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockStatus: ReturnType<typeof vi.fn>;
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockJson = vi.fn();
    mockSend = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson, send: mockSend });

    mockRequest = {
      params: {},
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };

    vi.clearAllMocks();
  });

  describe('deleteProductController', () => {
    it('should delete a product successfully and return 204', async () => {
      mockRequest.params = { productId: '123e4567-e89b-12d3-a456-426614174000' };
      vi.mocked(productsService.deleteProduct).mockResolvedValue(true);

      await deleteProductController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(productsService.deleteProduct).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000'
      );
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NO_CONTENT);
      expect(mockSend).toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });

    it('should return 404 when product does not exist', async () => {
      mockRequest.params = { productId: 'non-existent-id' };
      vi.mocked(productsService.deleteProduct).mockResolvedValue(false);

      await deleteProductController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(productsService.deleteProduct).toHaveBeenCalledWith('non-existent-id');
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({
        title: HTTP_LABEL.NOT_FOUND,
        message: 'Product with ID non-existent-id not found',
        code: HTTP_STATUS.NOT_FOUND,
      });
    });

    it('should return 400 when productId is missing', async () => {
      mockRequest.params = {};

      await deleteProductController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(productsService.deleteProduct).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        title: HTTP_LABEL.BAD_REQUEST,
        message: 'Product ID is required',
        code: HTTP_STATUS.BAD_REQUEST,
      });
    });

    it('should return 500 when service throws an error', async () => {
      mockRequest.params = { productId: '123e4567-e89b-12d3-a456-426614174000' };
      const error = new Error('Database connection failed');
      vi.mocked(productsService.deleteProduct).mockRejectedValue(error);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await deleteProductController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(productsService.deleteProduct).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000'
      );
      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({
        title: 'Failed to Delete Product',
        message: 'Database connection failed',
        code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Delete product error:', error);

      consoleErrorSpy.mockRestore();
    });

    it('should handle non-Error exceptions', async () => {
      mockRequest.params = { productId: '123e4567-e89b-12d3-a456-426614174000' };
      vi.mocked(productsService.deleteProduct).mockRejectedValue('Unknown error');

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await deleteProductController(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({
        title: 'Failed to Delete Product',
        message: 'Failed to delete product',
        code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
