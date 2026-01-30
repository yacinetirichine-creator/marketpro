// ============================================
// MARKET PRO API - Routes Inventaire
// ============================================

const express = require('express');
const router = express.Router();
const { Inventory, Product, StockLot, Location, StockMovement } = require('../models');
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
// GET /api/inventory - Liste des inventaires
// ============================================
router.get('/', auth, async (req, res) => {
  try {
    const {
      status,
      type,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const inventories = await Inventory.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy supervisedBy', 'name');

    const total = await Inventory.countDocuments(query);

    res.json({
      data: inventories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inventories:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/inventory/active - Inventaires actifs
// ============================================
router.get('/active', auth, async (req, res) => {
  try {
    const inventories = await Inventory.findActive();
    res.json(inventories);
  } catch (error) {
    console.error('Error fetching active inventories:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/inventory/planned - Inventaires planifiés
// ============================================
router.get('/planned', auth, async (req, res) => {
  try {
    const inventories = await Inventory.findPlanned();
    res.json(inventories);
  } catch (error) {
    console.error('Error fetching planned inventories:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/inventory/:id - Détail d'un inventaire
// ============================================
router.get('/:id', auth, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate('createdBy supervisedBy', 'name email')
      .populate('teams.members.user', 'name')
      .populate('counts.product', 'sku name barcode')
      .populate('counts.location', 'code zone')
      .populate('counts.countedBy counts.reCountedBy counts.validatedBy', 'name');

    if (!inventory) {
      return res.status(404).json({ message: 'Inventaire non trouvé' });
    }

    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// POST /api/inventory - Créer un inventaire
// ============================================
router.post('/',
  auth,
  checkRole(['ADMIN', 'MANAGER']),
  [
    body('type').isIn(['FULL', 'PARTIAL', 'CYCLIC', 'SPOT']).withMessage('Type invalide'),
    body('dates.planned').isISO8601().withMessage('Date planifiée invalide')
  ],
  validate,
  async (req, res) => {
    try {
      const inventoryNumber = await Inventory.generateInventoryNumber(req.body.type);

      const inventory = new Inventory({
        ...req.body,
        inventoryNumber,
        createdBy: req.user.id,
        status: 'PLANNED'
      });

      await inventory.save();

      res.status(201).json(inventory);
    } catch (error) {
      console.error('Error creating inventory:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/inventory/:id/initialize - Initialiser avec les produits
// ============================================
router.post('/:id/initialize',
  auth,
  checkRole(['ADMIN', 'MANAGER']),
  async (req, res) => {
    try {
      const inventory = await Inventory.findById(req.params.id);

      if (!inventory) {
        return res.status(404).json({ message: 'Inventaire non trouvé' });
      }

      if (inventory.status !== 'PLANNED') {
        return res.status(400).json({ message: 'L\'inventaire doit être en statut PLANNED' });
      }

      // Construire la requête selon le périmètre
      const query = { isActive: true };

      if (inventory.scope.zones && inventory.scope.zones.length > 0) {
        query['location.zone'] = { $in: inventory.scope.zones };
      }

      if (inventory.scope.categories && inventory.scope.categories.length > 0) {
        query.category = { $in: inventory.scope.categories };
      }

      if (inventory.scope.products && inventory.scope.products.length > 0) {
        query._id = { $in: inventory.scope.products };
      }

      // Récupérer les produits et leurs stocks
      const products = await Product.find(query);

      // Créer les lignes de comptage
      const counts = [];

      for (const product of products) {
        // Récupérer les lots du produit
        const lots = await StockLot.find({
          product: product._id,
          status: { $nin: ['EXPIRED', 'CONSUMED'] }
        }).populate('location', 'code');

        if (lots.length > 0) {
          for (const lot of lots) {
            counts.push({
              product: product._id,
              stockLot: lot._id,
              location: lot.location?._id,
              locationCode: lot.locationCode || lot.location?.code,
              theoreticalQty: lot.quantity.current,
              unit: lot.quantity.unit,
              status: 'PENDING'
            });
          }
        } else {
          // Produit sans lot (stock théorique du produit)
          counts.push({
            product: product._id,
            locationCode: product.location?.zone ?
              `${product.location.zone}-${product.location.aisle || ''}-${product.location.shelf || ''}-${product.location.position || ''}`.replace(/-+$/, '') :
              'N/A',
            theoreticalQty: product.stock?.quantity || 0,
            unit: product.stock?.unit || 'PIECE',
            status: 'PENDING'
          });
        }
      }

      inventory.counts = counts;
      inventory.stats.totalProducts = counts.length;

      await inventory.save();

      res.json({
        message: `${counts.length} lignes de comptage initialisées`,
        inventory
      });
    } catch (error) {
      console.error('Error initializing inventory:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/inventory/:id/start - Démarrer l'inventaire
// ============================================
router.post('/:id/start',
  auth,
  checkRole(['ADMIN', 'MANAGER']),
  async (req, res) => {
    try {
      const inventory = await Inventory.findById(req.params.id);

      if (!inventory) {
        return res.status(404).json({ message: 'Inventaire non trouvé' });
      }

      await inventory.start(req.user.id);

      res.json(inventory);
    } catch (error) {
      console.error('Error starting inventory:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// ============================================
// POST /api/inventory/:id/count - Enregistrer un comptage
// ============================================
router.post('/:id/count',
  auth,
  checkRole(['ADMIN', 'MANAGER', 'MAGASINIER']),
  [
    body('product').isMongoId().withMessage('Produit invalide'),
    body('countedQty').isNumeric().withMessage('Quantité requise')
  ],
  validate,
  async (req, res) => {
    try {
      const inventory = await Inventory.findById(req.params.id);

      if (!inventory) {
        return res.status(404).json({ message: 'Inventaire non trouvé' });
      }

      if (!['IN_PROGRESS', 'COUNTING'].includes(inventory.status)) {
        return res.status(400).json({ message: 'L\'inventaire n\'est pas en cours de comptage' });
      }

      const countData = {
        ...req.body,
        countedBy: req.user.id
      };

      await inventory.addCount(countData);

      // Mettre à jour le statut si nécessaire
      if (inventory.status === 'IN_PROGRESS') {
        inventory.status = 'COUNTING';
        await inventory.save();
      }

      res.json(inventory);
    } catch (error) {
      console.error('Error recording count:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/inventory/:id/recount/:countIndex - Recomptage
// ============================================
router.post('/:id/recount/:countIndex',
  auth,
  checkRole(['ADMIN', 'MANAGER', 'MAGASINIER']),
  [
    body('reCountedQty').isNumeric().withMessage('Quantité requise')
  ],
  validate,
  async (req, res) => {
    try {
      const inventory = await Inventory.findById(req.params.id);
      const countIndex = parseInt(req.params.countIndex);

      if (!inventory) {
        return res.status(404).json({ message: 'Inventaire non trouvé' });
      }

      if (!inventory.counts[countIndex]) {
        return res.status(404).json({ message: 'Comptage non trouvé' });
      }

      const count = inventory.counts[countIndex];

      // Vérifier que ce n'est pas le même utilisateur
      if (inventory.config.requireDoubleCount &&
          count.countedBy?.toString() === req.user.id) {
        return res.status(400).json({
          message: 'Le recomptage doit être effectué par une personne différente'
        });
      }

      count.reCountedQty = req.body.reCountedQty;
      count.reCountedBy = req.user.id;
      count.reCountedAt = new Date();
      count.status = 'RECOUNTED';

      await inventory.save();

      res.json(inventory);
    } catch (error) {
      console.error('Error recording recount:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/inventory/:id/validate/:countIndex - Valider un comptage
// ============================================
router.post('/:id/validate/:countIndex',
  auth,
  checkRole(['ADMIN', 'MANAGER']),
  async (req, res) => {
    try {
      const inventory = await Inventory.findById(req.params.id);
      const countIndex = parseInt(req.params.countIndex);

      if (!inventory) {
        return res.status(404).json({ message: 'Inventaire non trouvé' });
      }

      const { finalQty, reason } = req.body;

      await inventory.validateCount(countIndex, req.user.id, finalQty);

      // Enregistrer la raison de l'écart si fournie
      if (reason && inventory.counts[countIndex].variance) {
        inventory.counts[countIndex].variance.reason = reason;
        await inventory.save();
      }

      res.json(inventory);
    } catch (error) {
      console.error('Error validating count:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// ============================================
// POST /api/inventory/:id/adjust - Effectuer les régularisations
// ============================================
router.post('/:id/adjust',
  auth,
  checkRole(['ADMIN', 'MANAGER']),
  async (req, res) => {
    try {
      const inventory = await Inventory.findById(req.params.id)
        .populate('counts.product')
        .populate('counts.stockLot');

      if (!inventory) {
        return res.status(404).json({ message: 'Inventaire non trouvé' });
      }

      const adjustments = [];

      for (const count of inventory.counts) {
        if (count.status !== 'VALIDATED') continue;
        if (!count.variance || count.variance.quantity === 0) continue;

        const adjustment = count.variance.quantity;
        const product = count.product;
        const stockLot = count.stockLot;

        // Créer la régularisation
        const adjustmentRecord = {
          product: product._id,
          stockLot: stockLot?._id,
          location: count.locationCode,
          previousQty: count.theoreticalQty,
          newQty: count.finalQty,
          adjustment,
          reason: count.variance.reason || 'Régularisation inventaire',
          approvedBy: req.user.id,
          approvedAt: new Date()
        };

        // Mettre à jour le stock
        if (stockLot) {
          stockLot.quantity.current = count.finalQty;
          stockLot.movements.push({
            type: 'ADJUSTMENT',
            quantity: adjustment,
            reason: `Inventaire ${inventory.inventoryNumber}`,
            user: req.user.id,
            date: new Date()
          });
          await stockLot.save();
        }

        if (product) {
          product.stock.quantity += adjustment;
          await product.save();
        }

        // Créer le mouvement de stock
        const stockMovement = new StockMovement({
          type: adjustment > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT',
          product: product._id,
          quantity: Math.abs(adjustment),
          unit: count.unit,
          reference: inventory.inventoryNumber,
          referenceType: 'INVENTORY',
          referenceId: inventory._id,
          location: count.locationCode,
          reason: `Régularisation inventaire: ${count.variance.reason || 'Écart constaté'}`,
          user: req.user.id
        });

        await stockMovement.save();
        adjustmentRecord.stockMovement = stockMovement._id;

        adjustments.push(adjustmentRecord);
        count.status = 'ADJUSTED';
      }

      inventory.adjustments = adjustments;
      inventory.status = 'ADJUSTMENT';

      await inventory.save();

      res.json({
        message: `${adjustments.length} régularisations effectuées`,
        inventory
      });
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/inventory/:id/complete - Terminer l'inventaire
// ============================================
router.post('/:id/complete',
  auth,
  checkRole(['ADMIN', 'MANAGER']),
  async (req, res) => {
    try {
      const inventory = await Inventory.findById(req.params.id);

      if (!inventory) {
        return res.status(404).json({ message: 'Inventaire non trouvé' });
      }

      await inventory.complete(req.user.id);

      res.json(inventory);
    } catch (error) {
      console.error('Error completing inventory:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// ============================================
// GET /api/inventory/:id/report - Générer le rapport
// ============================================
router.get('/:id/report', auth, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate('counts.product', 'sku name pricing.purchasePrice')
      .populate('createdBy supervisedBy', 'name');

    if (!inventory) {
      return res.status(404).json({ message: 'Inventaire non trouvé' });
    }

    // Calculer les statistiques du rapport
    const report = {
      inventoryNumber: inventory.inventoryNumber,
      type: inventory.type,
      dates: inventory.dates,
      stats: inventory.stats,
      summary: {
        totalLines: inventory.counts.length,
        linesWithVariance: inventory.counts.filter(c => c.variance?.quantity !== 0).length,
        positiveVariances: [],
        negativeVariances: [],
        totalValueVariance: 0
      }
    };

    for (const count of inventory.counts) {
      if (!count.variance || count.variance.quantity === 0) continue;

      const product = count.product;
      const unitPrice = product?.pricing?.purchasePrice || 0;
      const valueVariance = count.variance.quantity * unitPrice;

      const varianceEntry = {
        sku: product?.sku,
        name: product?.name,
        location: count.locationCode,
        theoreticalQty: count.theoreticalQty,
        finalQty: count.finalQty,
        variance: count.variance.quantity,
        valueVariance,
        reason: count.variance.reason
      };

      if (count.variance.quantity > 0) {
        report.summary.positiveVariances.push(varianceEntry);
      } else {
        report.summary.negativeVariances.push(varianceEntry);
      }

      report.summary.totalValueVariance += valueVariance;
    }

    res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// DELETE /api/inventory/:id - Annuler un inventaire
// ============================================
router.delete('/:id',
  auth,
  checkRole(['ADMIN']),
  async (req, res) => {
    try {
      const inventory = await Inventory.findById(req.params.id);

      if (!inventory) {
        return res.status(404).json({ message: 'Inventaire non trouvé' });
      }

      if (inventory.status === 'COMPLETED') {
        return res.status(400).json({
          message: 'Impossible d\'annuler un inventaire terminé'
        });
      }

      inventory.status = 'CANCELLED';
      await inventory.save();

      res.json({ message: 'Inventaire annulé' });
    } catch (error) {
      console.error('Error cancelling inventory:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

module.exports = router;
