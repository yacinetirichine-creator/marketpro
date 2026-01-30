// ============================================
// MARKET PRO API - Routes Catégories Produits
// ============================================

const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const { auth, checkRole } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Middleware de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ============================================
// GET /api/categories - Liste des catégories
// ============================================
router.get('/', async (req, res) => {
  try {
    const { format = 'flat', visibleOnly = 'true' } = req.query;

    if (format === 'tree') {
      const tree = await Category.getTree();
      return res.json(tree);
    }

    const query = { isActive: true };
    if (visibleOnly === 'true') {
      query.isVisibleToClients = true;
    }

    const categories = await Category.find(query)
      .sort({ displayOrder: 1, name: 1 })
      .populate('parent', 'code name');

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/categories/root - Catégories racines
// ============================================
router.get('/root', async (req, res) => {
  try {
    const categories = await Category.getRootCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching root categories:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/categories/:id - Détail d'une catégorie
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'code name')
      .populate('children', 'code name icon');

    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/categories/code/:code - Par code
// ============================================
router.get('/code/:code', async (req, res) => {
  try {
    const category = await Category.getByCode(req.params.code);

    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category by code:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// POST /api/categories - Créer une catégorie
// ============================================
router.post('/',
  auth,
  checkRole(['ADMIN', 'MANAGER']),
  [
    body('code').notEmpty().isLength({ max: 10 }).withMessage('Code requis (max 10 caractères)'),
    body('name').notEmpty().withMessage('Nom requis')
  ],
  validate,
  async (req, res) => {
    try {
      const category = new Category(req.body);
      await category.save();
      res.status(201).json(category);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Ce code de catégorie existe déjà' });
      }
      console.error('Error creating category:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/categories/initialize - Initialiser les catégories agroalimentaires
// ============================================
router.post('/initialize',
  auth,
  checkRole(['ADMIN']),
  async (req, res) => {
    try {
      const result = await Category.initializeCategories();
      res.status(201).json({
        message: `${result.length} catégories créées`,
        categories: result
      });
    } catch (error) {
      console.error('Error initializing categories:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// PUT /api/categories/:id - Modifier une catégorie
// ============================================
router.put('/:id',
  auth,
  checkRole(['ADMIN', 'MANAGER']),
  async (req, res) => {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({ message: 'Catégorie non trouvée' });
      }

      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// PATCH /api/categories/:id/visibility - Changer la visibilité
// ============================================
router.patch('/:id/visibility',
  auth,
  checkRole(['ADMIN', 'MANAGER']),
  [
    body('isVisibleToClients').isBoolean()
  ],
  validate,
  async (req, res) => {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { isVisibleToClients: req.body.isVisibleToClients },
        { new: true }
      );

      if (!category) {
        return res.status(404).json({ message: 'Catégorie non trouvée' });
      }

      res.json(category);
    } catch (error) {
      console.error('Error updating category visibility:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// DELETE /api/categories/:id - Supprimer (désactiver)
// ============================================
router.delete('/:id',
  auth,
  checkRole(['ADMIN']),
  async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({ message: 'Catégorie non trouvée' });
      }

      // Vérifier s'il y a des sous-catégories
      const childCount = await Category.countDocuments({ parent: category._id });
      if (childCount > 0) {
        return res.status(400).json({
          message: 'Impossible de supprimer une catégorie avec des sous-catégories'
        });
      }

      category.isActive = false;
      await category.save();

      res.json({ message: 'Catégorie désactivée' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

module.exports = router;
