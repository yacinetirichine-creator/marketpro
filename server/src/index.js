// ============================================
// MARKET PRO API - Point d'entrée principal
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

// Import des routes
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const productsRoutes = require('./routes/products.routes');
const stocksRoutes = require('./routes/stocks.routes');
const clientsRoutes = require('./routes/clients.routes');
const suppliersRoutes = require('./routes/suppliers.routes');
const ordersRoutes = require('./routes/orders.routes');
const invoicesRoutes = require('./routes/invoices.routes');
const paymentsRoutes = require('./routes/payments.routes');
const purchasesRoutes = require('./routes/purchases.routes');
const reportsRoutes = require('./routes/reports.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const auditRoutes = require('./routes/audit.routes');

// Routes logistique
const locationsRoutes = require('./routes/locations');
const receiptsRoutes = require('./routes/receipts');
const inventoryRoutes = require('./routes/inventory');
const pickingRoutes = require('./routes/picking');
const categoriesRoutes = require('./routes/categories');

// Import des middlewares
const errorHandler = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const app = express();

// ============================================
// CONNEXION BASE DE DONNÉES
// ============================================
connectDB();

// ============================================
// MIDDLEWARES GLOBAUX
// ============================================

// Sécurité HTTP headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Rate limiting global
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Rate limiting strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, compte temporairement bloqué'
  }
});
app.use('/api/auth/login', authLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Fichiers statiques (uploads)
app.use('/uploads', express.static('uploads'));

// ============================================
// ROUTES API
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Market Pro API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Routes principales
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);

// Routes logistique
app.use('/api/locations', locationsRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/picking', pickingRoutes);
app.use('/api/categories', categoriesRoutes);

// ============================================
// GESTION DES ERREURS
// ============================================

// Route non trouvée
app.use(notFound);

// Gestionnaire d'erreurs global
app.use(errorHandler);

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🏪 Market Pro API Server                        ║
║   ─────────────────────────────────────────────   ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                     ║
║   🚀 Running on port: ${PORT}                          ║
║   📡 API URL: http://localhost:${PORT}/api            ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = app;
