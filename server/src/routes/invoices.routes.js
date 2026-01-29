// ============================================
// MARKET PRO API - Routes Factures
// ============================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const Client = require('../models/Client');
const { validate } = require('../middleware/validate');
const { authenticate, hasPermission } = require('../middleware/auth');

router.use(authenticate);

// GET /api/invoices
router.get('/', hasPermission('VIEW_INVOICES'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, client, type, startDate, endDate, overdue } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { invoiceNumber: new RegExp(search, 'i') },
        { 'clientInfo.name': new RegExp(search, 'i') }
      ];
    }
    if (status) query.status = status;
    if (client) query.client = client;
    if (type) query.type = type;
    if (overdue === 'true') {
      query.status = { $nin: ['PAID', 'CANCELLED', 'REFUNDED'] };
      query['dates.due'] = { $lt: new Date() };
    }
    if (startDate || endDate) {
      query['dates.issued'] = {};
      if (startDate) query['dates.issued'].$gte = new Date(startDate);
      if (endDate) query['dates.issued'].$lte = new Date(endDate);
    }
    
    const invoices = await Invoice.find(query)
      .populate('client', 'company.name code')
      .sort({ 'dates.issued': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Invoice.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        invoices,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      }
    });
    
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/invoices/stats
router.get('/stats', hasPermission('VIEW_INVOICES'), async (req, res) => {
  try {
    const unpaidTotal = await Invoice.getUnpaidTotal();
    const overdueInvoices = await Invoice.getOverdue();
    
    const statusStats = await Invoice.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totals.totalTTC' } } }
    ]);
    
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthlyStats = await Invoice.aggregate([
      { $match: { 'dates.issued': { $gte: monthStart }, type: 'INVOICE' } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$totals.totalTTC' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        unpaidTotal,
        overdueCount: overdueInvoices.length,
        overdueTotal: overdueInvoices.reduce((sum, i) => sum + i.remainingAmount, 0),
        statusStats,
        monthlyInvoices: monthlyStats[0]?.count || 0,
        monthlyTotal: monthlyStats[0]?.total || 0
      }
    });
    
  } catch (error) {
    console.error('Get invoices stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/invoices/:id
router.get('/:id', hasPermission('VIEW_INVOICES'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client')
      .populate('order')
      .populate('items.product')
      .populate('payments.recordedBy', 'firstName lastName')
      .populate('createdBy', 'firstName lastName');
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée.' });
    }
    
    res.json({ success: true, data: { invoice } });
    
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/invoices
router.post('/', hasPermission('CREATE_INVOICES'), [
  body('client').isMongoId(),
  body('items').isArray({ min: 1 }),
  validate
], async (req, res) => {
  try {
    const { client: clientId, order: orderId, items, type = 'INVOICE', notes } = req.body;
    
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client non trouvé.' });
    }
    
    const invoiceNumber = await Invoice.generateInvoiceNumber(type);
    
    const invoice = new Invoice({
      invoiceNumber,
      type,
      client: clientId,
      clientInfo: {
        code: client.code,
        name: client.company.name,
        siret: client.company.siret,
        vatNumber: client.company.vatNumber,
        address: client.defaultBillingAddress
      },
      order: orderId,
      items,
      dates: {
        issued: new Date(),
        due: new Date(Date.now() + client.commercial.paymentTerms * 24 * 60 * 60 * 1000)
      },
      paymentTerms: client.commercial.paymentTerms,
      paymentMethod: client.commercial.paymentMethod,
      notes,
      createdBy: req.user._id
    });
    
    invoice.calculateTotals();
    
    // Appliquer la remise client
    if (client.commercial.discount > 0) {
      invoice.totals.discountPercent = client.commercial.discount;
      invoice.calculateTotals();
    }
    
    await invoice.save();
    
    // Lier à la commande si applicable
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { invoice: invoice._id });
    }
    
    res.status(201).json({
      success: true,
      message: 'Facture créée avec succès.',
      data: { invoice }
    });
    
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/invoices/from-order/:orderId
router.post('/from-order/:orderId', hasPermission('CREATE_INVOICES'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('client');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée.' });
    }
    
    if (order.invoice) {
      return res.status(400).json({ success: false, message: 'Cette commande a déjà une facture.' });
    }
    
    const client = order.client;
    const invoiceNumber = await Invoice.generateInvoiceNumber('INVOICE');
    
    const invoice = new Invoice({
      invoiceNumber,
      type: 'INVOICE',
      client: client._id,
      clientInfo: {
        code: client.code,
        name: client.company.name,
        siret: client.company.siret,
        vatNumber: client.company.vatNumber,
        address: order.billingAddress
      },
      order: order._id,
      orderNumber: order.orderNumber,
      items: order.items.map(item => ({
        product: item.product,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        taxRate: item.taxRate,
        totalHT: item.totalHT,
        totalTTC: item.totalTTC
      })),
      totals: { ...order.totals },
      dates: {
        issued: new Date(),
        due: new Date(Date.now() + client.commercial.paymentTerms * 24 * 60 * 60 * 1000)
      },
      paymentTerms: client.commercial.paymentTerms,
      paymentMethod: order.payment.method,
      createdBy: req.user._id
    });
    
    await invoice.save();
    
    // Mettre à jour la commande
    order.invoice = invoice._id;
    await order.save();
    
    res.status(201).json({
      success: true,
      message: 'Facture créée depuis la commande.',
      data: { invoice }
    });
    
  } catch (error) {
    console.error('Create invoice from order error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/invoices/:id/payment
router.post('/:id/payment', hasPermission('PROCESS_PAYMENTS'), [
  body('amount').isFloat({ min: 0.01 }),
  body('method').isIn(['CASH', 'CHECK', 'TRANSFER', 'CARD', 'PRELEVEMENT']),
  validate
], async (req, res) => {
  try {
    const { amount, method, reference } = req.body;
    
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée.' });
    }
    
    if (invoice.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'Cette facture est déjà payée.' });
    }
    
    await invoice.addPayment(amount, method, reference, req.user._id);
    
    // Mettre à jour le client
    const client = await Client.findById(invoice.client);
    if (client) {
      await client.recordPayment(amount);
    }
    
    res.json({
      success: true,
      message: 'Paiement enregistré.',
      data: { 
        invoice,
        remainingAmount: invoice.remainingAmount,
        isPaid: invoice.isPaid
      }
    });
    
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// PUT /api/invoices/:id/send
router.put('/:id/send', hasPermission('CREATE_INVOICES'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Facture non trouvée.' });
    }
    
    // Simuler l'envoi d'email (à implémenter avec nodemailer)
    invoice.status = 'SENT';
    invoice.dates.sent = new Date();
    invoice.emailHistory.push({
      sentTo: req.body.email || invoice.clientInfo?.address?.email,
      sentBy: req.user._id
    });
    
    await invoice.save();
    
    res.json({
      success: true,
      message: 'Facture envoyée.',
      data: { invoice }
    });
    
  } catch (error) {
    console.error('Send invoice error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/invoices/overdue
router.get('/overdue/list', hasPermission('VIEW_INVOICES'), async (req, res) => {
  try {
    const overdueInvoices = await Invoice.getOverdue();
    
    res.json({
      success: true,
      data: { 
        invoices: overdueInvoices,
        total: overdueInvoices.length,
        totalAmount: overdueInvoices.reduce((sum, i) => sum + i.remainingAmount, 0)
      }
    });
    
  } catch (error) {
    console.error('Get overdue invoices error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
