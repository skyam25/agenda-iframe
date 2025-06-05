const config = require('../../src/config');

describe('Configuration', () => {
  describe('validateConfig', () => {
    it('should validate successfully with all required fields', () => {
      expect(() => config.validateConfig()).not.toThrow();
    });

    it('should have correct default values', () => {
      expect(config.server.port).toBe('0'); // From test setup
      expect(config.server.nodeEnv).toBe('test');
      expect(config.zoom.apiBaseUrl).toBe('https://api.zoom.us/v2');
      expect(config.zoom.oauthUrl).toBe('https://zoom.us/oauth/token');
    });

    it('should have required zoom configuration', () => {
      expect(config.zoom.accountId).toBe('test_account_id');
      expect(config.zoom.clientId).toBe('test_client_id');
      expect(config.zoom.clientSecret).toBe('test_client_secret');
    });

    it('should have cache configuration', () => {
      expect(config.cache.ttl).toBeGreaterThan(0);
      expect(config.cache.maxSize).toBeGreaterThan(0);
    });

    it('should have CORS configuration', () => {
      expect(Array.isArray(config.cors.devOrigins)).toBe(true);
      expect(config.cors.devOrigins.length).toBeGreaterThan(0);
    });
  });
});