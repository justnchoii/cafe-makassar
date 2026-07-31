/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'minio', 'images.unsplash.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
};

module.exports = nextConfig;
