const rateLimit = require('express-rate-limit');
const config = require('../config');

// Rate limiting configuration
const apiRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  skipSuccessfulRequests: config.rateLimit.skipSuccessfulRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded, try again later',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
  },
  handler: (req, res) => {
    console.log(`⚠️  Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded, try again later',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
    });
  }
});

module.exports = {
  apiRateLimit
};