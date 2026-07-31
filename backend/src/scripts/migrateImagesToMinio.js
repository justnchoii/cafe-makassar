require('dotenv').config();
const mongoose = require('mongoose');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { minioClient, initMinio } = require('../config/minio');
const { getMinioBucketName } = require('../config/imageStorage');
const Cafe = require('../models/Cafe');

const PUBLIC_DIR = path.resolve(__dirname, '..', '..', '..', 'frontend', 'public');

function downloadToBuffer(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadToBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
  return types[ext] || 'image/jpeg';
}

function buildMinioUrl(fileName) {
  const publicUrl = (process.env.MINIO_PUBLIC_URL || '').replace(/\/+$/, '');
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';
  const base = publicUrl || `http://${endpoint}:${port}`;
  const bucket = getMinioBucketName();
  return `${base}/${bucket}/${fileName}`;
}

function isAlreadyMinioUrl(url) {
  if (!url) return false;
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';
  const publicUrl = process.env.MINIO_PUBLIC_URL || '';
  return url.includes(`${endpoint}:${port}`) || (publicUrl && url.startsWith(publicUrl));
}

async function uploadBuffer(buffer, fileName) {
  const bucket = getMinioBucketName();
  await minioClient.putObject(bucket, fileName, buffer, buffer.length, {
    'Content-Type': getContentType(fileName),
  });
  return buildMinioUrl(fileName);
}

function fileNameFromUrl(url) {
  const match = url.match(/photo-([a-z0-9-]+)/i);
  return match ? `unsplash-${match[1]}.jpg` : `image-${Date.now()}.jpg`;
}

async function processImage(cafe) {
  const { image, name } = cafe;
  if (!image) return null;

  if (isAlreadyMinioUrl(image)) {
    console.log(`⏭️  ${name}: sudah di MinIO`);
    return image;
  }

  // File lokal: /goodfields-makassar.png
  if (image.startsWith('/')) {
    const fileName = path.basename(image);
    const filePath = path.join(PUBLIC_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${name}: file lokal tidak ada (${fileName})`);
      return image;
    }
    const buffer = fs.readFileSync(filePath);
    const minioUrl = await uploadBuffer(buffer, fileName);
    console.log(`✅ ${name}: ${fileName} → MinIO`);
    return minioUrl;
  }

  // URL eksternal (Unsplash dll) — download dulu lalu upload
  if (/^https?:\/\//i.test(image)) {
    const fileName = fileNameFromUrl(image);
    try {
      const buffer = await downloadToBuffer(image);
      const minioUrl = await uploadBuffer(buffer, fileName);
      console.log(`✅ ${name}: Unsplash → MinIO (${fileName})`);
      return minioUrl;
    } catch (err) {
      console.log(`⚠️  ${name}: gagal download (${err.message})`);
      return image;
    }
  }

  return image;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  await initMinio();
  console.log('✅ MinIO ready\n');

  const cafes = await Cafe.find({});
  console.log(`Memproses ${cafes.length} cafe...\n`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const cafe of cafes) {
    const newUrl = await processImage(cafe);
    if (!newUrl) { failed++; continue; }
    if (newUrl === cafe.image) { skipped++; continue; }
    await Cafe.updateOne({ _id: cafe._id }, { image: newUrl });
    migrated++;
  }

  console.log(`\n🎉 Selesai!`);
  console.log(`   Migrasi: ${migrated} cafe`);
  console.log(`   Dilewati: ${skipped} cafe`);
  console.log(`   Gagal: ${failed} cafe`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
