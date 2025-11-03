// __tests__/health.controller.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { healthController } from '../health.controller';
import prisma from '@f/prismaInstance';
import type { HealthResponse, ErrorResponse } from '@f/types/api-schemas';

vi.mock('@f/prismaInstance', () => ({
  default: {
    $queryRaw: vi.fn(),
  },
}));

describe('health.controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response<HealthResponse | ErrorResponse>>;
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
    vi.spyOn(process, 'uptime').mockReturnValue(123.45);
  });

  describe('healthController', () => {
    it('should call prisma query and return health status', async () => {
      vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

      await healthController(
        mockRequest as Request,
        mockResponse as Response<HealthResponse | ErrorResponse>
      );

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'ok',
        uptime: 123.45,
      });
    });
  });
});