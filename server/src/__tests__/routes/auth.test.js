// ============================================
// MARKET PRO API - Auth Routes Tests
// ============================================

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Setup Express app for testing
const createApp = () => {
  const app = express();
  app.use(express.json());
  
  // Import routes
  const authRoutes = require('../../routes/auth.routes');
  app.use('/api/auth', authRoutes);
  
  // Error handler
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  });
  
  return app;
};

describe('Auth Routes', () => {
  let app;
  let testUser;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    // Créer un utilisateur de test
    testUser = await global.testHelpers.createTestUser({
      email: 'auth.test@example.com',
      password: 'TestPassword123!'
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'auth.test@example.com',
          password: 'TestPassword123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.email).toBe('auth.test@example.com');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'auth.test@example.com',
          password: 'WrongPassword123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should require email and password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });

    it('should reject inactive user', async () => {
      // Create inactive user
      await global.testHelpers.createTestUser({
        email: 'inactive@example.com',
        password: 'TestPassword123!',
        isActive: false
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@example.com',
          password: 'TestPassword123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('désactivé');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const token = await global.testHelpers.getAuthToken(testUser);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('auth.test@example.com');
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      // First login to get refresh token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'auth.test@example.com',
          password: 'TestPassword123!'
        });

      const refreshToken = loginRes.body.data.refreshToken;

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const token = await global.testHelpers.getAuthToken(testUser);

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'NewPassword456!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify old password no longer works
      const loginOld = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'auth.test@example.com',
          password: 'TestPassword123!'
        });

      expect(loginOld.status).toBe(401);

      // Verify new password works
      const loginNew = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'auth.test@example.com',
          password: 'NewPassword456!'
        });

      expect(loginNew.status).toBe(200);
    });

    it('should reject wrong current password', async () => {
      const token = await global.testHelpers.getAuthToken(testUser);

      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword456!'
        });

      expect(res.status).toBe(401);
    });
  });
});
