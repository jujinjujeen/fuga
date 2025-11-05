import { BASE_URL } from '@f/fe/constants';
import type { PresignResponse } from '@f/types/api-schemas';

export async function getPresignedUrl(
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<PresignResponse> {
  const response = await fetch(`${BASE_URL}/api/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, fileType, fileSize }),
  });

  if (!response.ok) {
    throw new Error('Failed to get presigned URL');
  }

  return response.json();
}
