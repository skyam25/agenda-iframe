# Zoom Agenda Iframe Widget

SaaS-ready embeddable iframe solution for Zoom event agendas with secure multi-tenant support, perfect for white-label integration into customer websites.

## Features

### Core Functionality
- **Multi-tenant architecture** - Serve multiple customers from single deployment
- **Modular Express.js structure** - Clean separation of concerns with services, middleware, and routes
- **Comprehensive testing** - 25+ Jest unit and integration tests
- **Multiple layouts** - List, grid, and compact display options with responsive design

### Security & Performance
- **Advanced security** - HTTPS-only CORS, input validation, rate limiting, helmet.js protection
- **Multi-tier caching** - Redis with memory fallback for optimal performance
- **Structured logging** - Winston with correlation IDs, security, API, and performance logging
- **Response compression** - Gzip compression and optimized static asset serving
- **Input validation** - express-validator protection against injection attacks

### User Experience
- **Multiple themes** - Light, dark, minimal, custom colors with CSS variables
- **Responsive design** - Auto-resizing, mobile-friendly with touch optimizations
- **Interactive demo** - Visual configuration generator with live preview
- **Modular CSS/JS** - Extracted from inline for better maintainability and performance

## Prerequisites

### 1. Zoom Developer Account
- Create account at [marketplace.zoom.us](https://marketplace.zoom.us)
- Create Server-to-Server OAuth app
- Add required scopes:
  ```
  event:read:list_events:admin
  event:read:event:admin
  event:read:list_sessions:admin
  event:read:session:admin
  ```
- Get credentials: Account ID, Client ID, Client Secret

### 2. Test Event Setup
- Visit [events.zoom.us](https://events.zoom.us)
- Create multi-session event
- Copy Event ID

## Quick Start

### 1. Configure Credentials

**IMPORTANT**: Never commit real credentials to git. Always use environment variables or a separate `.env` file.

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual Zoom credentials
export ZOOM_ACCOUNT_ID="your_account_id"
export ZOOM_CLIENT_ID="your_client_id"
export ZOOM_CLIENT_SECRET="your_client_secret"
export DEFAULT_EVENT_ID="your_event_id"
```

### 2. Install Dependencies & Start Server
```bash
cd zoom-agenda-iframe
npm install
npm start
```

Server starts on `http://localhost:3004` with:
- Widget: `http://localhost:3004/agenda/`
- Demo: `http://localhost:3004/demo/`
- Health check: `http://localhost:3004/health`

### 3. Optional: Redis Setup (Recommended)
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

The application automatically falls back to memory caching if Redis is unavailable.

### 4. Customer Integration

Customers embed the widget directly on their HTTPS websites:
```html
<iframe 
  src="https://YOUR_DOMAIN_HERE/agenda/?eventId=customer_event_id&theme=light&layout=list"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none;">
</iframe>
```

Or use the embed code generator API:
```javascript
const response = await fetch('/api/embed-code?eventId=customer_event_id&theme=light');
const { embedCode, responsiveEmbedCode } = await response.json();
```

## Configuration Options

### Content Configuration
- `eventId` - Zoom event ID (required)
- `title` - Widget title (default: "Event Agenda")
- `apiBaseUrl` - API base URL (auto-detected in production)

### Layout & Styling
- `layout` - Display format: `list` (default), `grid`, `compact`
- `theme` - Predefined themes: `light` (default), `dark`, `minimal`
- `maxWidth` - Container max width (default: 1200px)
- Custom colors: `bgColor`, `cardBg`, `titleColor`, `sessionNameColor`, `timeColor`, `descColor`, `speakerColor`
- Advanced styling: `cardRadius`, `cardShadow`, `cardPadding`, `titleAlign`

### Behavior Options
- `autoResize` - Enable iframe auto-resizing (default: true)
- `disableHover` - Disable card hover effects (default: false)
- `showSpeakers` - Display speaker information (default: true)
- `refreshInterval` - Auto-refresh interval in seconds (optional)
- `debug` - Enable debug logging (default: false)

### Example URL
```
/agenda/?eventId=abc123&theme=dark&layout=grid&showSpeakers=true&autoResize=true
```

## Embed Code Types

**Basic**: Fixed size iframe  
**Responsive**: Scales with container  
**Advanced**: JavaScript with auto-resize

## Project Structure
```
zoom-agenda-iframe/
├── src/                      # Modular Express.js application
│   ├── config/
│   │   └── index.js         # Centralized configuration management
│   ├── services/
│   │   ├── zoomApi.js       # Zoom API integration with caching
│   │   └── cache.js         # Multi-tier caching (Redis + memory)
│   ├── middleware/
│   │   ├── cors.js          # CORS policy management
│   │   ├── validation.js    # Input validation with express-validator
│   │   ├── rateLimiting.js  # API rate limiting
│   │   └── performance.js   # Compression, security headers, timing
│   ├── routes/
│   │   ├── api.js           # API endpoints for session data
│   │   └── widget.js        # Widget and health endpoints
│   ├── utils/
│   │   └── logger.js        # Winston structured logging
│   └── server.js            # Application entry point
├── public/                   # Widget assets (served at /agenda/)
│   ├── index.html           # Widget HTML structure
│   ├── css/widget.css       # Modular widget styles
│   └── js/widget.js         # Extracted widget functionality
├── demo/                     # Demo interface (served at /demo/)
│   ├── index.html           # Configuration generator
│   ├── config.js            # Demo configuration
│   └── README.md            # Demo documentation
├── tests/                    # Comprehensive test suite
│   ├── unit/                # Unit tests for services
│   ├── integration/         # Integration tests for APIs
│   └── jest.config.js       # Jest configuration
└── package.json             # Dependencies and scripts
```

## Security & Performance

### Security Features
- **HTTPS-only CORS policy** - Blocks non-secure origins in production
- **Input validation** - express-validator on all API parameters
- **Rate limiting** - Per-IP protection against API abuse
- **Security headers** - helmet.js with CSP, HSTS, X-Frame-Options
- **Server-side authentication** - Zoom credentials never exposed to client
- **XSS prevention** - Input escaping and sanitization

### Performance Optimizations
- **Multi-tier caching** - Redis primary with memory fallback (600s TTL)
- **Response compression** - Gzip compression for all responses
- **Static asset optimization** - Proper cache headers and serving
- **Request timing** - Performance monitoring and logging
- **Modular architecture** - Separated CSS/JS for better browser caching

### Production Architecture
- **Stateless design** - Horizontal scaling ready
- **Environment-aware configuration** - Development vs production settings
- **Structured logging** - Winston with correlation IDs and multiple loggers
- **Health monitoring** - Comprehensive health checks and cache statistics
- **Testing coverage** - 25+ unit and integration tests

### Development Tools
```bash
npm test          # Run test suite
npm run test:watch # Watch mode for development
npm run dev       # Development mode with auto-restart
npm start         # Production mode
```

## API Endpoints

### Widget Endpoints
- `GET /agenda/` - Iframe widget (embeddable)
- `GET /demo/` - Interactive configuration demo
- `GET /health` - Health check with cache statistics

### SaaS Integration API
- `GET /api/sessions/:eventId` - Get event sessions (cached, validated)
- `GET /api/events/:eventId` - Get event details (cached, validated)
- `GET /api/speakers/:eventId` - Get event speakers (cached, validated)
- `GET /api/embed-code` - Generate embed code with validation
- `GET /api/widget-config` - Get widget configuration options

### Cache Management
- Cache TTL: 600 seconds (10 minutes)
- Automatic Redis fallback to memory cache
- Cache statistics available via `/health` endpoint
- Manual cache clearing available in services

All endpoints include:
- Input validation with express-validator
- Rate limiting protection
- Structured logging with correlation IDs
- Error handling and appropriate HTTP status codes
- CORS policy enforcement
