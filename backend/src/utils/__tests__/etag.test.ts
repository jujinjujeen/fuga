import { describe, it, expect } from 'vitest';
import {
  generateETag,
  parseETag,
  compareETags,
  validateIfMatch,
} from '../etag';

describe('etag utilities', () => {
  const testDate = new Date('2024-01-01T00:00:00.000Z');
  const testETag = generateETag(testDate);

  describe('generateETag', () => {
    it('generates a weak ETag from a date', () => {
      expect(testETag).toMatch(/^W\/"[a-f0-9]{16}"$/);
    });

    it('generates consistent ETags for the same date', () => {
      const etag1 = generateETag(testDate);
      const etag2 = generateETag(testDate);
      expect(etag1).toBe(etag2);
    });

    it('generates different ETags for different dates', () => {
      const date1 = new Date('2024-01-01T00:00:00.000Z');
      const date2 = new Date('2024-01-01T00:00:01.000Z');
      const etag1 = generateETag(date1);
      const etag2 = generateETag(date2);
      expect(etag1).not.toBe(etag2);
    });
  });

  describe('parseETag', () => {
    it('removes W/ prefix and quotes from weak ETag', () => {
      const parsed = parseETag('W/"abc123"');
      expect(parsed).toBe('abc123');
    });

    it('removes quotes from strong ETag', () => {
      const parsed = parseETag('"abc123"');
      expect(parsed).toBe('abc123');
    });
  });

  describe('compareETags', () => {
    it('returns true for matching weak ETags', () => {
      expect(compareETags('W/"abc123"', 'W/"abc123"')).toBe(true);
    });

    it('returns true for matching weak and strong ETags with same hash', () => {
      expect(compareETags('W/"abc123"', '"abc123"')).toBe(true);
    });

    it('returns false for different ETags', () => {
      expect(compareETags('W/"abc123"', 'W/"def456"')).toBe(false);
    });
  });

  describe('validateIfMatch', () => {
    const resourceETag = 'W/"abc123"';

    it('returns true when If-Match header is not provided', () => {
      expect(validateIfMatch(undefined, resourceETag)).toBe(true);
    });

    it('returns true when If-Match is wildcard', () => {
      expect(validateIfMatch('*', resourceETag)).toBe(true);
    });

    it('returns true when If-Match matches resource ETag', () => {
      expect(validateIfMatch('W/"abc123"', resourceETag)).toBe(true);
    });

    it('returns false when If-Match does not match resource ETag', () => {
      expect(validateIfMatch('W/"different"', resourceETag)).toBe(false);
    });
  });
});
