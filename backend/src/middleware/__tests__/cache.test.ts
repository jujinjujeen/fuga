// __tests__/cache.middleware.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { cacheMiddleware } from '../cache';
import redis from '@f/redisClient';

vi.mock('@f/redisClient', () => ({
  default: {
    get: vi.fn(),
    setex: vi.fn(),
  },
}));

const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('cache.middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockJson = vi.fn();
    mockSend = vi.fn().mockReturnValue(mockResponse);
    mockNext = vi.fn();

    mockRequest = {
      method: 'GET',
      originalUrl: '/api/seasons',
    };

    mockResponse = {
      json: mockJson,
      send: mockSend,
      statusCode: 200,
    };

    vi.clearAllMocks();
  });

  describe('cacheMiddleware', () => {
    it('should skip caching for non-GET requests', async () => {
      mockRequest.method = 'POST';
      const middleware = cacheMiddleware(300);

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(redis.get).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should skip caching for health check endpoints', async () => {
      mockRequest.originalUrl = '/api/health';
      const middleware = cacheMiddleware(300);

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(redis.get).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should return cached data when cache hit', async () => {
      const cachedData = { seasons: [{ id: 1, year: 2023 }] };
      vi.mocked(redis.get).mockResolvedValue(JSON.stringify(cachedData));

      const middleware = cacheMiddleware(300);

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(redis.get).toHaveBeenCalledWith('cache:/api/seasons');
      expect(mockJson).toHaveBeenCalledWith(cachedData);
      expect(mockNext).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Cache hit for cache:/api/seasons'
      );
    });

    it('should proceed to next when cache miss', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      const middleware = cacheMiddleware(300);

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(redis.get).toHaveBeenCalledWith('cache:/api/seasons');
      expect(mockJson).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should hijack res.send and cache 200 responses', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.setex).mockResolvedValue('OK');

      const middleware = cacheMiddleware(300);
      const responseData = { seasons: [{ id: 1, year: 2023 }] };

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Simulate response being sent
      mockResponse.statusCode = 200;
      mockResponse.send!(JSON.stringify(responseData));

      expect(redis.setex).toHaveBeenCalledWith(
        'cache:/api/seasons',
        300,
        JSON.stringify(responseData)
      );
      expect(mockSend).toHaveBeenCalledWith(JSON.stringify(responseData));
    });

    it('should not cache non-200 responses', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);

      const middleware = cacheMiddleware(300);

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Simulate 404 response
      mockResponse.statusCode = 404;
      mockResponse.send!('Not found');

      expect(redis.setex).not.toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith('Not found');
    });

    it('should handle string body in res.send', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.setex).mockResolvedValue('OK');

      const middleware = cacheMiddleware(300);

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const responseString = '{"data": "test"}';
      mockResponse.statusCode = 200;
      mockResponse.send!(responseString);

      expect(redis.setex).toHaveBeenCalledWith(
        'cache:/api/seasons',
        300,
        responseString
      );
    });

    it('should handle Redis setex errors gracefully', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.setex).mockRejectedValue(
        new Error('Redis connection failed')
      );

      const middleware = cacheMiddleware(300);

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      mockResponse.statusCode = 200;
      mockResponse.send!('{"data": "test"}');

      // Wait for the async error handling
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to cache /api/seasons:',
        expect.any(Error)
      );
    });

    it('should use correct cache key format', async () => {
      mockRequest.originalUrl = '/api/races/2023';
      vi.mocked(redis.get).mockResolvedValue(null);

      const middleware = cacheMiddleware(300);

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(redis.get).toHaveBeenCalledWith('cache:/api/races/2023');
    });

    it('should use provided TTL value', async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.setex).mockResolvedValue('OK');

      const middleware = cacheMiddleware(600);

      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      mockResponse.statusCode = 200;
      mockResponse.send!('{"data": "test"}');

      expect(redis.setex).toHaveBeenCalledWith(
        'cache:/api/seasons',
        600,
        '{"data": "test"}'
      );
    });
  });
});
