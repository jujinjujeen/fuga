import { describe, it, expect, vi, Mock, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../errorHandler';

type MockReq = Partial<Request> & Record<string, unknown>;
type MockRes = Partial<Response> & {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
};

describe('errorHandler middleware', () => {
  const originalEnv = process.env.NODE_ENV;

  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let req: MockReq;
  let res: MockRes;
  let next: NextFunction;

  beforeEach(() => {
    // Stub out console.error so it doesn't pollute test output
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    req = {} as MockReq;
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    next = vi.fn();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  it('logs the error and returns 500 + error detail in development mode', () => {
    process.env.NODE_ENV = 'development';
    const testError = new Error('something went wrong');

    errorHandler(testError, req as Request, res as Response, next);

    // console.error should be called once with the prefix and the error itself
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unhandled error:', testError);

    // res.status should be called with 500
    expect(res.status).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);

    // res.json should be called once with the development payload
    expect(res.json).toHaveBeenCalledOnce();
    const payload = (res.json as Mock)?.mock?.calls?.[0]?.[0];
    expect(payload).toEqual({
      message: 'Internal Server Error',
      error: testError,
    });

    // next() should not be called
    expect(next).not.toHaveBeenCalled();
  });

  it('logs the error and returns 500 without revealing error in non-development mode', () => {
    process.env.NODE_ENV = 'production';
    const testError = { code: 123, info: 'details' };

    errorHandler(testError, req as Request, res as Response, next);

    // console.error should be called once with the prefix and the error itself
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unhandled error:', testError);

    // res.status should be called with 500
    expect(res.status).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);

    // res.json should be called once with the production payload (error: undefined)
    expect(res.json).toHaveBeenCalledOnce();
    const payload = (res.json as Mock)?.mock?.calls?.[0]?.[0];
    expect(payload).toEqual({
      message: 'Internal Server Error',
      error: undefined,
    });

    // next() should not be called
    expect(next).not.toHaveBeenCalled();
  });
});
