// ============================================
// MARKET PRO API - Routes Dashboard
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

// GET /api/dashboard - Données principales du dashboard
router.get('/', hasPermission('VIEW_DASHBOARD'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    // Statistiques du jour
    const todayOrders = await Order.countDocuments({ 'dates.ordered': { $gte: today } });
    const todayRevenue = await Order.aggregate([
      { $match: { 'dates.ordered': { $gte: today }, status: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, total: { $sum: '$totals.totalTTC' } } }
    ]);
    
    // Statistiques du mois
    const monthlyStats = await Order.aggregate([
      { $match: { 'dates.ordered': { $gte: monthStart }, status: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: '$totals.totalTTC' } } }
    ]);
    
    // Mois précédent (pour comparaison)
    const lastMonthStats = await Order.aggregate([
      { $match: { 'dates.ordered': { $gte: lastMonthStart, $lte: lastMonthEnd }, status: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: '$totals.totalTTC' } } }
    ]);
    
    // Commandes en attente
    const pendingOrders = await Order.countDocuments({ 
      status: { $in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } 
    });
    
    // Factures impayées
    const unpaidInvoices = await Invoice.aggregate([
      { $match: { status: { $nin: ['PAID', 'CANCELLED', 'REFUNDED'] } } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: { $subtract: ['$totals.totalTTC', '$paidAmount'] } } } }
    ]);
    
    // Stock alerts
    const lowStockCount = await Product.countDocuments({
      isActive: true,
      $expr: { $lte: ['$stock.quantity', '$stock.minQuantity'] }
    });
    
    // Nouveaux clients ce mois
    const newClients = await Client.countDocuments({ createdAt: { $gte: monthStart } });
    
    // Commandes récentes
    const recentOrders = await Order.find()
      .populate('client', 'company.name code')
      .sort({ 'dates.ordered': -1 })
      .limit(5)
      .select('orderNumber status totals dates client');
    
    // Ventes par jour (7 derniers jours)
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const dailySales = await Order.aggregate([
      {
        $match: {
          'dates.ordered': { $gte: weekAgo },
          status: { $ne: 'CANCELLED' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$dates.ordered' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totals.totalTTC' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Top produits
    const topProducts = await Order.aggregate([
      { $match: { 'dates.ordered': { $gte: monthStart }, status: { $ne: 'CANCELLED' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.totalTTC' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);
    
    // Calcul des variations
    const currentRevenue = monthlyStats[0]?.revenue || 0;
    const lastRevenue = lastMonthStats[0]?.revenue || 0;
    const revenueChange = lastRevenue > 0 
      ? ((currentRevenue - lastRevenue) / lastRevenue * 100).toFixed(1) 
      : 0;
    
    res.json({
      success: true,
      data: {
        kpis: {
          todayOrders,
          todayRevenue: todayRevenue[0]?.total || 0,
          monthlyOrders: monthlyStats[0]?.orders || 0,
          monthlyRevenue: currentRevenue,
          revenueChange: parseFloat(revenueChange),
          pendingOrders,
          unpaidInvoicesCount: unpaidInvoices[0]?.count || 0,
          unpaidInvoicesTotal: unpaidInvoices[0]?.total || 0,
          lowStockCount,
          newClients
        },
        charts: {
          dailySales,
          topProducts
        },
        recentOrders
      }
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/dashboard/quick-stats
router.get('/quick-stats', hasPermission('VIEW_DASHBOARD'), async (req, res) => {
  try {
    const [products, clients, orders, invoices] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Client.countDocuments({ status: 'ACTIVE' }),
      Order.countDocuments({ status: { $nin: ['CANCELLED', 'COMPLETED'] } }),
      Invoice.countDocuments({ status: { $nin: ['PAID', 'CANCELLED'] } })
    ]);
    
    res.json({
      success: true,
      data: {
        activeProducts: products,
        activeClients: clients,
        pendingOrders: orders,
        pendingInvoices: invoices
      }
    });
    
  } catch (error) {
    console.error('Quick stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
