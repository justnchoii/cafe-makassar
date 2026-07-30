const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: String(process.env.MINIO_USE_SSL || 'false').toLowerCase() === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const initMinio = async () => {
  const bucket = process.env.MINIO_BUCKET || 'cafe-images';
  const exists = await minioClient.bucketExists(bucket);
  if (!exists) {
    await minioClient.makeBucket(bucket);
    // Set bucket policy to public read
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
    console.log(`✅ MinIO bucket "${bucket}" created`);
  }
};

module.exports = { minioClient, initMinio };
