// lib/sharing/rateLimiter.ts

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  blockedUntil?: number;
}

// In-memory storage for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 15 * 60 * 1000, // 15 minutes initial block
  maxBlockDurationMs: 24 * 60 * 60 * 1000, // 24 hours max block
};

/**
 * Generates a rate limit key for an IP address and token combination
 * @param ipAddress - The client IP address
 * @param token - The quotation token (optional, for token-specific limiting)
 * @returns A unique key for rate limiting
 */
function getRateLimitKey(ipAddress: string, token?: string): string {
  return token ? `${ipAddress}:${token}` : ipAddress;
}

/**
 * Calculates exponential backoff duration based on attempt count
 * @param attemptCount - Number of failed attempts
 * @returns Block duration in milliseconds
 */
function calculateBlockDuration(attemptCount: number): number {
  const baseBlock = RATE_LIMIT_CONFIG.blockDurationMs;
  const exponentialBlock = baseBlock * Math.pow(2, attemptCount - RATE_LIMIT_CONFIG.maxAttempts);
  return Math.min(exponentialBlock, RATE_LIMIT_CONFIG.maxBlockDurationMs);
}

/**
 * Checks if an IP address is currently rate limited
 * @param ipAddress - The client IP address
 * @param token - The quotation token (optional)
 * @returns Rate limit status and remaining attempts
 */
export function checkRateLimit(ipAddress: string, token?: string): {
  isBlocked: boolean;
  remainingAttempts: number;
  resetTime?: number;
  blockDuration?: number;
} {
  const key = getRateLimitKey(ipAddress, token);
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry) {
    return {
      isBlocked: false,
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts,
    };
  }

  // Check if currently blocked
  if (entry.blockedUntil && entry.blockedUntil > now) {
    return {
      isBlocked: true,
      remainingAttempts: 0,
      resetTime: entry.blockedUntil,
      blockDuration: entry.blockedUntil - now,
    };
  }

  // Check if window has expired
  const windowExpired = now - entry.firstAttempt > RATE_LIMIT_CONFIG.windowMs;
  if (windowExpired) {
    // Reset the entry
    rateLimitStore.delete(key);
    return {
      isBlocked: false,
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts,
    };
  }

  // Calculate remaining attempts
  const remainingAttempts = Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - entry.attempts);
  
  return {
    isBlocked: false,
    remainingAttempts,
    resetTime: entry.firstAttempt + RATE_LIMIT_CONFIG.windowMs,
  };
}

/**
 * Records a failed verification attempt and updates rate limiting
 * @param ipAddress - The client IP address
 * @param token - The quotation token (optional)
 * @returns Updated rate limit status
 */
export function recordFailedAttempt(ipAddress: string, token?: string): {
  isBlocked: boolean;
  remainingAttempts: number;
  resetTime?: number;
  blockDuration?: number;
} {
  const key = getRateLimitKey(ipAddress, token);
  const now = Date.now();
  let entry = rateLimitStore.get(key);

  if (!entry) {
    entry = {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now,
    };
  } else {
    // Check if window has expired
    const windowExpired = now - entry.firstAttempt > RATE_LIMIT_CONFIG.windowMs;
    if (windowExpired) {
      // Reset the entry
      entry = {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
      };
    } else {
      entry.attempts += 1;
      entry.lastAttempt = now;
    }
  }

  // Check if should be blocked
  if (entry.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
    const blockDuration = calculateBlockDuration(entry.attempts);
    entry.blockedUntil = now + blockDuration;
    
    rateLimitStore.set(key, entry);
    
    return {
      isBlocked: true,
      remainingAttempts: 0,
      resetTime: entry.blockedUntil,
      blockDuration,
    };
  }

  rateLimitStore.set(key, entry);
  
  const remainingAttempts = RATE_LIMIT_CONFIG.maxAttempts - entry.attempts;
  
  return {
    isBlocked: false,
    remainingAttempts,
    resetTime: entry.firstAttempt + RATE_LIMIT_CONFIG.windowMs,
  };
}

/**
 * Records a successful verification attempt (resets rate limiting for the key)
 * @param ipAddress - The client IP address
 * @param token - The quotation token (optional)
 */
export function recordSuccessfulAttempt(ipAddress: string, token?: string): void {
  const key = getRateLimitKey(ipAddress, token);
  rateLimitStore.delete(key);
}

/**
 * Clears expired rate limit entries (cleanup function)
 * Should be called periodically to prevent memory leaks
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [key, entry] of rateLimitStore.entries()) {
    const windowExpired = now - entry.firstAttempt > RATE_LIMIT_CONFIG.windowMs;
    const blockExpired = entry.blockedUntil && entry.blockedUntil <= now;
    
    if (windowExpired || blockExpired) {
      rateLimitStore.delete(key);
      cleanedCount++;
    }
  }

  return cleanedCount;
}

/**
 * Gets current rate limiting statistics (for monitoring)
 * @returns Statistics about current rate limiting state
 */
export function getRateLimitStats(): {
  totalEntries: number;
  blockedEntries: number;
  config: typeof RATE_LIMIT_CONFIG;
} {
  const now = Date.now();
  let blockedEntries = 0;

  for (const entry of rateLimitStore.values()) {
    if (entry.blockedUntil && entry.blockedUntil > now) {
      blockedEntries++;
    }
  }

  return {
    totalEntries: rateLimitStore.size,
    blockedEntries,
    config: RATE_LIMIT_CONFIG,
  };
}

/**
 * Express middleware for rate limiting verification attempts
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function rateLimitMiddleware(req: any, res: any, next: any): void {
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const token = req.params.token;
  
  const rateLimitStatus = checkRateLimit(ipAddress, token);
  
  if (rateLimitStatus.isBlocked) {
    res.status(429).json({
      error: 'Too many verification attempts',
      code: 'RATE_LIMITED',
      details: 'Please try again later',
      resetTime: rateLimitStatus.resetTime,
      blockDuration: rateLimitStatus.blockDuration,
    });
    return;
  }
  
  // Add rate limit info to request for use in handlers
  req.rateLimit = rateLimitStatus;
  next();
}