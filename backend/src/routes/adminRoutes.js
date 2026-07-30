const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');
const cafeController = require('../controllers/cafeController');
const { uploadMiddleware, uploadImage } = require('../controllers/uploadController');

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Wrong password
 */
router.post('/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ success: false, message: 'ADMIN_PASSWORD not configured.' });
  }

  if (!password || password !== adminPassword) {
    return res.status(401).json({ success: false, message: 'Password salah.' });
  }

  res.json({ success: true, token: adminPassword });
});

// All routes below require admin auth
router.use(adminAuth);

/**
 * @swagger
 * /api/admin/cafes:
 *   post:
 *     summary: Create new cafe (admin)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 */
router.post('/cafes', cafeController.createCafe);

/**
 * @swagger
 * /api/admin/cafes/{id}:
 *   put:
 *     summary: Update cafe (admin)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 */
router.put('/cafes/:id', cafeController.updateCafe);

/**
 * @swagger
 * /api/admin/cafes/{id}:
 *   delete:
 *     summary: Delete cafe (admin)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 */
router.delete('/cafes/:id', cafeController.deleteCafe);

/**
 * @swagger
 * /api/admin/upload:
 *   post:
 *     summary: Upload cafe image (admin)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 */
router.post('/upload', uploadMiddleware, uploadImage);

module.exports = router;
