const axios = require('axios');
const config = require('../config');
const { logger, apiLogger } = require('../utils/logger');
const cacheService = require('./cache');

class ZoomAPIService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
    // Fallback memory cache for tokens (not using Redis for tokens for security)
    this.tokenCache = new Map();
  }

  // Get access token with caching
  async getAccessToken() {
    // Check if current token is still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(
        `${config.zoom.clientId}:${config.zoom.clientSecret}`
      ).toString('base64');

      const response = await axios.post(
        config.zoom.oauthUrl,
        'grant_type=account_credentials&account_id=' + config.zoom.accountId,
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 90% of actual expiry to ensure refresh before expiration
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000 * 0.9);
      
      logger.info('Zoom access token refreshed successfully', {
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type
      });
      return this.accessToken;

    } catch (error) {
      logger.error('Failed to get Zoom access token', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error('Failed to authenticate with Zoom API');
    }
  }

  // Cache management using the new cache service
  getCacheKey(endpoint) {
    return endpoint.replace(/\//g, '_');
  }

  // Make Zoom API request with caching
  async makeRequest(endpoint, method = 'GET', data = null) {
    const start = Date.now();
    
    // Check cache for GET requests
    if (method === 'GET') {
      const cacheKey = this.getCacheKey(endpoint);
      const cached = await cacheService.get('zoom_api', cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const token = await this.getAccessToken();
      const response = await axios({
        method,
        url: `${config.zoom.apiBaseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
        timeout: 15000,
      });

      const responseData = response.data;
      const duration = Date.now() - start;

      // Log successful API call
      apiLogger.zoomApiCall(endpoint, duration, true);

      // Cache GET responses using the cache service
      if (method === 'GET') {
        const cacheKey = this.getCacheKey(endpoint);
        await cacheService.set('zoom_api', cacheKey, responseData);
      }

      return responseData;
    } catch (error) {
      const duration = Date.now() - start;
      apiLogger.zoomApiCall(endpoint, duration, false);
      
      logger.error('Zoom API request failed', {
        endpoint,
        method,
        duration: `${duration}ms`,
        status: error.response?.status,
        error: error.response?.data || error.message
      });
      throw error;
    }
  }

  // Specific API methods
  async getEventSessions(eventId) {
    const data = await this.makeRequest(`/zoom_events/events/${eventId}/sessions`);
    return data.sessions || [];
  }

  async getEventDetails(eventId) {
    return await this.makeRequest(`/zoom_events/events/${eventId}`);
  }

  async getEventSpeakers(eventId) {
    const data = await this.makeRequest(`/zoom_events/events/${eventId}/speakers`);
    return data.speakers || [];
  }

  // Clear cache (useful for testing)
  async clearCache() {
    await cacheService.clear('zoom_api');
    logger.info('Zoom API cache cleared', {
      event: 'cache_cleared'
    });
  }

  // Get cache statistics
  async getCacheStats() {
    return await cacheService.getStats();
  }
}

// Export singleton instance
module.exports = new ZoomAPIService();