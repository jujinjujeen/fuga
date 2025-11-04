import crypto from 'crypto';

/**
 * Generates an ETag based on a timestamp
 * Uses weak ETag format (W/"...") for computed values
 *
 * @param updatedAt - The last updated timestamp
 * @returns ETag string in format W/"hash"
 */
export const generateETag = (updatedAt: Date): string => {
  const timestamp = updatedAt.toISOString();
  const hash = crypto
    .createHash('md5')
    .update(timestamp)
    .digest('hex')
    .substring(0, 16);

  return `W/"${hash}"`;
};

/**
 * Parses an ETag from If-Match or If-None-Match header
 * Removes W/ prefix and quotes
 *
 * @param etag - Raw ETag string from header
 * @returns Cleaned ETag hash
 */
export const parseETag = (etag: string): string => {
  return etag.replace(/^W\//, '').replace(/^"|"$/g, '');
};

/**
 * Compares two ETags for equality
 * Handles both weak and strong ETags
 *
 * @param etag1 - First ETag
 * @param etag2 - Second ETag
 * @returns true if ETags match
 */
export const compareETags = (etag1: string, etag2: string): boolean => {
  const parsed1 = parseETag(etag1);
  const parsed2 = parseETag(etag2);
  return parsed1 === parsed2;
};

/**
 * Validates If-Match header against current resource ETag
 * Returns true if the resource can be modified
 *
 * @param ifMatchHeader - If-Match header value from request
 * @param resourceETag - Current resource ETag
 * @returns true if ETags match (can proceed with update)
 */
export const validateIfMatch = (
  ifMatchHeader: string | undefined,
  resourceETag: string
): boolean => {
  if (!ifMatchHeader) {
    // No If-Match header means no conditional request
    return true;
  }

  // Handle wildcard
  if (ifMatchHeader === '*') {
    return true;
  }

  return compareETags(ifMatchHeader, resourceETag);
};
