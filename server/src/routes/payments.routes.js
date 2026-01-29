// ============================================
// MARKET PRO API - Routes Paiements
// ============================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const { validate } = require('../middleware/validate');
const { authenticate, hasPermission } = require('../middleware/auth');

router.use(authenticate);

// GET /api/payments
router.get('/', hasPermission('VIEW_PAYMENTS'), async (req, res) => {
  try {
    const { page = 1, limit = 20, client, method, status, startDate, endDate } = req.query;
    
    const query = {};
    if (client) query.client = client;
    if (method) query.method = method;
    if (status) query.status = status;
    if (startDate || endDate) {
      query['dates.payment'] = {};
      if (startDate) query['dates.payment'].$gte = new Date(startDate);
      if (endDate) query['dates.payment'].$lte = new Date(endDate);
    }
    
    const payments = await Payment.find(query)
      .populate('client', 'company.name code')
      .populate('invoice', 'invoiceNumber')
      .populate('recordedBy', 'firstName lastName')
      .sort({ 'dates.payment': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Payment.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        payments,
        pagination: { page: parseInt(page), limit: parseInt(limit), total }
      }
    });
    
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/payments/stats
router.get('/stats', hasPermission('VIEW_PAYMENTS'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPayments = await Payment.aggregate([
      { $match: { 'dates.payment': { $gte: today }, status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyPayments = await Payment.aggregate([
      { $match: { 'dates.payment': { $gte: monthStart }, status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    
    const byMethod = await Payment.getTotalByMethod(monthStart, today);
    
    const pendingChecks = await Payment.getPendingChecks();
    
    res.json({
      success: true,
      data: {
        today: {
          total: todayPayments[0]?.total || 0,
          count: todayPayments[0]?.count || 0
        },
        monthly: {
          total: monthlyPayments[0]?.total || 0,
          count: monthlyPayments[0]?.count || 0
        },
        byMethod,
        pendingChecks: pendingChecks.length,
        pendingChecksAmount: pendingChecks.reduce((sum, p) => sum + p.amount, 0)
      }
    });
    
  } catch (error) {
    console.error('Get payments stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/payments/:id
router.get('/:id', hasPermission('VIEW_PAYMENTS'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('client')
      .populate('invoice')
      .populate('order')
      .populate('recordedBy', 'firstName lastName');
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Paiement non trouvé.' });
    }
    
    res.json({ success: true, data: { payment } });
    
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/payments
router.post('/', hasPermission('PROCESS_PAYMENTS'), [
  body('client').isMongoId(),
  body('amount').isFloat({ min: 0.01 }),
  body('method').isIn(['CASH', 'CHECK', 'TRANSFER', 'CARD', 'PRELEVEMENT', 'OTHER']),
  validate
], async (req, res) => {
  try {
    const { client: clientId, invoice: invoiceId, amount, method, details, notes } = req.body;
    
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client non trouvé.' });
    }
    
    const reference = await Payment.generateReference();
    
    const payment = await Payment.create({
      reference,
      type: 'RECEIPT',
      client: clientId,
      clientName: client.company.name,
      invoice: invoiceId,
      amount,
      method,
      details,
      status: method === 'CHECK' ? 'PENDING' : 'COMPLETED',
      dates: { payment: new Date() },
      notes,
      recordedBy: req.user._id
    });
    
    // Si facture liée, ajouter le paiement
    if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (invoice) {
        await invoice.addPayment(amount, method, reference, req.user._id);
        payment.invoiceNumber = invoice.invoiceNumber;
        await payment.save();
      }
    }
    
    // Mettre à jour le solde client
    if (payment.status === 'COMPLETED') {
      await client.recordPayment(amount);
    }
    
    res.status(201).json({
      success: true,
      message: 'Paiement enregistré.',
      data: { payment }
    });
    
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// PUT /api/payments/:id/validate
router.put('/:id/validate', hasPermission('PROCESS_PAYMENTS'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Paiement non trouvé.' });
    }
    
    if (payment.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Ce paiement ne peut pas être validé.' });
    }
    
    payment.status = 'COMPLETED';
    payment.dates.cleared = new Date();
    await payment.save();
    
    // Mettre à jour le solde client
    const client = await Client.findById(payment.client);
    if (client) {
      await client.recordPayment(payment.amount);
    }
    
    res.json({
      success: true,
      message: 'Paiement validé.',
      data: { payment }
    });
    
  } catch (error) {
    console.error('Validate payment error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// PUT /api/payments/:id/reject
router.put('/:id/reject', hasPermission('PROCESS_PAYMENTS'), [
  body('reason').trim().notEmpty(),
  validate
], async (req, res) => {
  try {
    const { reason } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Paiement non trouvé.' });
    }
    
    payment.status = 'FAILED';
    payment.notes = `${payment.notes || ''} Rejeté: ${reason}`;
    await payment.save();
    
    res.json({
      success: true,
      message: 'Paiement rejeté.',
      data: { payment }
    });
    
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/payments/pending-checks
router.get('/checks/pending', hasPermission('VIEW_PAYMENTS'), async (req, res) => {
  try {
    const pendingChecks = await Payment.getPendingChecks();
    
    res.json({
      success: true,
      data: {
        checks: pendingChecks,
        total: pendingChecks.length,
        totalAmount: pendingChecks.reduce((sum, p) => sum + p.amount, 0)
      }
    });
    
  } catch (error) {
    console.error('Get pending checks error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
