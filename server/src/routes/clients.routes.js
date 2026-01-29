// ============================================
// MARKET PRO API - Routes Clients
// ============================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Client = require('../models/Client');
const { validate } = require('../middleware/validate');
const { authenticate, hasPermission } = require('../middleware/auth');

router.use(authenticate);

// GET /api/clients
router.get('/', hasPermission('VIEW_CLIENTS'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, type, category } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { 'company.name': new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') },
        { 'contact.email': new RegExp(search, 'i') }
      ];
    }
    if (status) query.status = status;
    if (type) query.type = type;
    if (category) query['commercial.category'] = category;
    
    const clients = await Client.find(query)
      .populate('assignedTo', 'firstName lastName')
      .sort({ 'company.name': 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Client.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        clients,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      }
    });
    
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/clients/stats
router.get('/stats', hasPermission('VIEW_CLIENTS'), async (req, res) => {
  try {
    const total = await Client.countDocuments();
    const active = await Client.countDocuments({ status: 'ACTIVE' });
    const prospects = await Client.countDocuments({ status: 'PROSPECT' });
    const withOutstanding = await Client.findWithOutstanding();
    const topClients = await Client.findTopByRevenue(5);
    
    const totalOutstanding = withOutstanding.reduce((sum, c) => sum + c.stats.outstandingBalance, 0);
    
    res.json({
      success: true,
      data: {
        total,
        active,
        prospects,
        blocked: await Client.countDocuments({ status: 'BLOCKED' }),
        totalOutstanding,
        topClients
      }
    });
    
  } catch (error) {
    console.error('Get clients stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/clients/:id
router.get('/:id', hasPermission('VIEW_CLIENTS'), async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('userId', 'email');
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client non trouvé.' });
    }
    
    res.json({ success: true, data: { client } });
    
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/clients
router.post('/', hasPermission('MANAGE_CLIENTS'), [
  body('company.name').trim().notEmpty().withMessage('Nom de l\'entreprise requis'),
  body('contact.email').isEmail().withMessage('Email invalide'),
  validate
], async (req, res) => {
  try {
    const code = await Client.generateCode();
    
    const client = await Client.create({
      ...req.body,
      code
    });
    
    res.status(201).json({
      success: true,
      message: 'Client créé avec succès.',
      data: { client }
    });
    
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// PUT /api/clients/:id
router.put('/:id', hasPermission('MANAGE_CLIENTS'), async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client non trouvé.' });
    }
    
    res.json({ success: true, message: 'Client modifié.', data: { client } });
    
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', hasPermission('MANAGE_CLIENTS'), async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { status: 'ARCHIVED' },
      { new: true }
    );
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client non trouvé.' });
    }
    
    res.json({ success: true, message: 'Client archivé.' });
    
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/clients/:id/notes
router.post('/:id/notes', hasPermission('MANAGE_CLIENTS'), [
  body('content').trim().notEmpty(),
  validate
], async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client non trouvé.' });
    }
    
    client.notes.push({
      content: req.body.content,
      createdBy: req.user._id
    });
    
    await client.save();
    
    res.json({ success: true, message: 'Note ajoutée.', data: { notes: client.notes } });
    
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
