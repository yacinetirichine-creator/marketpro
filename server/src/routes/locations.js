// ============================================
// MARKET PRO API - Routes Emplacements Entrepôt
// ============================================

const express = require('express');
const router = express.Router();
const { Location } = require('../models');
const { auth, checkRole } = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');

// Middleware de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ============================================
// GET /api/locations - Liste des emplacements
// ============================================
router.get('/', auth, async (req, res) => {
  try {
    const {
      zone,
      status,
      type,
      isEmpty,
      page = 1,
      limit = 100,
      sortBy = 'pickingOrder',
      sortOrder = 'asc'
    } = req.query;

    const query = { isActive: true };

    if (zone) query.zone = zone.toUpperCase();
    if (status) query.status = status;
    if (type) query.type = type;
    if (isEmpty === 'true') {
      query.$or = [
        { currentProducts: { $size: 0 } },
        { currentProducts: { $exists: false } }
      ];
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const locations = await Location.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('currentProducts.product', 'sku name');

    const total = await Location.countDocuments(query);

    res.json({
      data: locations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/locations/zones - Statistiques par zone
// ============================================
router.get('/zones', auth, async (req, res) => {
  try {
    const stats = await Location.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$zone',
          total: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'AVAILABLE'] }, 1, 0] }
          },
          occupied: {
            $sum: { $cond: [{ $eq: ['$status', 'OCCUPIED'] }, 1, 0] }
          },
          avgOccupancy: { $avg: '$capacity.currentOccupancy' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const zoneNames = {
      'F': 'Frais',
      'S': 'Sec',
      'C': 'Congélateur',
      'Q': 'Quai',
      'P': 'Préparation'
    };

    const formattedStats = stats.map(s => ({
      zone: s._id,
      zoneName: zoneNames[s._id] || s._id,
      ...s
    }));

    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching zone stats:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/locations/available - Emplacements disponibles
// ============================================
router.get('/available', auth, async (req, res) => {
  try {
    const { zone, categoryCode } = req.query;

    let locations;

    if (categoryCode) {
      // Trouver les emplacements compatibles avec la catégorie
      locations = await Location.find({
        status: 'AVAILABLE',
        isActive: true,
        $or: [
          { allowedCategories: categoryCode },
          { allowedCategories: { $size: 0 } }
        ],
        ...(zone && { zone: zone.toUpperCase() })
      }).sort({ pickingOrder: 1 }).limit(10);
    } else {
      locations = await Location.findAvailable(zone?.toUpperCase());
    }

    res.json(locations);
  } catch (error) {
    console.error('Error fetching available locations:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/locations/suggest - Suggérer un emplacement
// ============================================
router.get('/suggest', auth, async (req, res) => {
  try {
    const { productId, categoryCode, zone } = req.query;

    let suggestedLocation;

    if (productId) {
      const Product = require('../models/Product');
      const product = await Product.findById(productId);
      if (product) {
        suggestedLocation = await Location.suggestLocation(product);
      }
    } else if (categoryCode || zone) {
      const categoryZoneMap = {
        'FRU': 'F', 'LEG': 'F', 'VIA': 'F', 'POI': 'F', 'LAI': 'F', 'FRA': 'F',
        'SUR': 'C',
        'EPI': 'S', 'BOI': 'S', 'HYG': 'S', 'EMB': 'S', 'DIV': 'S'
      };

      const targetZone = zone?.toUpperCase() || categoryZoneMap[categoryCode] || 'S';

      suggestedLocation = await Location.findOne({
        zone: targetZone,
        status: 'AVAILABLE',
        isActive: true
      }).sort({ pickingOrder: 1 });
    }

    if (!suggestedLocation) {
      return res.status(404).json({ message: 'Aucun emplacement disponible' });
    }

    res.json(suggestedLocation);
  } catch (error) {
    console.error('Error suggesting location:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/locations/:id - Détail d'un emplacement
// ============================================
router.get('/:id', auth, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('currentProducts.product', 'sku name barcode')
      .populate('currentProducts.stockLot', 'lotNumber dates.expiry');

    if (!location) {
      return res.status(404).json({ message: 'Emplacement non trouvé' });
    }

    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/locations/code/:code - Par code
// ============================================
router.get('/code/:code', auth, async (req, res) => {
  try {
    const location = await Location.findOne({ code: req.params.code.toUpperCase() })
      .populate('currentProducts.product', 'sku name barcode')
      .populate('currentProducts.stockLot', 'lotNumber dates.expiry');

    if (!location) {
      return res.status(404).json({ message: 'Emplacement non trouvé' });
    }

    res.json(location);
  } catch (error) {
    console.error('Error fetching location by code:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// POST /api/locations - Créer un emplacement
// ============================================
router.post('/',
  auth,
  checkRole(['ADMIN', 'MANAGER', 'MAGASINIER']),
  [
    body('zone').isIn(['F', 'S', 'C', 'Q', 'P']).withMessage('Zone invalide'),
    body('aisle').matches(/^[A-Z]$/).withMessage('Allée invalide'),
    body('rack').matches(/^\d{2}$/).withMessage('Rayon invalide'),
    body('level').matches(/^\d{2}$/).withMessage('Niveau invalide')
  ],
  validate,
  async (req, res) => {
    try {
      const location = new Location(req.body);
      await location.save();
      res.status(201).json(location);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Cet emplacement existe déjà' });
      }
      console.error('Error creating location:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/locations/generate - Générer l'entrepôt
// ============================================
router.post('/generate',
  auth,
  checkRole(['ADMIN']),
  async (req, res) => {
    try {
      const config = req.body;
      const result = await Location.generateWarehouseLocations(config);
      res.status(201).json({
        message: `${result.length} emplacements créés`,
        count: result.length
      });
    } catch (error) {
      console.error('Error generating warehouse:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// PUT /api/locations/:id - Modifier un emplacement
// ============================================
router.put('/:id',
  auth,
  checkRole(['ADMIN', 'MANAGER', 'MAGASINIER']),
  async (req, res) => {
    try {
      const location = await Location.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!location) {
        return res.status(404).json({ message: 'Emplacement non trouvé' });
      }

      res.json(location);
    } catch (error) {
      console.error('Error updating location:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// PATCH /api/locations/:id/status - Changer le statut
// ============================================
router.patch('/:id/status',
  auth,
  checkRole(['ADMIN', 'MANAGER', 'MAGASINIER']),
  [
    body('status').isIn(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'BLOCKED'])
  ],
  validate,
  async (req, res) => {
    try {
      const location = await Location.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      );

      if (!location) {
        return res.status(404).json({ message: 'Emplacement non trouvé' });
      }

      res.json(location);
    } catch (error) {
      console.error('Error updating location status:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// DELETE /api/locations/:id - Supprimer (désactiver)
// ============================================
router.delete('/:id',
  auth,
  checkRole(['ADMIN']),
  async (req, res) => {
    try {
      const location = await Location.findById(req.params.id);

      if (!location) {
        return res.status(404).json({ message: 'Emplacement non trouvé' });
      }

      // Vérifier si l'emplacement contient des produits
      if (location.currentProducts && location.currentProducts.length > 0) {
        return res.status(400).json({
          message: 'Impossible de supprimer un emplacement contenant des produits'
        });
      }

      location.isActive = false;
      await location.save();

      res.json({ message: 'Emplacement désactivé' });
    } catch (error) {
      console.error('Error deleting location:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

module.exports = router;
