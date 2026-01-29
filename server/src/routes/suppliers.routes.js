// ============================================
// MARKET PRO API - Routes Fournisseurs
// ============================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Supplier = require('../models/Supplier');
const { validate } = require('../middleware/validate');
const { authenticate, hasPermission } = require('../middleware/auth');

router.use(authenticate);

// GET /api/suppliers
router.get('/', hasPermission('VIEW_SUPPLIERS'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, category } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { 'company.name': new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') }
      ];
    }
    if (status) query.status = status;
    if (category) query.categories = category;
    
    const suppliers = await Supplier.find(query)
      .sort({ 'company.name': 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Supplier.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        suppliers,
        pagination: { page: parseInt(page), limit: parseInt(limit), total }
      }
    });
    
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/suppliers/:id
router.get('/:id', hasPermission('VIEW_SUPPLIERS'), async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Fournisseur non trouvé.' });
    }
    
    res.json({ success: true, data: { supplier } });
    
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/suppliers
router.post('/', hasPermission('MANAGE_SUPPLIERS'), [
  body('company.name').trim().notEmpty(),
  body('contact.email').isEmail(),
  validate
], async (req, res) => {
  try {
    const code = await Supplier.generateCode();
    
    const supplier = await Supplier.create({
      ...req.body,
      code
    });
    
    res.status(201).json({
      success: true,
      message: 'Fournisseur créé.',
      data: { supplier }
    });
    
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// PUT /api/suppliers/:id
router.put('/:id', hasPermission('MANAGE_SUPPLIERS'), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Fournisseur non trouvé.' });
    }
    
    res.json({ success: true, message: 'Fournisseur modifié.', data: { supplier } });
    
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', hasPermission('MANAGE_SUPPLIERS'), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { status: 'INACTIVE' },
      { new: true }
    );
    
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Fournisseur non trouvé.' });
    }
    
    res.json({ success: true, message: 'Fournisseur désactivé.' });
    
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
