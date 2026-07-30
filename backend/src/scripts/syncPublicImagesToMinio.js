require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { minioClient, initMinio } = require('../config/minio');
const { buildMinioObjectUrl, getMinioBucketName } = require('../config/imageStorage');

const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function getContentType(extension) {
  const contentTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
  };

  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
}

async function uploadFile(filePath, fileName) {
  const buffer = fs.readFileSync(filePath);
  const extension = path.extname(fileName);
  const bucket = getMinioBucketName();

  await minioClient.putObject(bucket, fileName, buffer, buffer.length, {
    'Content-Type': getContentType(extension),
  });

  return buildMinioObjectUrl(fileName);
}

async function main() {
  const publicDir = path.resolve(__dirname, '..', '..', '..', 'frontend', 'public');

  if (!fs.existsSync(publicDir)) {
    throw new Error(`Frontend public folder not found: ${publicDir}`);
  }

  await initMinio();

  const files = fs.readdirSync(publicDir)
    .filter(fileName => allowedExtensions.has(path.extname(fileName).toLowerCase()))
    .sort();

  if (!files.length) {
    console.log('No local public images found to upload.');
    return;
  }

  console.log(`Uploading ${files.length} images from ${publicDir} to bucket "${getMinioBucketName()}"...`);

  for (const fileName of files) {
    const filePath = path.join(publicDir, fileName);
    const publicUrl = await uploadFile(filePath, fileName);
    console.log(`Uploaded ${fileName} -> ${publicUrl}`);
  }

  console.log('All frontend public cafe images have been uploaded to MinIO.');
}

main().catch(error => {
  console.error('Failed to sync public images to MinIO.');
  console.error(error.message);
  process.exit(1);
});
