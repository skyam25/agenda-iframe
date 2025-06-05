const compression = require('compression');
const helmet = require('helmet');
const config = require('../config');

// Compression middleware
const compressionMiddleware = compression({
  // Compress all responses
  filter: (req, res) => {
    // Don't compress responses if the client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Fallback to standard filter function
    return compression.filter(req, res);
  },
  
  // Compression level (1-9, 6 is default)
  level: config.server.nodeEnv === 'production' ? 6 : 1,
  
  // Only compress responses that are at least this size (in bytes)
  threshold: 1024
});

// Security headers middleware
const securityMiddleware = helmet({
  // Configure Content Security Policy for iframe embedding
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for widget
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for widget
      imgSrc: ["'self'", "data:", "https:"], // Allow images from HTTPS sources
      connectSrc: ["'self'", "https://api.zoom.us"], // Allow connections to Zoom API
      frameSrc: ["'self'"], // Allow same-origin frames
      frameAncestors: ["*"] // Allow embedding in any frame (for SaaS customers)
    }
  },
  
  // Cross-Origin Embedder Policy - allow iframe embedding
  crossOriginEmbedderPolicy: false,
  
  // X-Frame-Options - allow iframe embedding
  frameguard: {
    action: 'sameorigin' // Can be embedded by same origin, customize per customer
  },
  
  // HSTS - enforce HTTPS in production
  hsts: config.server.nodeEnv === 'production' ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  } : false
});

// Request timing middleware
const timingMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Add performance headers before response is sent
  if (config.server.nodeEnv === 'development') {
    res.set('X-Request-Start', start.toString());
  }
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = duration > 1000 ? 'warn' : 'info';
    
    console[logLevel](`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// Cache control middleware for static assets
const cacheControlMiddleware = (req, res, next) => {
  // Set cache headers based on request path
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    // Static assets - cache for 1 hour in development, 1 day in production
    const maxAge = config.server.nodeEnv === 'production' ? 86400 : 3600;
    res.set('Cache-Control', `public, max-age=${maxAge}`);
  } else if (req.path.startsWith('/api/')) {
    // API responses - short cache for dynamic content
    res.set('Cache-Control', 'public, max-age=60'); // 1 minute
  } else {
    // Default - no cache for HTML pages
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  
  next();
};

module.exports = {
  compressionMiddleware,
  securityMiddleware,
  timingMiddleware,
  cacheControlMiddleware
};