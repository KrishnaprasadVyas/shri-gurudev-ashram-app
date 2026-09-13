import {
  isValidEmail,
  normalizePhoneNumber,
  isValidPhoneNumber,
  isValidAadhaarNumber,
  isValidPanNumber,
  normalizeDigits,
  isNonEmptyString,
} from '../utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('accepts valid email addresses', () => {
      expect(isValidEmail('devotee@ashram.org')).toBe(true);
      expect(isValidEmail('test.user+tag@domain.co.in')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('normalizePhoneNumber & isValidPhoneNumber', () => {
    it('normalizes 10-digit Indian numbers', () => {
      expect(normalizePhoneNumber('9876543210')).toBe('9876543210');
      expect(isValidPhoneNumber('9876543210')).toBe(true);
    });

    it('strips leading 91 country code when 12 digits', () => {
      expect(normalizePhoneNumber('919876543210')).toBe('9876543210');
      expect(isValidPhoneNumber('919876543210')).toBe(true);
    });

    it('strips leading 0 when 11 digits', () => {
      expect(normalizePhoneNumber('09876543210')).toBe('9876543210');
      expect(isValidPhoneNumber('09876543210')).toBe(true);
    });

    it('strips dashes, spaces, and non-digits', () => {
      expect(normalizePhoneNumber('+91 98765-43210')).toBe('9876543210');
      expect(isValidPhoneNumber('+91 98765-43210')).toBe(true);
    });

    it('rejects numbers not starting with 6, 7, 8, or 9', () => {
      expect(isValidPhoneNumber('1234567890')).toBe(false);
      expect(isValidPhoneNumber('5555555555')).toBe(false);
    });

    it('rejects short or empty phone numbers', () => {
      expect(isValidPhoneNumber('')).toBe(false);
      expect(isValidPhoneNumber('98765')).toBe(false);
    });
  });

  describe('isValidAadhaarNumber', () => {
    it('accepts exactly 12 numeric digits', () => {
      expect(isValidAadhaarNumber('123456789012')).toBe(true);
      expect(isValidAadhaarNumber('999988887777')).toBe(true);
    });

    it('rejects numbers with non-digits or wrong length', () => {
      expect(isValidAadhaarNumber('12345678901')).toBe(false);
      expect(isValidAadhaarNumber('1234567890123')).toBe(false);
      expect(isValidAadhaarNumber('12345678901A')).toBe(false);
      expect(isValidAadhaarNumber('')).toBe(false);
    });
  });

  describe('isValidPanNumber', () => {
    it('accepts valid 10-character PAN format', () => {
      expect(isValidPanNumber('ABCDE1234F')).toBe(true);
      expect(isValidPanNumber('abcde1234f')).toBe(true);
      expect(isValidPanNumber('AAQTS3485B')).toBe(true);
    });

    it('rejects invalid PAN strings', () => {
      expect(isValidPanNumber('ABC123456F')).toBe(false);
      expect(isValidPanNumber('ABCDEF1234')).toBe(false);
      expect(isValidPanNumber('12345ABCDE')).toBe(false);
      expect(isValidPanNumber('ABCDE12345')).toBe(false);
      expect(isValidPanNumber('')).toBe(false);
    });
  });

  describe('normalizeDigits', () => {
    it('truncates to maxLength and strips non-digits', () => {
      expect(normalizeDigits('abc 123 def 456', 4)).toBe('1234');
      expect(normalizeDigits('98765-43210', 10)).toBe('9876543210');
    });
  });

  describe('isNonEmptyString', () => {
    it('returns true for strings with non-whitespace content', () => {
      expect(isNonEmptyString('Swami Ji')).toBe(true);
      expect(isNonEmptyString('  Jai Shri Gurudev  ')).toBe(true);
    });

    it('returns false for empty or whitespace-only strings', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString('   ')).toBe(false);
    });
  });
});
