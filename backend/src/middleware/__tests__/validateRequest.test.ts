import { describe, it, expect, vi, Mock } from 'vitest';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { validateRequest } from '../validateRequest';
import { HTTP_STATUS, HTTP_LABEL } from '@f/be/constants';
import type { ErrorResponse } from '@f/types/api-schemas';

type MockReq = Partial<Request> & Record<string, unknown>;
type MockRes = Partial<Response<ErrorResponse>> & {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

describe('validateRequest middleware', () => {
  const dummySchema = z.object({
    foo: z.string().min(1, 'foo is required'),
    bar: z.number().int().gte(0, 'bar must be a non-negative integer'),
  });

  const validPayload = { foo: 'hello', bar: 123 };
  const invalidPayload = { foo: '', bar: -5 };

  const sources: Array<'body' | 'params' | 'query'> = [
    'body',
    'params',
    'query',
  ];

  describe.each(sources)('when source="%s"', (source) => {
    const mw = validateRequest(dummySchema, source);

    it('calls next() and replaces req[source] when payload is valid', () => {
      // ─── Arrange ─────────────────────────────────────────────────────────
      const req: MockReq = { [source]: { ...validPayload } };
      const res: MockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      const next: NextFunction = vi.fn();

      // ─── Act ────────────────────────────────────────────────────────────
      mw(req as Request, res as Response<ErrorResponse>, next);

      // ─── Assert ─────────────────────────────────────────────────────────
      // next() should have been called once
      expect(next).toHaveBeenCalledTimes(1);

      // req[source] should have been replaced with the parsed (typed) data
      expect(req[source]).toEqual(validPayload);

      // No error response => status()/json() should NOT have been called
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('returns 400 + error JSON when payload is invalid', () => {
      // ─── Arrange ─────────────────────────────────────────────────────────
      const req: MockReq = { [source]: { ...invalidPayload } };
      const res: MockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      const next: NextFunction = vi.fn();

      // ─── Act ────────────────────────────────────────────────────────────
      mw(req as Request, res as Response<ErrorResponse>, next);

      // ─── Assert ─────────────────────────────────────────────────────────
      // next() should NOT be called on validation failure
      expect(next).not.toHaveBeenCalled();

      // res.status should be called with HTTP_STATUS.BAD_REQUEST (400)
      expect(res.status).toHaveBeenCalledOnce();
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);

      // res.json should be called once with an object matching ErrorResponse
      expect(res.json).toHaveBeenCalledOnce();
      const sent = (res.json as Mock)?.mock?.calls?.[0]?.[0] as ErrorResponse;

      expect(sent.title).toBe(HTTP_LABEL.BAD_REQUEST);
      expect(sent.code).toBe(HTTP_STATUS.BAD_REQUEST);

      // message should start with "Request validation failed:" and include both Zod messages
      expect(sent.message).toContain('Request validation failed:');
      expect(sent.message).toContain('foo is required');
      expect(sent.message).toContain('bar must be a non-negative integer');
    });
  });
});
