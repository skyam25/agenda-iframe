# Enhancement: Dual Embed Solution

## Key Requirement
**Critical Objective**: Create two deployment options using the same underlying widget design and build.

- **Shared codebase**: Identical UI/UX, styling, themes, and functionality
- **Only data layer differs**: Iframe uses multi-tenant server; SDK uses customer's direct API calls

## Current State
Single iframe solution with our server handling all Zoom API calls using our credentials.

## Proposed Solutions

### Solution 1: Multi-Tenant Iframe (Enhanced)
**Use Case**: Simple hosted solution with minimal customer setup

**Architecture**:
- Customer embeds iframe: `<iframe src="your-domain.com/agenda/?eventId=...">`
- Multi-tenant server with customer isolation and access control
- Customer provides Zoom App Marketplace credentials during onboarding
- Our server securely manages customer API keys and handles all Zoom API calls

**Requirements**: Customer isolation, secure API key storage, per-customer rate limiting, audit logging

### Solution 2: JavaScript SDK + Customer Proxy (New)
**Use Case**: Direct control and integration using customer's own credentials and infrastructure

**Architecture**:
- Customer includes: `<script src="your-domain.com/sdk/zoom-agenda.js"></script>`
- **Customer runs their own proxy server** to handle Zoom API calls (CORS requirement)
- Customer configures their own Zoom App Marketplace credentials in their proxy
- Widget makes API calls to customer's proxy, which forwards to Zoom APIs
- **Sample proxy provided**: We provide the current Express.js server as a starting template

**Requirements**: 
- Customer deploys and maintains their own proxy server
- Customer manages their own Zoom API credentials and rate limits
- Customer handles CORS, caching, and security on their infrastructure

**Benefits**: Full customer control, no dependency on our infrastructure, complete data ownership

## Implementation Overview

### Technical Approach
**Shared Foundation**: Both solutions use identical widget code with different data layers
- **Multi-tenant iframe**: `fetch(ourServer/api/sessions)` 
- **SDK + customer proxy**: `fetch(customerServer/api/sessions)`

**Proxy Server Template**: Current Express.js server provided as starting point for customers
- Remove multi-tenant logic
- Single customer configuration
- Customer deploys with their own Zoom credentials

### SDK Configuration Example
```javascript
<script src="your-domain.com/sdk/zoom-agenda.js"></script>
<script>
  new ZoomAgendaWidget({
    container: '#agenda-container',
    apiBaseUrl: 'https://customer-domain.com/api', // Customer's proxy server
    eventId: 'customer_event_id',
    theme: 'light',
    layout: 'grid'
  });
</script>
```

## Three Deliverables

### 1. Multi-Tenant Iframe Service (Enhanced Current)
- Hosted at `your-domain.com/agenda/`
- Handles multiple customers with isolation and access control
- Customer embeds iframe, no downloads required

### 2. JavaScript SDK (CDN Hosted) 
- Hosted at `your-domain.com/sdk/zoom-agenda.js`
- Customer includes via `<script>` tag on their site
- Same widget functionality as iframe solution

### 3. Sample Proxy Server (Separate Download)
- **GitHub repository** or **ZIP download** of simplified Express.js server
- Single-tenant version of current server for customer self-hosting
- Customer deploys with their own Zoom API credentials
- Documentation for deployment (Docker, Heroku, AWS, etc.)

## Customer Journey

### Iframe Customers
1. Onboard with Zoom API credentials
2. Embed iframe: `<iframe src="your-domain.com/agenda/?eventId=...">`
3. Done

### SDK Customers  
1. Download proxy server template (GitHub/ZIP)
2. Deploy proxy with their Zoom API credentials
3. Include SDK: `<script src="your-domain.com/sdk/zoom-agenda.js">`
4. Configure widget to point to their proxy server

## Customer Decision Matrix

| Factor | Multi-Tenant Iframe | SDK + Customer Proxy |
|--------|---------------------|---------------------|
| **Setup** | Very Low | High (deploy proxy server) |
| **API Keys** | We manage | Customer manages |
| **Performance** | Good (our caching) | Excellent (customer caching) |
| **Dependencies** | Our server | Customer's proxy server |
| **Updates** | Automatic | Manual (widget + proxy) |
| **Integration** | Simple iframe | Full programmatic control |
| **Infrastructure** | None required | Customer deploys & maintains |

## Success Metrics
- Customer adoption rate per solution
- API performance comparison
- Support ticket reduction
- Customer satisfaction with choice flexibility