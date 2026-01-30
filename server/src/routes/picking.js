// ============================================
// MARKET PRO API - Routes Préparation Commandes (Picking)
// ============================================

const express = require('express');
const router = express.Router();
const { PickingList, Order, StockLot, Product, Location } = require('../models');
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
// GET /api/picking - Liste des listes de picking
// ============================================
router.get('/', auth, async (req, res) => {
  try {
    const {
      status,
      assignedTo,
      priority,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (priority) query.priority = priority;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const pickingLists = await PickingList.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('assignedTo', 'name')
      .populate('orders.client', 'name');

    const total = await PickingList.countDocuments(query);

    res.json({
      data: pickingLists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching picking lists:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/picking/pending - Listes en attente
// ============================================
router.get('/pending', auth, async (req, res) => {
  try {
    const pickingLists = await PickingList.findPending();
    res.json(pickingLists);
  } catch (error) {
    console.error('Error fetching pending picking lists:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/picking/my-lists - Mes listes assignées
// ============================================
router.get('/my-lists', auth, async (req, res) => {
  try {
    const pickingLists = await PickingList.findByUser(req.user.id);
    res.json(pickingLists);
  } catch (error) {
    console.error('Error fetching user picking lists:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/picking/stats - Statistiques picking
// ============================================
router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayStats, globalStats] = await Promise.all([
      // Stats du jour
      PickingList.aggregate([
        { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalItems: { $sum: '$stats.totalItems' },
            pickedItems: { $sum: '$stats.pickedItems' }
          }
        }
      ]),
      // Stats globales
      PickingList.aggregate([
        { $match: { status: { $in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] } } },
        {
          $group: {
            _id: null,
            pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
            assigned: { $sum: { $cond: [{ $eq: ['$status', 'ASSIGNED'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
            totalItemsToPick: { $sum: '$stats.totalItems' }
          }
        }
      ])
    ]);

    res.json({
      today: todayStats,
      global: globalStats[0] || { pending: 0, assigned: 0, inProgress: 0, totalItemsToPick: 0 }
    });
  } catch (error) {
    console.error('Error fetching picking stats:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/picking/:id - Détail d'une liste
// ============================================
router.get('/:id', auth, async (req, res) => {
  try {
    const pickingList = await PickingList.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('orders.order', 'orderNumber status')
      .populate('orders.client', 'name address phone')
      .populate('items.product', 'sku name barcode images')
      .populate('items.location', 'code zone aisle rack level');

    if (!pickingList) {
      return res.status(404).json({ message: 'Liste de picking non trouvée' });
    }

    res.json(pickingList);
  } catch (error) {
    console.error('Error fetching picking list:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// POST /api/picking - Créer une liste de picking
// ============================================
router.post('/',
  auth,
  checkRole(['ADMIN', 'MANAGER', 'MAGASINIER']),
  [
    body('orderIds').isArray({ min: 1 }).withMessage('Au moins une commande requise')
  ],
  validate,
  async (req, res) => {
    try {
      const { orderIds, priority } = req.body;

      // Vérifier que les commandes existent et sont prêtes
      const orders = await Order.find({
        _id: { $in: orderIds },
        status: { $in: ['PENDING', 'CONFIRMED', 'VALIDATED'] }
      });

      if (orders.length === 0) {
        return res.status(400).json({ message: 'Aucune commande valide trouvée' });
      }

      // Créer la liste optimisée
      const pickingList = await PickingList.createOptimizedList(
        orders.map(o => o._id),
        { priority }
      );

      // Mettre à jour le statut des commandes
      await Order.updateMany(
        { _id: { $in: orders.map(o => o._id) } },
        { status: 'IN_PREPARATION' }
      );

      res.status(201).json(pickingList);
    } catch (error) {
      console.error('Error creating picking list:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/picking/wave - Créer une vague de picking
// ============================================
router.post('/wave',
  auth,
  checkRole(['ADMIN', 'MANAGER']),
  [
    body('deliverySlot.date').isISO8601().withMessage('Date invalide'),
    body('deliverySlot.startTime').matches(/^\d{2}:\d{2}$/).withMessage('Heure de début invalide'),
    body('deliverySlot.endTime').matches(/^\d{2}:\d{2}$/).withMessage('Heure de fin invalide')
  ],
  validate,
  async (req, res) => {
    try {
      const { deliverySlot, priority } = req.body;

      // Trouver les commandes pour ce créneau
      const slotDate = new Date(deliverySlot.date);
      const startOfDay = new Date(slotDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(slotDate.setHours(23, 59, 59, 999));

      const orders = await Order.find({
        status: { $in: ['PENDING', 'CONFIRMED', 'VALIDATED'] },
        'deliverySlot.date': { $gte: startOfDay, $lte: endOfDay },
        'deliverySlot.startTime': deliverySlot.startTime
      });

      if (orders.length === 0) {
        return res.status(400).json({
          message: 'Aucune commande trouvée pour ce créneau'
        });
      }

      // Créer la liste de picking
      const pickingList = await PickingList.createOptimizedList(
        orders.map(o => o._id),
        { priority }
      );

      // Ajouter les infos de vague
      pickingList.mode = 'WAVE';
      pickingList.wave = {
        number: await PickingList.countDocuments({ mode: 'WAVE' }) + 1,
        name: `Vague ${deliverySlot.startTime}-${deliverySlot.endTime}`,
        deliverySlot
      };

      await pickingList.save();

      // Mettre à jour les commandes
      await Order.updateMany(
        { _id: { $in: orders.map(o => o._id) } },
        { status: 'IN_PREPARATION' }
      );

      res.status(201).json(pickingList);
    } catch (error) {
      console.error('Error creating wave picking:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/picking/:id/assign - Assigner un préparateur
// ============================================
router.post('/:id/assign',
  auth,
  checkRole(['ADMIN', 'MANAGER']),
  [
    body('userId').isMongoId().withMessage('Utilisateur invalide')
  ],
  validate,
  async (req, res) => {
    try {
      const pickingList = await PickingList.findById(req.params.id);

      if (!pickingList) {
        return res.status(404).json({ message: 'Liste de picking non trouvée' });
      }

      await pickingList.assign(req.body.userId);

      res.json(pickingList);
    } catch (error) {
      console.error('Error assigning picking list:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/picking/:id/self-assign - S'auto-assigner
// ============================================
router.post('/:id/self-assign',
  auth,
  checkRole(['ADMIN', 'MANAGER', 'MAGASINIER']),
  async (req, res) => {
    try {
      const pickingList = await PickingList.findById(req.params.id);

      if (!pickingList) {
        return res.status(404).json({ message: 'Liste de picking non trouvée' });
      }

      if (pickingList.status !== 'PENDING') {
        return res.status(400).json({ message: 'Cette liste est déjà assignée' });
      }

      await pickingList.assign(req.user.id);

      res.json(pickingList);
    } catch (error) {
      console.error('Error self-assigning picking list:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/picking/:id/start - Démarrer le picking
// ============================================
router.post('/:id/start',
  auth,
  async (req, res) => {
    try {
      const pickingList = await PickingList.findById(req.params.id);

      if (!pickingList) {
        return res.status(404).json({ message: 'Liste de picking non trouvée' });
      }

      // Vérifier que l'utilisateur est bien assigné
      if (pickingList.assignedTo?.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Vous n\'êtes pas assigné à cette liste' });
      }

      await pickingList.start();

      res.json(pickingList);
    } catch (error) {
      console.error('Error starting picking:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// ============================================
// POST /api/picking/:id/items/:itemIndex/pick - Prélever un article
// ============================================
router.post('/:id/items/:itemIndex/pick',
  auth,
  [
    body('pickedQty').isNumeric().withMessage('Quantité requise')
  ],
  validate,
  async (req, res) => {
    try {
      const pickingList = await PickingList.findById(req.params.id);
      const itemIndex = parseInt(req.params.itemIndex);

      if (!pickingList) {
        return res.status(404).json({ message: 'Liste de picking non trouvée' });
      }

      // Vérifier que l'utilisateur est bien assigné
      if (pickingList.assignedTo?.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Vous n\'êtes pas assigné à cette liste' });
      }

      const { pickedQty, scannedBarcode } = req.body;

      // Vérifier le code-barres si fourni
      if (scannedBarcode) {
        const item = pickingList.items[itemIndex];
        if (item.barcode && item.barcode !== scannedBarcode) {
          return res.status(400).json({
            message: 'Code-barres incorrect',
            expected: item.barcode,
            scanned: scannedBarcode
          });
        }
      }

      await pickingList.pickItem(itemIndex, pickedQty, scannedBarcode);

      // Mettre à jour le stock du lot
      const item = pickingList.items[itemIndex];
      if (item.stockLot && pickedQty > 0) {
        const stockLot = await StockLot.findById(item.stockLot);
        if (stockLot) {
          await stockLot.consume(pickedQty, `Picking ${pickingList.pickingNumber}`, req.user.id);
        }
      }

      res.json(pickingList);
    } catch (error) {
      console.error('Error picking item:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// ============================================
// POST /api/picking/:id/items/:itemIndex/skip - Passer un article
// ============================================
router.post('/:id/items/:itemIndex/skip',
  auth,
  [
    body('reason').notEmpty().withMessage('Raison requise')
  ],
  validate,
  async (req, res) => {
    try {
      const pickingList = await PickingList.findById(req.params.id);
      const itemIndex = parseInt(req.params.itemIndex);

      if (!pickingList) {
        return res.status(404).json({ message: 'Liste de picking non trouvée' });
      }

      if (!pickingList.items[itemIndex]) {
        return res.status(404).json({ message: 'Article non trouvé' });
      }

      const item = pickingList.items[itemIndex];
      item.status = 'SKIPPED';
      item.issue = {
        type: 'NOT_FOUND',
        description: req.body.reason
      };

      // Passer au suivant
      const nextItem = pickingList.items.find(i => i.status === 'PENDING');
      if (nextItem) {
        nextItem.status = 'IN_PROGRESS';
      }

      await pickingList.save();

      res.json(pickingList);
    } catch (error) {
      console.error('Error skipping item:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/picking/:id/items/:itemIndex/issue - Signaler un problème
// ============================================
router.post('/:id/items/:itemIndex/issue',
  auth,
  [
    body('type').isIn(['SHORTAGE', 'WRONG_LOCATION', 'DAMAGED', 'EXPIRED', 'NOT_FOUND']),
    body('description').notEmpty()
  ],
  validate,
  async (req, res) => {
    try {
      const pickingList = await PickingList.findById(req.params.id);
      const itemIndex = parseInt(req.params.itemIndex);

      if (!pickingList) {
        return res.status(404).json({ message: 'Liste de picking non trouvée' });
      }

      await pickingList.reportIssue(itemIndex, req.body);

      res.json(pickingList);
    } catch (error) {
      console.error('Error reporting issue:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/picking/:id/items/:itemIndex/substitute - Proposer un substitut
// ============================================
router.post('/:id/items/:itemIndex/substitute',
  auth,
  [
    body('productId').isMongoId().withMessage('Produit invalide'),
    body('quantity').isNumeric().withMessage('Quantité requise')
  ],
  validate,
  async (req, res) => {
    try {
      const pickingList = await PickingList.findById(req.params.id);
      const itemIndex = parseInt(req.params.itemIndex);

      if (!pickingList) {
        return res.status(404).json({ message: 'Liste de picking non trouvée' });
      }

      if (!pickingList.items[itemIndex]) {
        return res.status(404).json({ message: 'Article non trouvé' });
      }

      const item = pickingList.items[itemIndex];

      // Vérifier que le produit substitut existe
      const substituteProduct = await Product.findById(req.body.productId);
      if (!substituteProduct) {
        return res.status(404).json({ message: 'Produit substitut non trouvé' });
      }

      item.issue = {
        ...item.issue,
        substitute: {
          product: req.body.productId,
          quantity: req.body.quantity,
          approved: false
        }
      };

      await pickingList.save();

      res.json(pickingList);
    } catch (error) {
      console.error('Error proposing substitute:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/picking/:id/complete - Terminer le picking
// ============================================
router.post('/:id/complete',
  auth,
  async (req, res) => {
    try {
      const pickingList = await PickingList.findById(req.params.id);

      if (!pickingList) {
        return res.status(404).json({ message: 'Liste de picking non trouvée' });
      }

      await pickingList.complete();

      // Mettre à jour le statut des commandes
      await Order.updateMany(
        { _id: { $in: pickingList.orders.map(o => o.order) } },
        { status: 'READY_FOR_DELIVERY' }
      );

      res.json(pickingList);
    } catch (error) {
      console.error('Error completing picking:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// ============================================
// POST /api/picking/:id/pause - Mettre en pause
// ============================================
router.post('/:id/pause',
  auth,
  async (req, res) => {
    try {
      const pickingList = await PickingList.findById(req.params.id);

      if (!pickingList) {
        return res.status(404).json({ message: 'Liste de picking non trouvée' });
      }

      if (pickingList.status !== 'IN_PROGRESS') {
        return res.status(400).json({ message: 'La liste n\'est pas en cours' });
      }

      pickingList.status = 'PAUSED';
      await pickingList.save();

      res.json(pickingList);
    } catch (error) {
      console.error('Error pausing picking:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/picking/:id/resume - Reprendre
// ============================================
router.post('/:id/resume',
  auth,
  async (req, res) => {
    try {
      const pickingList = await PickingList.findById(req.params.id);

      if (!pickingList) {
        return res.status(404).json({ message: 'Liste de picking non trouvée' });
      }

      if (pickingList.status !== 'PAUSED') {
        return res.status(400).json({ message: 'La liste n\'est pas en pause' });
      }

      pickingList.status = 'IN_PROGRESS';
      await pickingList.save();

      res.json(pickingList);
    } catch (error) {
      console.error('Error resuming picking:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// DELETE /api/picking/:id - Annuler une liste
// ============================================
router.delete('/:id',
  auth,
  checkRole(['ADMIN', 'MANAGER']),
  async (req, res) => {
    try {
      const pickingList = await PickingList.findById(req.params.id);

      if (!pickingList) {
        return res.status(404).json({ message: 'Liste de picking non trouvée' });
      }

      if (pickingList.status === 'COMPLETED') {
        return res.status(400).json({
          message: 'Impossible d\'annuler une liste terminée'
        });
      }

      // Remettre les commandes en attente
      await Order.updateMany(
        { _id: { $in: pickingList.orders.map(o => o.order) } },
        { status: 'VALIDATED' }
      );

      pickingList.status = 'CANCELLED';
      await pickingList.save();

      res.json({ message: 'Liste de picking annulée' });
    } catch (error) {
      console.error('Error cancelling picking list:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

module.exports = router;
