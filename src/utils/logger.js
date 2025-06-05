const winston = require('winston');
const config = require('../config');

// Custom format for combining timestamp, level, and message
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.server.nodeEnv === 'development' ? 'debug' : 'info',
  format: logFormat,
  defaultMeta: {
    service: 'zoom-agenda-widget',
    environment: config.server.nodeEnv
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    })
  ]
});

// Add file transports in production
if (config.server.nodeEnv === 'production') {
  // Create logs directory if it doesn't exist
  const fs = require('fs');
  const path = require('path');
  const logsDir = path.join(config.paths.root, 'logs');
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Add file transports
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
  
  logger.add(new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 10
  }));
}

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request start
  logger.info('Request started', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    correlationId: req.id || Date.now()
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    
    logger[logLevel]('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      correlationId: req.id || Date.now()
    });
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Security event logger
const securityLogger = {
  corsViolation: (origin, path) => {
    logger.warn('CORS violation detected', {
      origin,
      path,
      event: 'cors_violation',
      severity: 'medium'
    });
  },
  
  rateLimitExceeded: (ip, path) => {
    logger.warn('Rate limit exceeded', {
      ip,
      path,
      event: 'rate_limit_exceeded',
      severity: 'medium'
    });
  },
  
  validationError: (ip, path, errors) => {
    logger.warn('Input validation failed', {
      ip,
      path,
      errors,
      event: 'validation_error',
      severity: 'low'
    });
  },
  
  unauthorizedAccess: (ip, path, reason) => {
    logger.error('Unauthorized access attempt', {
      ip,
      path,
      reason,
      event: 'unauthorized_access',
      severity: 'high'
    });
  }
};

// API event logger
const apiLogger = {
  zoomApiCall: (endpoint, duration, success) => {
    const logLevel = success ? 'info' : 'error';
    logger[logLevel]('Zoom API call', {
      endpoint,
      duration: `${duration}ms`,
      success,
      event: 'zoom_api_call'
    });
  },
  
  cacheHit: (key) => {
    logger.debug('Cache hit', {
      key,
      event: 'cache_hit'
    });
  },
  
  cacheMiss: (key) => {
    logger.debug('Cache miss', {
      key,
      event: 'cache_miss'
    });
  },
  
  cacheExpired: (key) => {
    logger.debug('Cache expired', {
      key,
      event: 'cache_expired'
    });
  }
};

// Performance logger
const performanceLogger = {
  slowRequest: (req, duration) => {
    logger.warn('Slow request detected', {
      method: req.method,
      url: req.originalUrl,
      duration: `${duration}ms`,
      event: 'slow_request',
      threshold: '1000ms'
    });
  },
  
  memoryUsage: () => {
    const usage = process.memoryUsage();
    logger.info('Memory usage', {
      rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(usage.external / 1024 / 1024)} MB`,
      event: 'memory_usage'
    });
  }
};

module.exports = {
  logger,
  requestLogger,
  securityLogger,
  apiLogger,
  performanceLogger
};