// ============================================
// MARKET PRO API - Routes Rapports
// ============================================

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const Client = require('../models/Client');
const { authenticate, hasPermission } = require('../middleware/auth');

router.use(authenticate);

// GET /api/reports/sales
router.get('/sales', hasPermission('VIEW_REPORTS'), async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    let dateFormat;
    switch (groupBy) {
      case 'month': dateFormat = '%Y-%m'; break;
      case 'week': dateFormat = '%Y-W%V'; break;
      default: dateFormat = '%Y-%m-%d';
    }
    
    const salesData = await Order.aggregate([
      {
        $match: {
          'dates.ordered': { $gte: start, $lte: end },
          status: { $nin: ['CANCELLED', 'DRAFT'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$dates.ordered' } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totals.totalTTC' },
          totalItems: { $sum: { $size: '$items' } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const totals = await Order.aggregate([
      {
        $match: {
          'dates.ordered': { $gte: start, $lte: end },
          status: { $nin: ['CANCELLED', 'DRAFT'] }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totals.totalTTC' },
          avgOrderValue: { $avg: '$totals.totalTTC' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        period: { start, end },
        chartData: salesData,
        totals: totals[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }
      }
    });
    
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/reports/products
router.get('/products', hasPermission('VIEW_REPORTS'), async (req, res) => {
  try {
    const { startDate, endDate, limit = 20 } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const topProducts = await Order.aggregate([
      {
        $match: {
          'dates.ordered': { $gte: start, $lte: end },
          status: { $nin: ['CANCELLED', 'DRAFT'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          sku: { $first: '$items.sku' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalTTC' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    const categoryStats = await Order.aggregate([
      {
        $match: {
          'dates.ordered': { $gte: start, $lte: end },
          status: { $nin: ['CANCELLED', 'DRAFT'] }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalTTC' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        period: { start, end },
        topProducts,
        categoryStats
      }
    });
    
  } catch (error) {
    console.error('Products report error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/reports/clients
router.get('/clients', hasPermission('VIEW_REPORTS'), async (req, res) => {
  try {
    const { startDate, endDate, limit = 20 } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const topClients = await Order.aggregate([
      {
        $match: {
          'dates.ordered': { $gte: start, $lte: end },
          status: { $nin: ['CANCELLED', 'DRAFT'] }
        }
      },
      {
        $group: {
          _id: '$client',
          clientName: { $first: '$clientName' },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totals.totalTTC' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    const clientStats = await Client.aggregate([
      {
        $group: {
          _id: '$commercial.category',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$stats.totalRevenue' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        period: { start, end },
        topClients,
        clientStats
      }
    });
    
  } catch (error) {
    console.error('Clients report error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/reports/payments
router.get('/payments', hasPermission('VIEW_REPORTS'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const paymentsByMethod = await Payment.aggregate([
      {
        $match: {
          'dates.payment': { $gte: start, $lte: end },
          status: 'COMPLETED'
        }
      },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const dailyPayments = await Payment.aggregate([
      {
        $match: {
          'dates.payment': { $gte: start, $lte: end },
          status: 'COMPLETED'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$dates.payment' } },
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        period: { start, end },
        paymentsByMethod,
        dailyPayments
      }
    });
    
  } catch (error) {
    console.error('Payments report error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/reports/stock
router.get('/stock', hasPermission('VIEW_REPORTS'), async (req, res) => {
  try {
    const stats = await Product.getGlobalStats();
    
    const byCategory = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock.quantity' },
          stockValue: { $sum: { $multiply: ['$stock.quantity', '$pricing.purchasePrice'] } }
        }
      },
      { $sort: { stockValue: -1 } }
    ]);
    
    const lowStock = await Product.findLowStock();
    const outOfStock = await Product.findOutOfStock();
    
    res.json({
      success: true,
      data: {
        stats,
        byCategory,
        lowStock: lowStock.slice(0, 20),
        outOfStock: outOfStock.slice(0, 20)
      }
    });
    
  } catch (error) {
    console.error('Stock report error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
