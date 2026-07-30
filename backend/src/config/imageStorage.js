const path = require('path');

function trimTrailingSlash(value) {
  return value ? value.replace(/\/+$/, '') : '';
}

function getMinioPublicBaseUrl() {
  if (process.env.MINIO_PUBLIC_URL) {
    return trimTrailingSlash(process.env.MINIO_PUBLIC_URL);
  }

  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';
  const useSSL = String(process.env.MINIO_USE_SSL || 'false').toLowerCase() === 'true';
  const protocol = useSSL ? 'https' : 'http';

  return `${protocol}://${endpoint}:${port}`;
}

function getMinioBucketName() {
  return process.env.MINIO_BUCKET || 'cafe-images';
}

function buildMinioObjectUrl(fileName) {
  return `${getMinioPublicBaseUrl()}/${getMinioBucketName()}/${fileName}`;
}

function resolveStoredImageUrl(imagePath) {
  if (!imagePath) {
    return imagePath;
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const fileName = path.basename(imagePath);
  return buildMinioObjectUrl(fileName);
}

module.exports = {
  buildMinioObjectUrl,
  getMinioBucketName,
  getMinioPublicBaseUrl,
  resolveStoredImageUrl,
};
