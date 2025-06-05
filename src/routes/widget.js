const express = require('express');
const path = require('path');
const router = express.Router();
const config = require('../config');

// Root endpoint - redirect to demo
router.get('/', (req, res) => {
  console.log(`Root request from ${req.ip}, redirecting to /demo/`);
  res.redirect('/demo/');
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const cacheService = require('../services/cache');
    const cacheHealth = await cacheService.healthCheck();
    
    res.json({
      status: 'ok',
      message: 'Zoom Agenda Widget Service',
      timestamp: new Date().toISOString(),
      widget_url: `${config.server.widgetDomain}/agenda/`,
      demo_url: `${config.server.widgetDomain}/demo/`,
      environment: config.server.nodeEnv,
      cache_health: cacheHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Widget endpoint - serve the iframe content
router.get('/agenda/', (req, res) => {
  res.sendFile(path.join(config.paths.public, 'index.html'));
});

module.exports = router;