const { minioClient } = require('../config/minio');
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

exports.uploadMiddleware = upload.single('image');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const bucket = process.env.MINIO_BUCKET || 'cafe-images';
    const fileName = `${Date.now()}-${req.file.originalname}`;
    
    await minioClient.putObject(bucket, fileName, req.file.buffer, req.file.size, {
      'Content-Type': req.file.mimetype,
    });

    const imageUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucket}/${fileName}`;
    
    res.json({ success: true, data: { url: imageUrl, fileName } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
