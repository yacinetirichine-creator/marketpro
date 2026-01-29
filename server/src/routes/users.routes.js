// ============================================
// MARKET PRO API - Routes Utilisateurs
// ============================================

const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const User = require('../models/User');
const { validate } = require('../middleware/validate');
const { authenticate, authorize, hasPermission } = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(authenticate);

// ============================================
// GET /api/users - Liste des utilisateurs
// ============================================
router.get('/', authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    
    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ============================================
// GET /api/users/:id - Détail utilisateur
// ============================================
router.get('/:id', authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshToken')
      .populate('clientId');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }
    
    res.json({ success: true, data: { user } });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ============================================
// POST /api/users - Créer utilisateur
// ============================================
router.post('/', authorize('ADMIN'), [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('role').isIn(['ADMIN', 'MANAGER', 'COMMERCIAL', 'CAISSIER', 'MAGASINIER', 'COMPTABLE', 'CLIENT']),
  validate
], async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone, permissions } = req.body;
    
    // Vérifier si l'email existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé.' });
    }
    
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      permissions
    });
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès.',
      data: { user: { ...user.toObject(), password: undefined } }
    });
    
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ============================================
// PUT /api/users/:id - Modifier utilisateur
// ============================================
router.put('/:id', authorize('ADMIN'), async (req, res) => {
  try {
    const { firstName, lastName, phone, role, isActive, permissions, preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, phone, role, isActive, permissions, preferences },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }
    
    res.json({ success: true, message: 'Utilisateur modifié.', data: { user } });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ============================================
// DELETE /api/users/:id - Supprimer utilisateur
// ============================================
router.delete('/:id', authorize('ADMIN'), async (req, res) => {
  try {
    // Empêcher la suppression de son propre compte
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }
    
    res.json({ success: true, message: 'Utilisateur supprimé.' });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ============================================
// PUT /api/users/:id/toggle-status
// ============================================
router.put('/:id/toggle-status', authorize('ADMIN'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({
      success: true,
      message: user.isActive ? 'Utilisateur activé.' : 'Utilisateur désactivé.',
      data: { isActive: user.isActive }
    });
    
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
