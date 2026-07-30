function trimTrailingSlash(value) {
  return value ? value.replace(/\/+$/, '') : '';
}

function getMinioBucketName() {
  return process.env.NEXT_PUBLIC_MINIO_BUCKET || 'cafe-images';
}

function getMinioPublicBaseUrl() {
  if (process.env.NEXT_PUBLIC_MINIO_URL) {
    return trimTrailingSlash(process.env.NEXT_PUBLIC_MINIO_URL);
  }

  return '';
}

export function resolveCafeImageUrl(imagePath) {
  if (!imagePath) {
    return imagePath;
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const publicBaseUrl = getMinioPublicBaseUrl();
  if (!publicBaseUrl) {
    return imagePath;
  }

  const fileName = imagePath.split('/').filter(Boolean).pop();
  return `${publicBaseUrl}/${getMinioBucketName()}/${fileName}`;
}
