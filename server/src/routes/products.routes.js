// ============================================
// MARKET PRO API - Routes Produits
// ============================================

const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const Product = require('../models/Product');
const { validate } = require('../middleware/validate');
const { authenticate, hasPermission } = require('../middleware/auth');

router.use(authenticate);

// ============================================
// GET /api/products - Liste des produits
// ============================================
router.get('/', hasPermission('VIEW_STOCKS'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      supplier,
      stockStatus,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { sku: new RegExp(search, 'i') },
        { barcode: search }
      ];
    }
    if (category) query.category = category;
    if (supplier) query.supplier = supplier;
    
    let products = await Product.find(query)
      .populate('supplier', 'company.name code')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    // Filtrer par statut stock après fetch (virtual)
    if (stockStatus) {
      products = products.filter(p => p.stockStatus === stockStatus);
    }
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ============================================
// GET /api/products/stats - Statistiques stock
// ============================================
router.get('/stats', hasPermission('VIEW_STOCKS'), async (req, res) => {
  try {
    const stats = await Product.getGlobalStats();
    const lowStock = await Product.findLowStock();
    const outOfStock = await Product.findOutOfStock();
    
    res.json({
      success: true,
      data: {
        ...stats,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        lowStockProducts: lowStock.slice(0, 10),
        outOfStockProducts: outOfStock.slice(0, 10)
      }
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ============================================
// GET /api/products/:id
// ============================================
router.get('/:id', hasPermission('VIEW_STOCKS'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier');
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé.' });
    }
    
    res.json({ success: true, data: { product } });
    
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ============================================
// POST /api/products
// ============================================
router.post('/', hasPermission('MANAGE_STOCKS'), [
  body('sku').trim().notEmpty().withMessage('SKU requis'),
  body('name').trim().notEmpty().withMessage('Nom requis'),
  body('category').isIn([
    'FRUITS_LEGUMES', 'VIANDES', 'POISSONS', 'PRODUITS_LAITIERS',
    'EPICERIE', 'BOISSONS', 'SURGELES', 'CONSERVES', 'CONDIMENTS', 'AUTRES'
  ]),
  body('pricing.purchasePrice').isFloat({ min: 0 }),
  body('pricing.sellingPrice').isFloat({ min: 0 }),
  validate
], async (req, res) => {
  try {
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès.',
      data: { product }
    });
    
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ce SKU ou code-barres existe déjà.' });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ============================================
// PUT /api/products/:id
// ============================================
router.put('/:id', hasPermission('MANAGE_STOCKS'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé.' });
    }
    
    res.json({ success: true, message: 'Produit modifié.', data: { product } });
    
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ============================================
// DELETE /api/products/:id
// ============================================
router.delete('/:id', hasPermission('MANAGE_STOCKS'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé.' });
    }
    
    res.json({ success: true, message: 'Produit supprimé.' });
    
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ============================================
// POST /api/products/:id/stock/add
// ============================================
router.post('/:id/stock/add', hasPermission('MANAGE_STOCKS'), [
  body('quantity').isInt({ min: 1 }),
  validate
], async (req, res) => {
  try {
    const { quantity, lotNumber } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé.' });
    }
    
    await product.addStock(quantity, lotNumber);
    
    res.json({
      success: true,
      message: `${quantity} unités ajoutées au stock.`,
      data: { newStock: product.stock.quantity }
    });
    
  } catch (error) {
    console.error('Add stock error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ============================================
// POST /api/products/:id/stock/deduct
// ============================================
router.post('/:id/stock/deduct', hasPermission('MANAGE_STOCKS'), [
  body('quantity').isInt({ min: 1 }),
  validate
], async (req, res) => {
  try {
    const { quantity, reason } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé.' });
    }
    
    await product.deductStock(quantity);
    
    res.json({
      success: true,
      message: `${quantity} unités retirées du stock.`,
      data: { newStock: product.stock.quantity }
    });
    
  } catch (error) {
    console.error('Deduct stock error:', error);
    if (error.message === 'Stock insuffisant') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ============================================
// GET /api/products/barcode/:code
// ============================================
router.get('/barcode/:code', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      $or: [
        { barcode: req.params.code },
        { sku: req.params.code.toUpperCase() }
      ],
      isActive: true
    });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé.' });
    }
    
    res.json({ success: true, data: { product } });
    
  } catch (error) {
    console.error('Get by barcode error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
