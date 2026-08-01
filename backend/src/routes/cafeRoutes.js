const express = require('express');
const router = express.Router();
const cafeController = require('../controllers/cafeController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Cafe:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - address
 *         - category
 *         - priceRange
 *       properties:
 *         name:
 *           type: string
 *           example: "Kopi Kenangan Makassar"
 *         description:
 *           type: string
 *           example: "Cafe aesthetic dengan view kota Makassar"
 *         about:
 *           type: string
 *           example: "Cafe dengan konsep industrial yang nyaman"
 *         address:
 *           type: string
 *           example: "Jl. Penghibur No. 10, Makassar"
 *         category:
 *           type: string
 *           enum: [aesthetic, coworking, outdoor, rooftop, traditional, cozy]
 *           example: "aesthetic"
 *         rating:
 *           type: number
 *           example: 4.5
 *         priceRange:
 *           type: string
 *           enum: [$, $$, $$$]
 *           example: "$$"
 *         priceInfo:
 *           type: string
 *           example: "Rp 20.000 - Rp 50.000"
 *         facilities:
 *           type: array
 *           items:
 *             type: string
 *           example: ["WiFi", "AC", "Colokan"]
 *         menu:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Kopi Susu", "Matcha Latte", "Roti Bakar"]
 *         openHours:
 *           type: string
 *           example: "08:00 - 23:00"
 *         suitableFor:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Kerja", "Nongkrong", "Meeting"]
 *         tips:
 *           type: string
 *           example: "Datang sore hari untuk pemandangan sunset terbaik"
 *         favoriteSpot:
 *           type: string
 *           example: "Kursi dekat jendela lantai 2"
 *         mapsLink:
 *           type: string
 *           example: "https://maps.google.com/?q=..."
 *         image:
 *           type: string
 *           example: "https://example.com/image.jpg"
 */

/**
 * @swagger
 * /api/cafes:
 *   get:
 *     summary: Get all cafes
 *     tags: [Cafes]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [aesthetic, coworking, outdoor, rooftop, traditional, cozy]
 *         description: Filter berdasarkan kategori
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Cari berdasarkan nama atau deskripsi
 *         example: "kopi"
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [rating, name]
 *         description: Urutkan hasil
 *     responses:
 *       200:
 *         description: List semua cafe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cafe'
 */
router.get('/', cafeController.getAllCafes);

/**
 * @swagger
 * /api/cafes/{id}:
 *   get:
 *     summary: Get cafe by ID
 *     tags: [Cafes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId cafe
 *         example: "64abc123def456789012"
 *     responses:
 *       200:
 *         description: Detail cafe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cafe'
 *       404:
 *         description: Cafe tidak ditemukan
 */
router.get('/:id', cafeController.getCafeById);

/**
 * @swagger
 * /api/cafes:
 *   post:
 *     summary: Create a new cafe
 *     tags: [Cafes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cafe'
 *     responses:
 *       201:
 *         description: Cafe berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cafe'
 *       400:
 *         description: Data tidak valid
 */
router.post('/', cafeController.createCafe);

/**
 * @swagger
 * /api/cafes/{id}:
 *   put:
 *     summary: Update a cafe
 *     tags: [Cafes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId cafe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cafe'
 *     responses:
 *       200:
 *         description: Cafe berhasil diupdate
 *       404:
 *         description: Cafe tidak ditemukan
 */
router.put('/:id', cafeController.updateCafe);

/**
 * @swagger
 * /api/cafes/{id}:
 *   delete:
 *     summary: Delete a cafe
 *     tags: [Cafes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId cafe
 *     responses:
 *       200:
 *         description: Cafe berhasil dihapus
 *       404:
 *         description: Cafe tidak ditemukan
 */
router.delete('/:id', cafeController.deleteCafe);

module.exports = router;