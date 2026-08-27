const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Chat with AI assistant about cafes in Makassar
 *     tags: [AI Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Rekomendasi cafe aesthetic di Makassar dong"
 *     responses:
 *       200:
 *         description: AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     timestamp:
 *                       type: string
 */
router.post('/', chatController.chat);

/**
 * @swagger
 * /api/chat/stream:
 *   post:
 *     summary: Chat with AI assistant with a real-time streamed response (Server-Sent Events)
 *     description: >
 *       Keeps the HTTP connection open and pushes the AI reply to the client
 *       incrementally as `chunk` events, followed by a final `done` event,
 *       instead of waiting for the full answer before responding.
 *     tags: [AI Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Rekomendasi cafe aesthetic di Makassar dong"
 *     responses:
 *       200:
 *         description: text/event-stream of `chunk` and `done` (or `error`) events
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
router.post('/stream', chatController.chatStream);

module.exports = router;
