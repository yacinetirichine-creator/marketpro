// ============================================
// MARKET PRO API - Test Setup
// ============================================

const mongoose = require('mongoose');

// Configuration de test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// MongoDB Memory Server pour tests isolés
let mongoServer;

// Connexion avant tous les tests
beforeAll(async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB Memory Server connected for tests');
});

// Nettoyer après chaque test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Déconnexion après tous les tests
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  console.log('✅ MongoDB Memory Server stopped');
});

// Helpers pour les tests
global.testHelpers = {
  // Créer un utilisateur de test
  createTestUser: async (userData = {}) => {
    const User = require('../models/User');
    const defaultUser = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      isVerified: true
    };
    const user = new User({ ...defaultUser, ...userData });
    await user.save();
    return user;
  },

  // Créer un token d'authentification
  getAuthToken: async (user) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  },

  // Créer un produit de test
  createTestProduct: async (productData = {}) => {
    const Product = require('../models/Product');
    const defaultProduct = {
      sku: `TEST-${Date.now()}`,
      barcode: `${Date.now()}`,
      name: 'Test Product',
      category: 'EPICERIE',
      pricing: {
        purchasePrice: 10,
        sellingPrice: 15,
        taxRate: 20
      },
      stock: {
        quantity: 100,
        minQuantity: 10
      }
    };
    const product = new Product({ ...defaultProduct, ...productData });
    await product.save();
    return product;
  },

  // Créer un client de test
  createTestClient: async (clientData = {}) => {
    const Client = require('../models/Client');
    const defaultClient = {
      code: `CLI${Date.now()}`,
      type: 'PROFESSIONNEL',
      company: { name: 'Test Company' },
      contact: {
        firstName: 'Test',
        lastName: 'Contact',
        email: 'contact@test.com',
        phone: '0600000000'
      }
    };
    const client = new Client({ ...defaultClient, ...clientData });
    await client.save();
    return client;
  }
};
