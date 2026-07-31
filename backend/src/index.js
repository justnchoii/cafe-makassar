require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/database');
const { initMinio, minioClient } = require('./config/minio');
const { getMinioBucketName } = require('./config/imageStorage');
const swaggerSpec = require('./config/swagger');

const cafeRoutes = require('./routes/cafeRoutes');
const chatRoutes = require('./routes/chatRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/cafes', cafeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Image proxy — serves MinIO images via backend so browser always uses port 5000
app.get('/api/images/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const bucket = getMinioBucketName();
    const stat = await minioClient.statObject(bucket, filename);
    const contentType = stat.metaData?.['content-type'] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const stream = await minioClient.getObject(bucket, filename);
    stream.pipe(res);
  } catch {
    res.status(404).json({ error: 'Image not found' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const start = async () => {
  await connectDB();
  try {
    await initMinio();
    console.log('✅ MinIO initialized');
  } catch (err) {
    console.log('⚠️  MinIO not available, continuing without image storage');
  }
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
  });
};

start();
