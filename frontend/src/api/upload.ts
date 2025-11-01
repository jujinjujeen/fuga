import type { PresignResponse, ErrorResponse } from '@f/types/api-schemas';
const BASE_URL = import.meta.env.VITE_BASE_URL || '';

export async function getPresignedUrl(
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<PresignResponse | ErrorResponse> {
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

export async function uploadFileToPresignedUrl(
  url: string,
  file: File
): Promise<void> {
  const response = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  if (!response.ok) {
    throw new Error('Failed to upload file to presigned URL');
  }
}
