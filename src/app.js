const express = require('express');
const path = require('path');
const config = require('./config');
const { logger, requestLogger } = require('./utils/logger');

// Import middleware
const corsMiddleware = require('./middleware/cors');
const { apiRateLimit } = require('./middleware/rateLimit');
const { 
  compressionMiddleware, 
  securityMiddleware, 
  timingMiddleware, 
  cacheControlMiddleware 
} = require('./middleware/performance');

// Import routes
const apiRoutes = require('./routes/api');
const widgetRoutes = require('./routes/widget');

const app = express();

// Validate configuration at startup
try {
  config.validateConfig();
  logger.info('Configuration validated successfully');
} catch (error) {
  logger.error('Configuration validation failed', { error: error.message });
  process.exit(1);
}

// Performance and security middleware
app.use(timingMiddleware);
app.use(compressionMiddleware);
app.use(securityMiddleware);
app.use(cacheControlMiddleware);

// Logging middleware  
app.use(requestLogger);

// Basic middleware
app.use(corsMiddleware);
app.use(express.json());

// Log static directories
logger.info('Static directories configured', {
  agenda: config.paths.public,
  demo: config.paths.demo
});

// Static file serving
app.use('/agenda', express.static(config.paths.public));
app.use('/demo', express.static(config.paths.demo));

// Apply rate limiting to API routes
app.use('/api', apiRateLimit);

// Routes
app.use('/api', apiRoutes);
app.use('/', widgetRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Path ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /agenda/',
      'GET /demo/',
      'GET /api/sessions/:eventId',
      'GET /api/events/:eventId',
      'GET /api/speakers/:eventId',
      'GET /api/embed-code',
      'GET /api/widget-config'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error occurred', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  
  // CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS policy violation',
      message: 'Origin not allowed by CORS policy'
    });
  }
  
  // Generic error response
  res.status(500).json({
    error: 'Internal server error',
    message: config.server.nodeEnv === 'development' ? err.message : 'Something went wrong',
    ...(config.server.nodeEnv === 'development' && { stack: err.stack })
  });
});

module.exports = app;