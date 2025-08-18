// lib/sharing/__tests__/phoneVerification.test.ts
import {
  extractLastFourDigits,
  isValidPhoneDigitsFormat,
  sanitizePhoneDigits,
  verifyPhoneDigits,
  validatePhoneDigitsInput,
} from '../phoneVerification';

describe('PhoneVerification', () => {
  describe('extractLastFourDigits', () => {
    it('should extract last 4 digits from a phone number', () => {
      expect(extractLastFourDigits('1234567890')).toBe('7890');
      expect(extractLastFourDigits('+91-9876543210')).toBe('3210');
      expect(extractLastFourDigits('(555) 123-4567')).toBe('4567');
    });

    it('should handle phone numbers with various formats', () => {
      expect(extractLastFourDigits('+1 (555) 123-4567')).toBe('4567');
      expect(extractLastFourDigits('555.123.4567')).toBe('4567');
      expect(extractLastFourDigits('555 123 4567')).toBe('4567');
    });

    it('should pad with zeros if less than 4 digits', () => {
      expect(extractLastFourDigits('123')).toBe('0123');
      expect(extractLastFourDigits('12')).toBe('0012');
      expect(extractLastFourDigits('1')).toBe('0001');
    });

    it('should handle empty or invalid input', () => {
      expect(extractLastFourDigits('')).toBe('0000');
      expect(extractLastFourDigits('abc')).toBe('0000');
      expect(extractLastFourDigits('no-digits-here')).toBe('0000');
    });
  });

  describe('isValidPhoneDigitsFormat', () => {
    it('should validate correct 4-digit format', () => {
      expect(isValidPhoneDigitsFormat('1234')).toBe(true);
      expect(isValidPhoneDigitsFormat('0000')).toBe(true);
      expect(isValidPhoneDigitsFormat('9999')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidPhoneDigitsFormat('123')).toBe(false); // Too short
      expect(isValidPhoneDigitsFormat('12345')).toBe(false); // Too long
      expect(isValidPhoneDigitsFormat('12a4')).toBe(false); // Contains letter
      expect(isValidPhoneDigitsFormat('12-34')).toBe(false); // Contains hyphen
      expect(isValidPhoneDigitsFormat('')).toBe(false); // Empty
    });
  });

  describe('sanitizePhoneDigits', () => {
    it('should remove non-numeric characters', () => {
      expect(sanitizePhoneDigits('12a3b4')).toBe('1234');
      expect(sanitizePhoneDigits('12-34')).toBe('1234');
      expect(sanitizePhoneDigits('(12)34')).toBe('1234');
      expect(sanitizePhoneDigits('12.34')).toBe('1234');
    });

    it('should limit to 4 digits', () => {
      expect(sanitizePhoneDigits('123456789')).toBe('1234');
      expect(sanitizePhoneDigits('12345')).toBe('1234');
    });

    it('should handle edge cases', () => {
      expect(sanitizePhoneDigits('')).toBe('');
      expect(sanitizePhoneDigits('abc')).toBe('');
      // @ts-expect-error testing invalid input types
      expect(sanitizePhoneDigits(null)).toBe('');
      // @ts-expect-error testing invalid input types
      expect(sanitizePhoneDigits(undefined)).toBe('');
    });
  });

  describe('verifyPhoneDigits', () => {
    it('should verify correct phone digits', () => {
      expect(verifyPhoneDigits('1234', '9876541234')).toBe(true);
      expect(verifyPhoneDigits('5678', '+91-9876545678')).toBe(true);
      expect(verifyPhoneDigits('9999', '(555) 123-9999')).toBe(true);
    });

    it('should reject incorrect phone digits', () => {
      expect(verifyPhoneDigits('1234', '9876545678')).toBe(false);
      expect(verifyPhoneDigits('0000', '9876541234')).toBe(false);
    });

    it('should handle formatted input', () => {
      expect(verifyPhoneDigits('12-34', '9876541234')).toBe(true);
      expect(verifyPhoneDigits('(12)34', '9876541234')).toBe(true);
    });

    it('should reject invalid input formats', () => {
      expect(verifyPhoneDigits('123', '9876541234')).toBe(false); // Too short
      expect(verifyPhoneDigits('12345', '9876541234')).toBe(false); // Too long
      expect(verifyPhoneDigits('abcd', '9876541234')).toBe(false); // Non-numeric
    });
  });

  describe('validatePhoneDigitsInput', () => {
    it('should validate correct input', () => {
      const result = validatePhoneDigitsInput('1234');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('1234');
      expect(result.error).toBeUndefined();
    });

    it('should validate and sanitize formatted input', () => {
      const result = validatePhoneDigitsInput('12-34');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('1234');
    });

    it('should reject empty input', () => {
      const result = validatePhoneDigitsInput('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone digits are required');
    });

    it('should reject non-string input', () => {
      // @ts-expect-error testing invalid input types
      const result = validatePhoneDigitsInput(1234);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone digits must be a string');
    });

    it('should reject input with no digits', () => {
      const result = validatePhoneDigitsInput('abcd');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter numeric digits only');
    });

    it('should reject input with too few digits', () => {
      const result = validatePhoneDigitsInput('123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter exactly 4 digits');
    });

    it('should reject input with too many digits', () => {
      const result = validatePhoneDigitsInput('12345');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter only 4 digits');
    });
  });
});