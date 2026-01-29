// ============================================
// MARKET PRO API - Products Routes Tests
// ============================================

const request = require('supertest');
const express = require('express');

// Setup Express app for testing
const createApp = () => {
  const app = express();
  app.use(express.json());
  
  // Import routes
  const productRoutes = require('../../routes/products.routes');
  app.use('/api/products', productRoutes);
  
  // Error handler
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
  });
  
  return app;
};

describe('Products Routes', () => {
  let app;
  let adminUser;
  let adminToken;
  let testProduct;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    adminUser = await global.testHelpers.createTestUser({
      email: 'admin.products@example.com',
      role: 'ADMIN'
    });
    adminToken = await global.testHelpers.getAuthToken(adminUser);
    
    testProduct = await global.testHelpers.createTestProduct({
      name: 'Test Product 1',
      sku: 'TEST-001',
      barcode: '1234567890123'
    });
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });

    it('should filter by category', async () => {
      const res = await request(app)
        .get('/api/products?category=EPICERIE')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.products.forEach(product => {
        expect(product.category).toBe('EPICERIE');
      });
    });

    it('should search by name', async () => {
      const res = await request(app)
        .get('/api/products?search=Test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.products.length).toBeGreaterThan(0);
    });

    it('should paginate results', async () => {
      // Create additional products
      for (let i = 0; i < 15; i++) {
        await global.testHelpers.createTestProduct({ name: `Paginated Product ${i}` });
      }

      const res = await request(app)
        .get('/api/products?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.products.length).toBeLessThanOrEqual(10);
      expect(res.body.data.pagination).toBeDefined();
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a product by ID', async () => {
      const res = await request(app)
        .get(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Product 1');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/products/barcode/:barcode', () => {
    it('should find product by barcode', async () => {
      const res = await request(app)
        .get('/api/products/barcode/1234567890123')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.barcode).toBe('1234567890123');
    });

    it('should return 404 for non-existent barcode', async () => {
      const res = await request(app)
        .get('/api/products/barcode/0000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        sku: 'NEW-001',
        barcode: '9876543210123',
        name: 'New Test Product',
        category: 'BOISSONS',
        pricing: {
          purchasePrice: 5,
          sellingPrice: 8,
          taxRate: 20
        },
        stock: {
          quantity: 50,
          minQuantity: 10
        }
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Test Product');
      expect(res.body.data.sku).toBe('NEW-001');
    });

    it('should reject duplicate SKU', async () => {
      const duplicateProduct = {
        sku: 'TEST-001', // Already exists
        barcode: '1111111111111',
        name: 'Duplicate SKU Product',
        category: 'EPICERIE',
        pricing: { purchasePrice: 10, sellingPrice: 15, taxRate: 20 }
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateProduct);

      expect(res.status).toBe(400);
    });

    it('should require mandatory fields', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Incomplete Product' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      const res = await request(app)
        .put(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Product Name',
          'pricing.sellingPrice': 20
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Product Name');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const res = await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      // Verify product is deleted
      const getRes = await request(app)
        .get(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(404);
    });
  });

  describe('Stock Management', () => {
    describe('POST /api/products/:id/stock/add', () => {
      it('should add stock to product', async () => {
        const initialQuantity = testProduct.stock.quantity;

        const res = await request(app)
          .post(`/api/products/${testProduct._id}/stock/add`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            quantity: 50,
            reason: 'Test stock addition'
          });

        expect(res.status).toBe(200);
        expect(res.body.data.stock.quantity).toBe(initialQuantity + 50);
      });

      it('should reject negative quantity', async () => {
        const res = await request(app)
          .post(`/api/products/${testProduct._id}/stock/add`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            quantity: -10,
            reason: 'Invalid quantity'
          });

        expect(res.status).toBe(400);
      });
    });

    describe('POST /api/products/:id/stock/deduct', () => {
      it('should deduct stock from product', async () => {
        const initialQuantity = testProduct.stock.quantity;

        const res = await request(app)
          .post(`/api/products/${testProduct._id}/stock/deduct`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            quantity: 10,
            reason: 'Test stock deduction'
          });

        expect(res.status).toBe(200);
        expect(res.body.data.stock.quantity).toBe(initialQuantity - 10);
      });

      it('should reject deduction exceeding available stock', async () => {
        const res = await request(app)
          .post(`/api/products/${testProduct._id}/stock/deduct`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            quantity: 1000, // More than available
            reason: 'Exceeding stock'
          });

        expect(res.status).toBe(400);
      });
    });
  });
});
