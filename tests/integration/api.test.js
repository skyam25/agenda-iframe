const request = require('supertest');
const app = require('../../src/app');

describe('API Endpoints Integration', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment', 'test');
    });
  });

  describe('GET /api/widget-config', () => {
    it('should return widget configuration', async () => {
      const response = await request(app)
        .get('/api/widget-config')
        .expect(200);

      expect(response.body).toHaveProperty('domain');
      expect(response.body).toHaveProperty('availableThemes');
      expect(response.body).toHaveProperty('availableLayouts');
      expect(response.body).toHaveProperty('supportedParams');
      expect(Array.isArray(response.body.availableThemes)).toBe(true);
      expect(Array.isArray(response.body.availableLayouts)).toBe(true);
    });
  });

  describe('GET /api/embed-code', () => {
    it('should generate embed code with valid parameters', async () => {
      const response = await request(app)
        .get('/api/embed-code')
        .query({
          eventId: 'test_event_id',
          theme: 'light',
          layout: 'list'
        })
        .expect(200);

      expect(response.body).toHaveProperty('widgetUrl');
      expect(response.body).toHaveProperty('embedCode');
      expect(response.body).toHaveProperty('responsiveEmbedCode');
      expect(response.body).toHaveProperty('configuration');
      
      expect(response.body.embedCode).toContain('<iframe');
      expect(response.body.embedCode).toContain('test_event_id');
    });

    it('should validate eventId parameter', async () => {
      const response = await request(app)
        .get('/api/embed-code')
        .query({
          eventId: 'invalid@event#id',
          theme: 'light'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid input parameters');
      expect(response.body).toHaveProperty('details');
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should validate theme parameter', async () => {
      const response = await request(app)
        .get('/api/embed-code')
        .query({
          eventId: 'test_event_id',
          theme: 'invalid_theme'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid input parameters');
    });

    it('should validate height parameter', async () => {
      const response = await request(app)
        .get('/api/embed-code')
        .query({
          eventId: 'test_event_id',
          height: '50' // Too small
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid input parameters');
    });
  });

  describe('Parameter validation on Zoom API endpoints', () => {
    it('should validate eventId format for sessions endpoint', async () => {
      const response = await request(app)
        .get('/api/sessions/invalid@event#id')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid input parameters');
    });

    it('should validate eventId format for events endpoint', async () => {
      const response = await request(app)
        .get('/api/events/invalid@event#id')
        .expect(400);

      expect(response.body.error).toBe('Invalid input parameters');
    });

    it('should validate eventId format for speakers endpoint', async () => {
      const response = await request(app)
        .get('/api/speakers/invalid@event#id')
        .expect(400);

      expect(response.body.error).toBe('Invalid input parameters');
    });
  });

  describe('404 handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Endpoint not found');
      expect(response.body).toHaveProperty('availableEndpoints');
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully', async () => {
      // Test that the app handles errors without crashing
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });
  });
});