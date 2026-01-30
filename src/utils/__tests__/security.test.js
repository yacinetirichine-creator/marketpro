// ============================================
// MARKET PRO - TESTS UTILITAIRES SÉCURITÉ
// Tests pour les fonctions de sécurité
// ============================================

import {
  generateSecureId,
  hashPassword,
  validatePassword,
  sanitizeInput,
  isValidEmail,
  sanitizeForLog
} from '../security';

describe('Security Utilities', () => {
  describe('generateSecureId', () => {
    it('should generate an ID with default length', () => {
      const id = generateSecureId();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate an ID with custom length', () => {
      const id = generateSecureId(32);
      expect(id).toBeDefined();
      expect(id.length).toBe(32);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateSecureId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const hash = await hashPassword('testPassword123');
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe('testPassword123');
    });

    it('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword('samePassword');
      const hash2 = await hashPassword('samePassword');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const isValid = await validatePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const hash = await hashPassword('correctPassword');
      const isValid = await validatePassword('wrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML tags', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    it('should handle normal text', () => {
      const input = 'Hello World';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('Hello World');
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });

    it('should sanitize multiple HTML elements', () => {
      const input = '<div onclick="hack()">Text</div><img src="x" onerror="evil()">';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<div');
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('<img');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.fr')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('sanitizeForLog', () => {
    it('should mask sensitive fields', () => {
      const data = {
        username: 'john',
        password: 'secret123',
        email: 'john@example.com'
      };
      const sanitized = sanitizeForLog(data);
      expect(sanitized.username).toBe('john');
      expect(sanitized.password).toBe('[MASKED]');
      expect(sanitized.email).toBe('john@example.com');
    });

    it('should handle nested objects', () => {
      const data = {
        user: {
          name: 'john',
          credentials: {
            password: 'secret',
            token: 'abc123'
          }
        }
      };
      const sanitized = sanitizeForLog(data);
      expect(sanitized.user.credentials.password).toBe('[MASKED]');
      expect(sanitized.user.credentials.token).toBe('[MASKED]');
    });

    it('should handle arrays', () => {
      const data = {
        users: [
          { name: 'john', password: 'pass1' },
          { name: 'jane', password: 'pass2' }
        ]
      };
      const sanitized = sanitizeForLog(data);
      expect(sanitized.users[0].password).toBe('[MASKED]');
      expect(sanitized.users[1].password).toBe('[MASKED]');
    });
  });
});
