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
  fields: Record<string, string>,
  file: File
): Promise<void> {
  // Create FormData with presigned POST fields
  const formData = new FormData();

  // Add all fields from presigned POST response (must be added before file)
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // Add the file last
  formData.append('file', file);

  // Upload using POST with FormData
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file to presigned URL');
  }
}
