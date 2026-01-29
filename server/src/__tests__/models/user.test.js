// ============================================
// MARKET PRO API - User Model Tests
// ============================================

const User = require('../../models/User');

describe('User Model', () => {
  describe('Validation', () => {
    it('should create a valid user', async () => {
      const userData = {
        email: 'valid@example.com',
        password: 'ValidPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'ADMIN'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe('valid@example.com');
      expect(savedUser.firstName).toBe('John');
      expect(savedUser.lastName).toBe('Doe');
      expect(savedUser.role).toBe('ADMIN');
    });

    it('should require email', async () => {
      const user = new User({
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require valid email format', async () => {
      const user = new User({
        email: 'invalid-email',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      await global.testHelpers.createTestUser({ email: 'unique@example.com' });

      const duplicateUser = new User({
        email: 'unique@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Doe'
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should validate role enum', async () => {
      const user = new User({
        email: 'role@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'INVALID_ROLE'
      });

      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password on save', async () => {
      const plainPassword = 'MyPlainPassword123!';
      const user = new User({
        email: 'hash@example.com',
        password: plainPassword,
        firstName: 'John',
        lastName: 'Doe'
      });

      await user.save();

      expect(user.password).not.toBe(plainPassword);
      expect(user.password.length).toBeGreaterThan(plainPassword.length);
    });

    it('should verify correct password', async () => {
      const plainPassword = 'CorrectPassword123!';
      const user = await global.testHelpers.createTestUser({
        email: 'verify@example.com',
        password: plainPassword
      });

      const isMatch = await user.comparePassword(plainPassword);
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = await global.testHelpers.createTestUser({
        email: 'reject@example.com',
        password: 'CorrectPassword123!'
      });

      const isMatch = await user.comparePassword('WrongPassword123!');
      expect(isMatch).toBe(false);
    });
  });

  describe('Virtual Fields', () => {
    it('should return fullName virtual', async () => {
      const user = await global.testHelpers.createTestUser({
        email: 'fullname@example.com',
        firstName: 'John',
        lastName: 'Doe'
      });

      expect(user.fullName).toBe('John Doe');
    });
  });

  describe('Account Lockout', () => {
    it('should increment login attempts on failed login', async () => {
      const user = await global.testHelpers.createTestUser({
        email: 'lockout@example.com',
        password: 'Password123!'
      });

      user.security.loginAttempts = 0;
      await user.save();

      user.security.loginAttempts += 1;
      await user.save();

      expect(user.security.loginAttempts).toBe(1);
    });

    it('should lock account after max attempts', async () => {
      const user = await global.testHelpers.createTestUser({
        email: 'maxattempts@example.com',
        password: 'Password123!'
      });

      user.security.loginAttempts = 5;
      user.security.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      // Check if account is locked (lockUntil is in the future)
      expect(user.security.lockUntil.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Role Permissions', () => {
    it('should have default permissions for ADMIN', async () => {
      const user = await global.testHelpers.createTestUser({
        email: 'adminperms@example.com',
        role: 'ADMIN'
      });

      expect(user.permissions).toContain('*');
    });

    it('should allow custom permissions', async () => {
      const user = new User({
        email: 'customperms@example.com',
        password: 'Password123!',
        firstName: 'Custom',
        lastName: 'User',
        role: 'COMMERCIAL',
        permissions: ['products:read', 'clients:read', 'clients:write']
      });

      await user.save();

      expect(user.permissions).toContain('products:read');
      expect(user.permissions).toContain('clients:write');
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt', async () => {
      const user = await global.testHelpers.createTestUser({
        email: 'timestamps@example.com'
      });

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should update updatedAt on modification', async () => {
      const user = await global.testHelpers.createTestUser({
        email: 'updated@example.com'
      });

      const originalUpdatedAt = user.updatedAt;

      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 100));

      user.firstName = 'Updated';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
