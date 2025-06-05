const cors = require('cors');
const config = require('../config');

// Enhanced CORS for SaaS iframe embedding
const corsOptions = {
  origin: function (origin, callback) {
    // Allow same-origin requests (no origin header)
    if (!origin) {
      console.log('Same-origin request allowed');
      return callback(null, true);
    }
    
    // For SaaS product - check against customer domains
    if (config.server.nodeEnv === 'development') {
      // Development mode - allow localhost origins
      if (config.cors.devOrigins.includes(origin)) {
        console.log(`✅ Dev origin allowed: ${origin}`);
        return callback(null, true);
      }
    }
    
    // Production mode - validate against customer domains
    // TODO: Implement database lookup when customer management is ready
    
    // For now, log and allow all HTTPS origins (temporary for SaaS)
    if (origin.startsWith('https://')) {
      console.log(`✅ HTTPS origin allowed: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ Non-HTTPS origin blocked: ${origin}`);
      callback(new Error('Only HTTPS origins allowed in production'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);