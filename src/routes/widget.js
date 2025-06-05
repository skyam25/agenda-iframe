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

// Dynamic config endpoint for demo
router.get('/demo/config.js', (req, res) => {
  console.log('Serving dynamic config.js with defaultEventId:', config.zoom.defaultEventId);
  res.setHeader('Content-Type', 'application/javascript');
  
  const defaultEventId = config.zoom.defaultEventId || 'NO_EVENT_ID_FROM_ENV';
  const serverBase = config.server.widgetDomain;
  
  const configContent = `/**
 * Iframe Embed Generator Configuration
 * 
 * Configure default values for the embed generator.
 * This file is loaded by the embed generator HTML page.
 */

window.EMBED_CONFIG = {
    // Widget server (where this iframe server is hosted)
    serverBase: window.location.origin || '${serverBase}',
    
    // API server (working Zoom Events API server)
    apiServerBase: '${serverBase}',
    
    // Default Event ID for quick testing  
    defaultEventId: '${defaultEventId}',
    
    // Default widget configuration
    defaults: {
        title: 'Event Agenda',
        theme: 'light',
        layout: 'list',
        width: '100%',
        height: '600',
        autoResize: true
    },
    
    // Enable debug mode in preview (set to false to fetch real data)
    debugMode: false,
    
    // Force reload timestamp
    _timestamp: Date.now()
};`;
  
  res.send(configContent);
});

module.exports = router;