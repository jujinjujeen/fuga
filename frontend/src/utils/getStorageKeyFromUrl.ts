const urlPrefix =
  process.env.S3_PUBLIC_ENDPOINT + '/' + process.env.S3_PERM_BUCKET + '/';

export const getStorageKeyFromUrl = (url: string): string => {
  if (!url) return '';

  if (url.startsWith(urlPrefix)) {
    return url.replace(urlPrefix, '');
  }

  return url;
};
