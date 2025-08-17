// lib/sharing/tokenService.ts
import crypto from 'crypto';

/**
 * Generates a cryptographically secure random token for quotation sharing
 * @returns A URL-safe random token string
 */
export function generateShareToken(): string {
  // Generate 32 random bytes and convert to URL-safe base64
  const randomBytes = crypto.randomBytes(32);
  return randomBytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Validates the format of a share token
 * @param token - The token to validate
 * @returns True if the token format is valid
 */
export function isValidTokenFormat(token: string): boolean {
  // Check if token is a valid URL-safe base64 string of expected length
  const tokenRegex = /^[A-Za-z0-9_-]{43}$/;
  return tokenRegex.test(token);
}

/**
 * Hashes a token for secure storage in the database
 * @param token - The token to hash
 * @returns SHA-256 hash of the token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verifies if a provided token matches the stored hash
 * @param token - The token to verify
 * @param hash - The stored hash to compare against
 * @returns True if the token matches the hash
 */
export function verifyTokenHash(token: string, hash: string): boolean {
  const tokenHash = hashToken(token);
  return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hash));
}

/**
 * Generates a secure token and its hash for database storage
 * @returns Object containing the token and its hash
 */
export function generateTokenWithHash(): { token: string; hash: string } {
  const token = generateShareToken();
  const hash = hashToken(token);
  return { token, hash };
}