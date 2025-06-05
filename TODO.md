# TODO - Production Implementation Tasks

## 🔐 CORS Management for SaaS Customers

### Current State
- **Development:** Allows localhost origins for testing
- **Production:** Temporarily allows all HTTPS origins (secure but permissive)
- **Security:** Requires HTTPS in production, blocks HTTP

### Required Implementation

#### 1. Database Schema for Customer Domains
```sql
-- Customer domains table
CREATE TABLE customer_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  domain VARCHAR(255) NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, domain)
);

-- Events to customers mapping
CREATE TABLE customer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  event_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, event_id)
);
```

#### 2. Replace CORS Function
**File:** `server/proxy-server.js:62-64`

Current TODO comment:
```javascript
// TODO: Implement database lookup: 
// const isAllowed = await checkCustomerDomain(origin);
```

**Implementation needed:**
```javascript
async function checkCustomerDomain(origin, eventId) {
  try {
    // Extract domain from origin
    const domain = new URL(origin).hostname;
    
    // Query database to check if domain is allowed for this customer/event
    const result = await db.query(`
      SELECT cd.domain 
      FROM customer_domains cd
      JOIN customer_events ce ON cd.customer_id = ce.customer_id
      WHERE cd.domain = $1 
        AND ce.event_id = $2 
        AND cd.verified = true
    `, [domain, eventId]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('CORS domain check failed:', error);
    return false;
  }
}

// Update CORS to use database lookup
const corsOptions = {
  origin: async function (origin, callback) {
    // ... existing same-origin logic ...
    
    // Get eventId from request (need to extract from URL or headers)
    const eventId = extractEventIdFromRequest(req);
    const isAllowed = await checkCustomerDomain(origin, eventId);
    
    if (isAllowed) {
      console.log(`✅ Customer domain verified: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ Unauthorized domain: ${origin}`);
      callback(new Error('Domain not authorized for this customer'));
    }
  }
};
```

#### 3. Admin Panel Features Needed

**Customer Domain Management:**
- [ ] Add domain to customer account
- [ ] Domain verification process (DNS TXT record or file upload)
- [ ] Domain removal/deactivation
- [ ] Bulk domain import via CSV
- [ ] Subdomain wildcard support (*.example.com)

**Event Management:**
- [ ] Associate Zoom events with customer accounts
- [ ] Event access control per customer
- [ ] Event-specific domain restrictions

#### 4. Domain Verification Process

**Option A: DNS TXT Record Verification**
```javascript
const dns = require('dns').promises;

async function verifyDomainOwnership(domain, customerToken) {
  try {
    const txtRecords = await dns.resolveTxt(domain);
    const verificationRecord = `zoom-widget-verify=${customerToken}`;
    
    return txtRecords.some(record => 
      record.join('').includes(verificationRecord)
    );
  } catch (error) {
    return false;
  }
}
```

**Option B: File Upload Verification**
```javascript
async function verifyDomainFile(domain, customerToken) {
  try {
    const verificationUrl = `https://${domain}/.well-known/zoom-widget-verify.txt`;
    const response = await axios.get(verificationUrl);
    return response.data.trim() === customerToken;
  } catch (error) {
    return false;
  }
}
```

#### 5. Enhanced Security Features

**Rate Limiting per Domain:**
```javascript
const rateLimit = require('express-rate-limit');

// Create rate limiter per domain
const createDomainLimiter = (domain) => rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each domain to 1000 requests per windowMs
  keyGenerator: (req) => domain,
  message: 'Too many requests from this domain'
});
```

**API Key Authentication (Alternative approach):**
```javascript
// Require API key for widget usage
app.use('/api', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // Validate API key and get customer info
  const customer = await validateApiKey(apiKey);
  if (!customer) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  req.customer = customer;
  next();
});
```

#### 6. Configuration Options

**Environment Variables to Add:**
```bash
# CORS Configuration
CORS_MODE=database  # Options: permissive, database, api-key
DOMAIN_VERIFICATION_REQUIRED=true
MAX_DOMAINS_PER_CUSTOMER=10

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Security
API_KEY_HEADER=x-api-key
RATE_LIMIT_PER_DOMAIN=1000
RATE_LIMIT_WINDOW_MS=900000
```

#### 7. Testing Requirements

**Unit Tests Needed:**
- [ ] CORS domain validation logic
- [ ] Domain verification functions
- [ ] Database query functions
- [ ] Rate limiting per domain

**Integration Tests Needed:**
- [ ] End-to-end domain verification flow
- [ ] Widget embedding from verified domains
- [ ] Rate limiting enforcement
- [ ] Error handling for unverified domains

#### 8. Monitoring & Analytics

**Metrics to Track:**
- [ ] Requests per domain per customer
- [ ] Failed CORS requests by domain
- [ ] Domain verification success/failure rates
- [ ] Widget usage by customer

**Logging Requirements:**
- [ ] All CORS decisions with domain and customer info
- [ ] Domain verification attempts
- [ ] Rate limit violations
- [ ] Security violations

#### 9. Documentation Needed

**For Customers:**
- [ ] How to add domains to their account
- [ ] Domain verification process
- [ ] Embedding instructions
- [ ] Troubleshooting CORS issues

**For Internal Team:**
- [ ] CORS implementation details
- [ ] Database schema documentation
- [ ] Security considerations
- [ ] Monitoring and alerting setup

---

## 🔧 Additional Production Readiness Tasks

### Code Quality & Organization
- [ ] Split monolithic `proxy-server.js` into modules
- [ ] Add comprehensive error handling
- [ ] Implement structured logging (Winston)
- [ ] Add health checks and monitoring endpoints

### Testing Infrastructure
- [ ] Set up Jest testing framework
- [ ] Add API endpoint tests
- [ ] Add integration tests
- [ ] Set up test database

### Build & Deployment
- [ ] Add Docker containerization
- [ ] Set up CI/CD pipeline
- [ ] Add environment-specific configurations
- [ ] Implement blue-green deployment

### Performance & Scaling
- [ ] Add Redis caching layer
- [ ] Implement connection pooling
- [ ] Add load balancing support
- [ ] Performance monitoring

### Security Hardening
- [ ] Add Helmet.js for security headers
- [ ] Implement API versioning
- [ ] Add request signing/verification
- [ ] Regular security audits

---

## Priority Order

1. **🔴 High Priority:** CORS database implementation
2. **🟡 Medium Priority:** Domain verification system
3. **🟢 Low Priority:** Advanced monitoring and analytics

## Estimated Timeline
- **CORS + Database:** 2-3 days
- **Domain Verification:** 1-2 days  
- **Admin Panel Integration:** 3-5 days
- **Testing & Documentation:** 2-3 days

**Total Estimated Time:** 8-13 days for full production readiness