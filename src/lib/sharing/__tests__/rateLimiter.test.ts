// lib/sharing/__tests__/rateLimiter.test.ts
import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  cleanupExpiredEntries,
  getRateLimitStats,
} from '../rateLimiter';

// Mock Date.now for consistent testing
const mockNow = jest.fn();
const originalDateNow = Date.now;

beforeAll(() => {
  Date.now = mockNow;
});

afterAll(() => {
  Date.now = originalDateNow;
});

beforeEach(() => {
  mockNow.mockReturnValue(1000000); // Fixed timestamp
  // Clear any existing rate limit data
  cleanupExpiredEntries();
});

describe('RateLimiter', () => {
  const testIP = '192.168.1.1';
  const testToken = 'test-token';

  describe('checkRateLimit', () => {
    it('should allow requests when no previous attempts', () => {
      const result = checkRateLimit(testIP);
      
      expect(result.isBlocked).toBe(false);
      expect(result.remainingAttempts).toBe(5);
      expect(result.resetTime).toBeUndefined();
    });

    it('should track attempts per IP', () => {
      recordFailedAttempt(testIP);
      const result = checkRateLimit(testIP);
      
      expect(result.isBlocked).toBe(false);
      expect(result.remainingAttempts).toBe(4);
    });

    it('should track attempts per IP+token combination', () => {
      recordFailedAttempt(testIP, testToken);
      
      const resultWithToken = checkRateLimit(testIP, testToken);
      const resultWithoutToken = checkRateLimit(testIP);
      
      expect(resultWithToken.remainingAttempts).toBe(4);
      expect(resultWithoutToken.remainingAttempts).toBe(5);
    });
  });

  describe('recordFailedAttempt', () => {
    it('should decrement remaining attempts', () => {
      const result1 = recordFailedAttempt(testIP);
      expect(result1.remainingAttempts).toBe(4);
      
      const result2 = recordFailedAttempt(testIP);
      expect(result2.remainingAttempts).toBe(3);
    });

    it('should block after max attempts', () => {
      // Record 5 failed attempts
      for (let i = 0; i < 4; i++) {
        recordFailedAttempt(testIP);
      }
      
      const result = recordFailedAttempt(testIP);
      
      expect(result.isBlocked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
      expect(result.blockDuration).toBeGreaterThan(0);
    });

    it('should implement exponential backoff', () => {
      // Record 5 failed attempts to get blocked
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(testIP);
      }
      
      // Move time forward to unblock
      mockNow.mockReturnValue(1000000 + 16 * 60 * 1000); // 16 minutes later
      
      // Record another failed attempt
      const result = recordFailedAttempt(testIP);
      
      expect(result.isBlocked).toBe(true);
      expect(result.blockDuration).toBeGreaterThan(15 * 60 * 1000); // Should be longer than initial block
    });

    it('should reset window after expiry', () => {
      recordFailedAttempt(testIP);
      
      // Move time forward beyond window (1 hour + 1 minute)
      mockNow.mockReturnValue(1000000 + 61 * 60 * 1000);
      
      const result = recordFailedAttempt(testIP);
      
      expect(result.remainingAttempts).toBe(4); // Should be reset
    });
  });

  describe('recordSuccessfulAttempt', () => {
    it('should reset rate limiting for successful attempts', () => {
      // Record some failed attempts
      recordFailedAttempt(testIP);
      recordFailedAttempt(testIP);
      
      let result = checkRateLimit(testIP);
      expect(result.remainingAttempts).toBe(3);
      
      // Record successful attempt
      recordSuccessfulAttempt(testIP);
      
      result = checkRateLimit(testIP);
      expect(result.remainingAttempts).toBe(5); // Should be reset
    });
  });

  describe('checkRateLimit with blocking', () => {
    it('should respect block duration', () => {
      // Get blocked
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(testIP);
      }
      
      let result = checkRateLimit(testIP);
      expect(result.isBlocked).toBe(true);
      
      // Move time forward but not enough to unblock
      mockNow.mockReturnValue(1000000 + 10 * 60 * 1000); // 10 minutes later
      
      result = checkRateLimit(testIP);
      expect(result.isBlocked).toBe(true);
      
      // Move time forward enough to unblock
      mockNow.mockReturnValue(1000000 + 20 * 60 * 1000); // 20 minutes later
      
      result = checkRateLimit(testIP);
      expect(result.isBlocked).toBe(false);
    });
  });

  describe('cleanupExpiredEntries', () => {
    it('should remove expired entries', () => {
      recordFailedAttempt(testIP);
      recordFailedAttempt('192.168.1.2');
      
      let stats = getRateLimitStats();
      expect(stats.totalEntries).toBe(2);
      
      // Move time forward beyond window
      mockNow.mockReturnValue(1000000 + 2 * 60 * 60 * 1000); // 2 hours later
      
      const cleanedCount = cleanupExpiredEntries();
      
      expect(cleanedCount).toBe(2);
      stats = getRateLimitStats();
      expect(stats.totalEntries).toBe(0);
    });
  });

  describe('getRateLimitStats', () => {
    it('should return accurate statistics', () => {
      recordFailedAttempt(testIP);
      recordFailedAttempt('192.168.1.2');
      
      // Block one IP
      for (let i = 0; i < 4; i++) {
        recordFailedAttempt('192.168.1.3');
      }
      
      const stats = getRateLimitStats();
      
      expect(stats.totalEntries).toBe(3);
      expect(stats.blockedEntries).toBe(1);
      expect(stats.config).toBeDefined();
    });
  });
});