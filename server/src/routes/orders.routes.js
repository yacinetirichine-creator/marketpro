// ============================================
// MARKET PRO API - Routes Commandes
// ============================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Order = require('../models/Order');
const Client = require('../models/Client');
const Product = require('../models/Product');
const { validate } = require('../middleware/validate');
const { authenticate, hasPermission } = require('../middleware/auth');

router.use(authenticate);

// GET /api/orders
router.get('/', hasPermission('VIEW_ORDERS'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, client, startDate, endDate, priority } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { clientName: new RegExp(search, 'i') }
      ];
    }
    if (status) query.status = status;
    if (client) query.client = client;
    if (priority) query.priority = priority;
    if (startDate || endDate) {
      query['dates.ordered'] = {};
      if (startDate) query['dates.ordered'].$gte = new Date(startDate);
      if (endDate) query['dates.ordered'].$lte = new Date(endDate);
    }
    
    const orders = await Order.find(query)
      .populate('client', 'company.name code')
      .populate('assignedTo', 'firstName lastName')
      .sort({ 'dates.ordered': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      }
    });
    
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/orders/stats
router.get('/stats', hasPermission('VIEW_ORDERS'), async (req, res) => {
  try {
    const statusStats = await Order.getStatusStats();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await Order.countDocuments({ 'dates.ordered': { $gte: today } });
    const pendingOrders = await Order.countDocuments({ status: { $in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } });
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRevenue = await Order.aggregate([
      { $match: { 'dates.ordered': { $gte: monthStart }, status: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, total: { $sum: '$totals.totalTTC' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        statusStats,
        todayOrders,
        pendingOrders,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
      }
    });
    
  } catch (error) {
    console.error('Get orders stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/orders/:id
router.get('/:id', hasPermission('VIEW_ORDERS'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client')
      .populate('items.product')
      .populate('assignedTo', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('statusHistory.changedBy', 'firstName lastName');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée.' });
    }
    
    res.json({ success: true, data: { order } });
    
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/orders
router.post('/', hasPermission('CREATE_ORDERS'), [
  body('client').isMongoId(),
  body('items').isArray({ min: 1 }),
  body('items.*.product').isMongoId(),
  body('items.*.quantity').isInt({ min: 1 }),
  validate
], async (req, res) => {
  try {
    const { client: clientId, items, notes, shipping, priority } = req.body;
    
    // Vérifier le client
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client non trouvé.' });
    }
    
    // Préparer les articles
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Produit non trouvé: ${item.product}` });
      }
      
      // Vérifier le stock
      if (product.availableStock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Stock insuffisant pour ${product.name} (disponible: ${product.availableStock})` 
        });
      }
      
      orderItems.push({
        product: product._id,
        sku: product.sku,
        name: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice || product.pricing.sellingPrice,
        discount: item.discount || client.commercial.discount || 0,
        taxRate: product.pricing.taxRate
      });
      
      // Réserver le stock
      await product.reserveStock(item.quantity);
    }
    
    const orderNumber = await Order.generateOrderNumber();
    
    const order = new Order({
      orderNumber,
      client: clientId,
      clientCode: client.code,
      clientName: client.company.name,
      contact: {
        name: client.contactFullName,
        email: client.contact.email,
        phone: client.contact.phone
      },
      billingAddress: client.defaultBillingAddress,
      shippingAddress: client.defaultShippingAddress,
      items: orderItems,
      shipping,
      priority: priority || 'NORMAL',
      notes,
      createdBy: req.user._id,
      statusHistory: [{
        status: 'DRAFT',
        changedBy: req.user._id,
        reason: 'Création de la commande'
      }]
    });
    
    order.calculateTotals();
    
    // Vérifier le crédit
    const canOrder = client.canOrder(order.totals.totalTTC);
    if (!canOrder.allowed) {
      // Libérer le stock réservé
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        await product.releaseStock(item.quantity);
      }
      return res.status(400).json({ success: false, message: canOrder.reason });
    }
    
    // Définir la date d'échéance
    order.payment.dueDate = new Date(Date.now() + client.commercial.paymentTerms * 24 * 60 * 60 * 1000);
    order.payment.method = client.commercial.paymentMethod;
    
    await order.save();
    
    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès.',
      data: { order }
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', hasPermission('VALIDATE_ORDERS'), [
  body('status').isIn([
    'DRAFT', 'PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 
    'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'RETURNED'
  ]),
  validate
], async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée.' });
    }
    
    // Si annulation, libérer le stock
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          await product.releaseStock(item.quantity);
        }
      }
    }
    
    // Si livré, déduire le stock et mettre à jour le client
    if (status === 'DELIVERED' && order.status !== 'DELIVERED') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          // Le stock était réservé, maintenant on le déduit vraiment
          product.stock.reservedQuantity = Math.max(0, product.stock.reservedQuantity - item.quantity);
          await product.save();
        }
      }
      
      // Mettre à jour les stats du client
      const client = await Client.findById(order.client);
      if (client) {
        await client.updateStatsAfterOrder(order.totals.totalTTC);
      }
    }
    
    await order.updateStatus(status, req.user._id, reason);
    
    res.json({
      success: true,
      message: `Commande passée en statut: ${status}`,
      data: { order }
    });
    
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// DELETE /api/orders/:id
router.delete('/:id', hasPermission('VALIDATE_ORDERS'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée.' });
    }
    
    // Seulement les brouillons peuvent être supprimés
    if (order.status !== 'DRAFT') {
      return res.status(400).json({ 
        success: false, 
        message: 'Seules les commandes en brouillon peuvent être supprimées.' 
      });
    }
    
    // Libérer le stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        await product.releaseStock(item.quantity);
      }
    }
    
    await Order.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Commande supprimée.' });
    
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
