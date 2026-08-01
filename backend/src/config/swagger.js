const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cafe Makassar API',
      version: '1.0.0',
      description: 'RESTful API untuk Web Cafe Makassar dengan AI Chat',
    },
    servers: [
      {
        url: process.env.PUBLIC_URL || 'http://localhost:5000',
        description: 'API Server',
      },
      {
        url: 'http://localhost:5000',
        description: 'Local server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
