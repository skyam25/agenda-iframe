# Claude Project Context - Zoom Agenda Iframe Widget

## Project Overview
SaaS-ready embeddable iframe widget for displaying Zoom event agendas. Designed for white-label integration where customers embed the widget on their own websites.

## Architecture
- **Modular Express.js server** (`src/`) - Clean separation of concerns
- **Configuration management** (`src/config/`) - Environment-aware settings
- **Business logic** (`src/services/`) - Zoom API client with Redis caching + memory fallback
- **Middleware stack** (`src/middleware/`) - CORS, validation, performance, security headers
- **Modular widget** (`public/`) - Extracted CSS/JS files, clean HTML structure
- **Demo interface** (`demo/`) - Interactive configuration with live preview
- **Comprehensive testing** (`tests/`) - 25+ unit and integration tests with Jest
- **Production-ready** - Structured logging, compression, caching, security hardening

## Security & Performance
- **CORS Policy**: HTTPS-only in production, localhost allowed in development
- **Input Validation**: express-validator on all API endpoints
- **Rate Limiting**: IP-based protection against abuse
- **Security Headers**: helmet.js with CSP, HSTS, X-Frame-Options
- **Multi-tier Caching**: Redis primary + memory fallback (600s TTL)
- **Structured Logging**: Winston with correlation IDs and performance metrics
- **Response Compression**: Gzip for all responses

## Key Files
- `src/server.js` - Application entry point
- `src/config/index.js` - Centralized configuration management
- `src/services/zoomApi.js` - Zoom API client with caching integration
- `src/services/cache.js` - Multi-tier caching service (Redis + memory)
- `src/utils/logger.js` - Winston structured logging
- `src/middleware/` - CORS, validation, performance, security headers
- `src/routes/` - API and widget endpoint handlers
- `public/css/widget.css` - Modular widget styles (extracted from inline)
- `public/js/widget.js` - Widget functionality (extracted from inline)
- `tests/` - Jest test suite (25+ tests covering unit & integration)
- `.env` - Environment variables (gitignored)

## API Endpoints (Validated & Secured)
- `GET /api/sessions/:eventId` - Event sessions data
- `GET /api/events/:eventId` - Event details
- `GET /api/speakers/:eventId` - Speaker information  
- `GET /api/embed-code` - Generate validated embed code
- `GET /agenda/` - Embeddable widget iframe

## Development Notes
- **Port**: 3004 (configurable via PORT env var)
- **Environment**: NODE_ENV aware (dev vs production configurations)
- **Dependencies**: Express, Redis, Winston, helmet, compression, express-validator, Jest
- **Testing**: `npm test` (watch mode: `npm run test:watch`)
- **Caching**: Redis recommended but auto-falls back to memory if unavailable
- **Layouts**: List (default), Grid (responsive columns), Compact (tight spacing)