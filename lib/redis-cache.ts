// Redis Cache Implementation with In-Memory Fallback

// Type for cache entry with expiration
interface CacheEntry {
  data: any;
  expiry: number;
}

// In-memory cache as fallback
const memoryCache = new Map<string, CacheEntry>();

// Maximum cache size to prevent memory leaks
const MAX_MEMORY_CACHE_SIZE = 100;

/**
 * Redis cache service with in-memory fallback
 * In production, this would use a real Redis client
 */
class RedisCacheService {
  private redisClient: any | null = null;
  private isRedisAvailable: boolean = false;
  
  constructor() {
    this.initRedisClient();
  }
  
  /**
   * Initialize Redis client if available
   * This would use a real Redis client in production
   */
  private async initRedisClient() {
    try {
      // In a real implementation, we would initialize Redis here
      // Example with ioredis:
      // const Redis = require('ioredis');
      // this.redisClient = new Redis(process.env.REDIS_URL);
      
      // For now, we'll use in-memory cache
      this.isRedisAvailable = false;
      console.log('Using in-memory cache as fallback');
    } catch (error) {
      console.error('Redis initialization failed, using in-memory cache', error);
      this.isRedisAvailable = false;
    }
  }
  
  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached data or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    if (this.isRedisAvailable && this.redisClient) {
      try {
        const cachedData = await this.redisClient.get(key);
        if (!cachedData) return null;
        
        return JSON.parse(cachedData);
      } catch (error) {
        console.error('Redis get error, falling back to memory cache', error);
        return this.getFromMemoryCache<T>(key);
      }
    }
    
    return this.getFromMemoryCache<T>(key);
  }
  
  /**
   * Set a value in cache with expiration
   * @param key Cache key
   * @param data Data to cache
   * @param ttlSeconds Time to live in seconds
   */
  async set(key: string, data: any, ttlSeconds: number = 60): Promise<void> {
    if (this.isRedisAvailable && this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(data), 'EX', ttlSeconds);
        return;
      } catch (error) {
        console.error('Redis set error, falling back to memory cache', error);
        this.setInMemoryCache(key, data, ttlSeconds);
      }
    } else {
      this.setInMemoryCache(key, data, ttlSeconds);
    }
  }
  
  /**
   * Delete a value from cache
   * @param key Cache key
   */
  async delete(key: string): Promise<void> {
    if (this.isRedisAvailable && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (error) {
        console.error('Redis delete error', error);
      }
    }
    
    memoryCache.delete(key);
  }
  
  /**
   * Invalidate all cache entries that match a pattern
   * @param pattern Pattern to match (e.g., "study-offers:*")
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (this.isRedisAvailable && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(pattern);
        if (keys && keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch (error) {
        console.error('Redis invalidatePattern error', error);
      }
    }
    
    // For memory cache, we'll just invalidate keys that start with the pattern prefix
    // (without the wildcard)
    const patternPrefix = pattern.replace('*', '');
    for (const key of memoryCache.keys()) {
      if (key.startsWith(patternPrefix)) {
        memoryCache.delete(key);
      }
    }
  }
  
  /**
   * Get a value from the in-memory cache
   * @param key Cache key
   * @returns Cached data or null if not found or expired
   */
  private getFromMemoryCache<T>(key: string): T | null {
    const entry = memoryCache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (entry.expiry < now) {
      memoryCache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  /**
   * Set a value in the in-memory cache with expiration
   * @param key Cache key
   * @param data Data to cache
   * @param ttlSeconds Time to live in seconds
   */
  private setInMemoryCache(key: string, data: any, ttlSeconds: number): void {
    const now = Date.now();
    const expiry = now + (ttlSeconds * 1000);
    
    memoryCache.set(key, { data, expiry });
    
    // Limit cache size
    if (memoryCache.size > MAX_MEMORY_CACHE_SIZE) {
      // Get the oldest entries first
      const entries = Array.from(memoryCache.entries())
        .sort((a, b) => a[1].expiry - b[1].expiry);
      
      // Delete the oldest entries until we're under the limit
      const entriesToDelete = entries.slice(0, entries.length - MAX_MEMORY_CACHE_SIZE);
      for (const [entryKey] of entriesToDelete) {
        memoryCache.delete(entryKey);
      }
    }
  }
}

// Export singleton instance
export const redisCache = new RedisCacheService(); 