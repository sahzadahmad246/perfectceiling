// lib/sharing/cache.ts
import type { QuotationListItem } from "@/types/quotation";

// Simple in-memory cache for shared quotations
// In production, use Redis or similar
class QuotationCache {
  private cache = new Map<string, {
    data: QuotationListItem;
    timestamp: number;
    accessCount: number;
  }>();

  private readonly TTL = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_SIZE = 1000; // Maximum cached items

  /**
   * Get quotation from cache
   */
  get(token: string): QuotationListItem | null {
    const cached = this.cache.get(token);
    
    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(token);
      return null;
    }

    // Update access count for LRU-like behavior
    cached.accessCount++;
    cached.timestamp = Date.now();

    return cached.data;
  }

  /**
   * Set quotation in cache
   */
  set(token: string, quotation: QuotationListItem): void {
    // Implement simple LRU eviction if cache is full
    if (this.cache.size >= this.MAX_SIZE) {
      this.evictLeastUsed();
    }

    this.cache.set(token, {
      data: quotation,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  /**
   * Remove quotation from cache
   */
  delete(token: string): void {
    this.cache.delete(token);
  }

  /**
   * Clear expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [token, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.TTL) {
        this.cache.delete(token);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Evict least recently used items
   */
  private evictLeastUsed(): void {
    let leastUsedToken = '';
    let leastAccessCount = Infinity;
    let oldestTimestamp = Infinity;

    for (const [token, cached] of this.cache.entries()) {
      if (cached.accessCount < leastAccessCount || 
          (cached.accessCount === leastAccessCount && cached.timestamp < oldestTimestamp)) {
        leastUsedToken = token;
        leastAccessCount = cached.accessCount;
        oldestTimestamp = cached.timestamp;
      }
    }

    if (leastUsedToken) {
      this.cache.delete(leastUsedToken);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
  } {
    const size = this.cache.size;
    
    // Calculate approximate memory usage
    let memoryUsage = 0;
    for (const cached of this.cache.values()) {
      memoryUsage += JSON.stringify(cached.data).length * 2; // Rough estimate
    }

    return {
      size,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
      memoryUsage,
    };
  }

  /**
   * Invalidate cache entries for a specific quotation ID
   */
  invalidateQuotation(quotationId: string): number {
    let invalidatedCount = 0;

    for (const [token, cached] of this.cache.entries()) {
      if (cached.data.id === quotationId) {
        this.cache.delete(token);
        invalidatedCount++;
      }
    }

    return invalidatedCount;
  }
}

// Export singleton instance
export const quotationCache = new QuotationCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const cleanedCount = quotationCache.cleanup();
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired cache entries`);
  }
}, 5 * 60 * 1000);

/**
 * Cache middleware for quotation access
 */
export function withQuotationCache<T extends (...args: unknown[]) => Promise<QuotationListItem | null>>(
  fn: T,
  getCacheKey: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>) => {
    const cacheKey = getCacheKey(...args);
    
    // Try to get from cache first
    const cached = quotationCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, call the original function
    const result = await fn(...args);
    
    // Cache the result if it exists
    if (result) {
      quotationCache.set(cacheKey, result);
    }

    return result;
  }) as T;
}