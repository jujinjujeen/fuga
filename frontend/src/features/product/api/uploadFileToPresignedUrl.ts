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