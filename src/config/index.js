const path = require('path');

// Load environment variables
require('dotenv').config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3004,
    nodeEnv: process.env.NODE_ENV || 'development',
    widgetDomain: process.env.WIDGET_DOMAIN || `http://localhost:${process.env.PORT || 3004}`
  },

  // Zoom API Configuration
  zoom: {
    accountId: process.env.ZOOM_ACCOUNT_ID,
    clientId: process.env.ZOOM_CLIENT_ID,
    clientSecret: process.env.ZOOM_CLIENT_SECRET,
    apiBaseUrl: process.env.ZOOM_API_BASE_URL || 'https://api.zoom.us/v2',
    oauthUrl: process.env.ZOOM_OAUTH_URL || 'https://zoom.us/oauth/token',
    defaultEventId: process.env.DEFAULT_EVENT_ID
  },

  // CORS Configuration
  cors: {
    devOrigins: [
      'http://localhost:3000',
      'http://localhost:3004',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3004',
      'http://127.0.0.1:8080'
    ]
  },

  // Cache Configuration
  cache: {
    ttl: 10 * 60 * 1000, // 10 minutes in milliseconds
    maxSize: 100, // Maximum number of cached items (memory cache)
    redis: {
      enabled: process.env.REDIS_ENABLED === 'true',
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      ttl: parseInt(process.env.REDIS_TTL) || 30 * 60 // 30 minutes in seconds
    }
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    skipSuccessfulRequests: false
  },

  // Static Paths
  paths: {
    public: path.join(__dirname, '../../public'),
    demo: path.join(__dirname, '../../demo'),
    root: path.join(__dirname, '../..')
  }
};

// Validation function
function validateConfig() {
  const requiredZoomFields = ['accountId', 'clientId', 'clientSecret'];
  const missingFields = requiredZoomFields.filter(field => !config.zoom[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required Zoom configuration: ${missingFields.join(', ')}`);
  }

  if (!config.zoom.defaultEventId) {
    console.warn('⚠️  No DEFAULT_EVENT_ID configured - embed-code endpoint may require eventId parameter');
  }

  return true;
}

// Development vs Production overrides
if (config.server.nodeEnv === 'production') {
  config.cache.ttl = 30 * 60 * 1000; // 30 minutes in production
  config.rateLimit.max = 500; // Stricter rate limiting in production
}

module.exports = {
  ...config,
  validateConfig
};