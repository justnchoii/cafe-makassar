const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload image to MinIO
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
router.post('/', uploadController.uploadMiddleware, uploadController.uploadImage);

module.exports = router;
