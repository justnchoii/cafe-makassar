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
 *         address:
 *           type: string
 *           example: "Jl. Penghibur No. 10, Makassar"
 *         category:
 *           type: string
 *           enum: [aesthetic, coworking, outdoor, rooftop, traditional]
 *         rating:
 *           type: number
 *           example: 4.5
 *         priceRange:
 *           type: string
 *           enum: [$, $$, $$$]
 *         facilities:
 *           type: array
 *           items:
 *             type: string
 *         openHours:
 *           type: string
 *           example: "08:00 - 23:00"
 *         image:
 *           type: string
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [rating, name]
 *     responses:
 *       200:
 *         description: List of cafes
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
 *     responses:
 *       200:
 *         description: Cafe detail
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
 *         description: Cafe created
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cafe'
 *     responses:
 *       200:
 *         description: Cafe updated
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
 *     responses:
 *       200:
 *         description: Cafe deleted
 */
router.delete('/:id', cafeController.deleteCafe);

module.exports = router;
