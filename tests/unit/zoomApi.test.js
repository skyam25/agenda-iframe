const zoomApi = require('../../src/services/zoomApi');
const axios = require('axios');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('ZoomAPIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    zoomApi.clearCache();
    zoomApi.accessToken = null;
    zoomApi.tokenExpiry = null;
  });

  describe('getAccessToken', () => {
    it('should get new access token when none exists', async () => {
      const mockTokenResponse = {
        data: {
          access_token: 'test_token',
          expires_in: 3600
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockTokenResponse);

      const token = await zoomApi.getAccessToken();

      expect(token).toBe('test_token');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://zoom.us/oauth/token',
        expect.stringContaining('grant_type=account_credentials'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Basic /)
          })
        })
      );
    });

    it('should reuse valid token', async () => {
      // Set a valid token
      zoomApi.accessToken = 'cached_token';
      zoomApi.tokenExpiry = Date.now() + 1000000; // Far in the future

      const token = await zoomApi.getAccessToken();

      expect(token).toBe('cached_token');
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should handle authentication errors', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid credentials' }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(zoomApi.getAccessToken()).rejects.toThrow('Failed to authenticate with Zoom API');
    });
  });

  describe('cache management', () => {
    it('should cache GET responses', async () => {
      const mockTokenResponse = {
        data: { access_token: 'test_token', expires_in: 3600 }
      };
      const mockApiResponse = {
        data: { sessions: [{ id: 1, name: 'Test Session' }] }
      };

      mockedAxios.post.mockResolvedValueOnce(mockTokenResponse);
      mockedAxios.mockResolvedValueOnce(mockApiResponse);

      // First call should hit API
      const result1 = await zoomApi.makeRequest('/test-endpoint');
      
      // Second call should use cache (no additional API calls)
      const result2 = await zoomApi.makeRequest('/test-endpoint');

      expect(result1).toEqual(mockApiResponse.data);
      expect(result2).toEqual(mockApiResponse.data);
      
      // Check that cache service is working
      const cacheStats = await zoomApi.getCacheStats();
      expect(cacheStats).toHaveProperty('memory');
    });

    it('should return cache statistics', async () => {
      const stats = await zoomApi.getCacheStats();
      
      expect(stats).toHaveProperty('memory');
      expect(stats).toHaveProperty('redis');
      expect(stats).toHaveProperty('config');
    });

    it('should clear cache', async () => {
      // Test that clearCache method works
      await zoomApi.clearCache();
      
      const stats = await zoomApi.getCacheStats();
      expect(stats).toHaveProperty('memory');
    });
  });

  describe('API methods', () => {
    beforeEach(() => {
      const mockTokenResponse = {
        data: { access_token: 'test_token', expires_in: 3600 }
      };
      mockedAxios.post.mockResolvedValue(mockTokenResponse);
    });

    it('should get event sessions', async () => {
      const mockResponse = {
        data: { sessions: [{ id: 1, name: 'Session 1' }] }
      };
      mockedAxios.mockResolvedValueOnce(mockResponse);

      const sessions = await zoomApi.getEventSessions('test_event');

      expect(sessions).toEqual([{ id: 1, name: 'Session 1' }]);
    });

    it('should get event details', async () => {
      const mockResponse = {
        data: { id: 'test_event', name: 'Test Event' }
      };
      mockedAxios.mockResolvedValueOnce(mockResponse);

      const event = await zoomApi.getEventDetails('test_event');

      expect(event).toEqual({ id: 'test_event', name: 'Test Event' });
    });

    it('should get event speakers', async () => {
      const mockResponse = {
        data: { speakers: [{ id: 1, name: 'Speaker 1' }] }
      };
      mockedAxios.mockResolvedValueOnce(mockResponse);

      const speakers = await zoomApi.getEventSpeakers('test_event');

      expect(speakers).toEqual([{ id: 1, name: 'Speaker 1' }]);
    });
  });
});