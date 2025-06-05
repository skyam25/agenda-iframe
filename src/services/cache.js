const redis = require('redis');
const config = require('../config');
const { logger, apiLogger } = require('../utils/logger');

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.redisClient = null;
    this.isRedisConnected = false;
    
    if (config.cache.redis.enabled) {
      this.initializeRedis();
    }
  }

  async initializeRedis() {
    try {
      this.redisClient = redis.createClient({
        url: config.cache.redis.url,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.warn('Redis connection refused, falling back to memory cache');
            return null; // Don't retry
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            logger.error('Redis retry time exhausted');
            return null;
          }
          if (options.attempt > 10) {
            logger.error('Redis retry attempts exhausted');
            return null;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.redisClient.on('error', (err) => {
        logger.error('Redis client error', { error: err.message });
        this.isRedisConnected = false;
      });

      this.redisClient.on('connect', () => {
        logger.info('Redis client connected successfully');
        this.isRedisConnected = true;
      });

      this.redisClient.on('disconnect', () => {
        logger.warn('Redis client disconnected, falling back to memory cache');
        this.isRedisConnected = false;
      });

      await this.redisClient.connect();
      
    } catch (error) {
      logger.warn('Failed to connect to Redis, using memory cache only', {
        error: error.message
      });
      this.isRedisConnected = false;
    }
  }

  getCacheKey(prefix, key) {
    return `zoom_agenda:${prefix}:${key}`;
  }

  async get(prefix, key) {
    const cacheKey = this.getCacheKey(prefix, key);
    
    // Try Redis first if available
    if (this.isRedisConnected && this.redisClient) {
      try {
        const value = await this.redisClient.get(cacheKey);
        if (value) {
          apiLogger.cacheHit(cacheKey);
          return JSON.parse(value);
        }
      } catch (error) {
        logger.warn('Redis get operation failed, falling back to memory', {
          key: cacheKey,
          error: error.message
        });
        this.isRedisConnected = false;
      }
    }

    // Fallback to memory cache
    const memoryKey = `${prefix}:${key}`;
    const cached = this.memoryCache.get(memoryKey);
    if (cached && Date.now() < cached.expiry) {
      apiLogger.cacheHit(memoryKey);
      return cached.data;
    }
    
    if (cached) {
      apiLogger.cacheExpired(memoryKey);
      this.memoryCache.delete(memoryKey);
    } else {
      apiLogger.cacheMiss(cacheKey);
    }
    
    return null;
  }

  async set(prefix, key, value, customTtl = null) {
    const cacheKey = this.getCacheKey(prefix, key);
    const data = JSON.stringify(value);
    
    // Try Redis first if available
    if (this.isRedisConnected && this.redisClient) {
      try {
        const ttl = customTtl || config.cache.redis.ttl;
        await this.redisClient.setEx(cacheKey, ttl, data);
        logger.debug('Data cached in Redis', {
          key: cacheKey,
          ttl: `${ttl}s`
        });
        return;
      } catch (error) {
        logger.warn('Redis set operation failed, falling back to memory', {
          key: cacheKey,
          error: error.message
        });
        this.isRedisConnected = false;
      }
    }

    // Fallback to memory cache
    const memoryKey = `${prefix}:${key}`;
    
    // Clean up memory cache if it's getting too large
    if (this.memoryCache.size >= config.cache.maxSize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }

    const ttl = customTtl ? customTtl * 1000 : config.cache.ttl;
    this.memoryCache.set(memoryKey, {
      data: value,
      expiry: Date.now() + ttl
    });
    
    logger.debug('Data cached in memory', {
      key: memoryKey,
      ttl: `${ttl}ms`
    });
  }

  async delete(prefix, key) {
    const cacheKey = this.getCacheKey(prefix, key);
    
    // Delete from Redis if available
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(cacheKey);
      } catch (error) {
        logger.warn('Redis delete operation failed', {
          key: cacheKey,
          error: error.message
        });
      }
    }

    // Delete from memory cache
    const memoryKey = `${prefix}:${key}`;
    this.memoryCache.delete(memoryKey);
    
    logger.debug('Cache entry deleted', { key: cacheKey });
  }

  async clear(prefix = null) {
    // Clear Redis cache
    if (this.isRedisConnected && this.redisClient) {
      try {
        if (prefix) {
          const pattern = this.getCacheKey(prefix, '*');
          const keys = await this.redisClient.keys(pattern);
          if (keys.length > 0) {
            await this.redisClient.del(keys);
          }
        } else {
          await this.redisClient.flushDb();
        }
      } catch (error) {
        logger.warn('Redis clear operation failed', {
          prefix,
          error: error.message
        });
      }
    }

    // Clear memory cache
    if (prefix) {
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(`${prefix}:`)) {
          this.memoryCache.delete(key);
        }
      }
    } else {
      this.memoryCache.clear();
    }
    
    logger.info('Cache cleared', { prefix: prefix || 'all' });
  }

  getStats() {
    const redisStatus = this.isRedisConnected ? 'connected' : 'disconnected';
    const memorySize = this.memoryCache.size;
    const memoryKeys = Array.from(this.memoryCache.keys());
    
    return {
      redis: {
        enabled: config.cache.redis.enabled,
        status: redisStatus,
        url: config.cache.redis.url
      },
      memory: {
        size: memorySize,
        maxSize: config.cache.maxSize,
        keys: memoryKeys
      },
      config: {
        memoryTtl: config.cache.ttl,
        redisTtl: config.cache.redis.ttl
      }
    };
  }

  async healthCheck() {
    const stats = this.getStats();
    
    // Test Redis connection if enabled
    if (config.cache.redis.enabled && this.redisClient) {
      try {
        await this.redisClient.ping();
        stats.redis.status = 'healthy';
      } catch (error) {
        stats.redis.status = 'unhealthy';
        stats.redis.error = error.message;
      }
    }
    
    return stats;
  }

  async disconnect() {
    if (this.redisClient && this.isRedisConnected) {
      try {
        await this.redisClient.disconnect();
        logger.info('Redis client disconnected');
      } catch (error) {
        logger.error('Error disconnecting Redis client', {
          error: error.message
        });
      }
    }
  }
}

// Export singleton instance
module.exports = new CacheService();