// ============================================
// MARKET PRO API - Routes Stocks (Mouvements)
// ============================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const { validate } = require('../middleware/validate');
const { authenticate, hasPermission } = require('../middleware/auth');

router.use(authenticate);

// GET /api/stocks/movements
router.get('/movements', hasPermission('VIEW_STOCKS'), async (req, res) => {
  try {
    const { page = 1, limit = 50, product, type, startDate, endDate } = req.query;
    
    const query = {};
    if (product) query.product = product;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const movements = await StockMovement.find(query)
      .populate('product', 'name sku')
      .populate('performedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await StockMovement.countDocuments(query);
    
    res.json({
      success: true,
      data: { movements, pagination: { page: parseInt(page), limit: parseInt(limit), total } }
    });
    
  } catch (error) {
    console.error('Get movements error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/stocks/movements
router.post('/movements', hasPermission('MANAGE_STOCKS'), [
  body('product').isMongoId(),
  body('type').isIn([
    'IN_PURCHASE', 'IN_RETURN', 'IN_TRANSFER', 'IN_ADJUSTMENT', 'IN_PRODUCTION',
    'OUT_SALE', 'OUT_RETURN', 'OUT_TRANSFER', 'OUT_ADJUSTMENT', 'OUT_WASTE', 'OUT_EXPIRED',
    'INVENTORY'
  ]),
  body('quantity').isInt({ min: 1 }),
  validate
], async (req, res) => {
  try {
    const { product: productId, type, quantity, location, lot, reason, notes } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé.' });
    }
    
    const previousStock = product.stock.quantity;
    
    // Appliquer le mouvement
    if (type.startsWith('IN_')) {
      await product.addStock(quantity, lot?.number);
    } else if (type.startsWith('OUT_')) {
      await product.deductStock(quantity);
    } else if (type === 'INVENTORY') {
      product.stock.quantity = quantity;
      await product.save();
    }
    
    const reference = await StockMovement.generateReference();
    
    const movement = await StockMovement.create({
      reference,
      product: productId,
      productSku: product.sku,
      productName: product.name,
      type,
      quantity: type.startsWith('OUT_') ? -quantity : quantity,
      previousStock,
      newStock: product.stock.quantity,
      location,
      lot,
      reason,
      notes,
      performedBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Mouvement de stock enregistré.',
      data: { movement }
    });
    
  } catch (error) {
    console.error('Create movement error:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur serveur.' });
  }
});

// GET /api/stocks/alerts
router.get('/alerts', hasPermission('VIEW_STOCKS'), async (req, res) => {
  try {
    const lowStock = await Product.findLowStock();
    const outOfStock = await Product.findOutOfStock();
    
    // Produits bientôt expirés (30 jours)
    const expiringProducts = await Product.find({
      isActive: true,
      'dates.expirationDate': {
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        $gte: new Date()
      }
    });
    
    res.json({
      success: true,
      data: {
        lowStock,
        outOfStock,
        expiringProducts,
        summary: {
          lowStockCount: lowStock.length,
          outOfStockCount: outOfStock.length,
          expiringCount: expiringProducts.length
        }
      }
    });
    
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
