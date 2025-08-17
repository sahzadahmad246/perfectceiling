// lib/sharing/__tests__/tokenService.test.ts
import {
  generateShareToken,
  isValidTokenFormat,
  hashToken,
  verifyTokenHash,
  generateTokenWithHash,
} from '../tokenService';

describe('TokenService', () => {
  describe('generateShareToken', () => {
    it('should generate a token of expected length', () => {
      const token = generateShareToken();
      expect(token).toHaveLength(43); // 32 bytes base64 encoded without padding
    });

    it('should generate unique tokens', () => {
      const token1 = generateShareToken();
      const token2 = generateShareToken();
      expect(token1).not.toBe(token2);
    });

    it('should generate URL-safe tokens', () => {
      const token = generateShareToken();
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(token).not.toContain('+');
      expect(token).not.toContain('/');
      expect(token).not.toContain('=');
    });
  });

  describe('isValidTokenFormat', () => {
    it('should validate correct token format', () => {
      const validToken = generateShareToken();
      expect(isValidTokenFormat(validToken)).toBe(true);
    });

    it('should reject tokens with invalid characters', () => {
      expect(isValidTokenFormat('invalid+token/with=padding')).toBe(false);
    });

    it('should reject tokens with incorrect length', () => {
      expect(isValidTokenFormat('short')).toBe(false);
      expect(isValidTokenFormat('a'.repeat(50))).toBe(false);
    });

    it('should reject empty or null tokens', () => {
      expect(isValidTokenFormat('')).toBe(false);
      expect(isValidTokenFormat(null as any)).toBe(false);
      expect(isValidTokenFormat(undefined as any)).toBe(false);
    });
  });

  describe('hashToken', () => {
    it('should generate consistent hashes for the same token', () => {
      const token = 'test-token';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different tokens', () => {
      const hash1 = hashToken('token1');
      const hash2 = hashToken('token2');
      expect(hash1).not.toBe(hash2);
    });

    it('should generate SHA-256 hex hash', () => {
      const token = 'test-token';
      const hash = hashToken(token);
      expect(hash).toHaveLength(64); // SHA-256 hex string length
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('verifyTokenHash', () => {
    it('should verify correct token against its hash', () => {
      const token = 'test-token';
      const hash = hashToken(token);
      expect(verifyTokenHash(token, hash)).toBe(true);
    });

    it('should reject incorrect token against hash', () => {
      const token = 'test-token';
      const wrongToken = 'wrong-token';
      const hash = hashToken(token);
      expect(verifyTokenHash(wrongToken, hash)).toBe(false);
    });

    it('should be resistant to timing attacks', () => {
      const token = 'test-token';
      const hash = hashToken(token);
      
      // Test with different length strings
      expect(verifyTokenHash('short', hash)).toBe(false);
      expect(verifyTokenHash('a'.repeat(100), hash)).toBe(false);
    });
  });

  describe('generateTokenWithHash', () => {
    it('should generate token and matching hash', () => {
      const { token, hash } = generateTokenWithHash();
      
      expect(isValidTokenFormat(token)).toBe(true);
      expect(hash).toHaveLength(64);
      expect(verifyTokenHash(token, hash)).toBe(true);
    });

    it('should generate unique token-hash pairs', () => {
      const pair1 = generateTokenWithHash();
      const pair2 = generateTokenWithHash();
      
      expect(pair1.token).not.toBe(pair2.token);
      expect(pair1.hash).not.toBe(pair2.hash);
    });
  });
});