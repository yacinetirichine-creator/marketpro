// ============================================
// MARKET PRO API - Routes Réception Fournisseur
// ============================================

const express = require('express');
const router = express.Router();
const { Receipt, Supplier, Product, StockLot, Location, StockMovement } = require('../models');
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
// GET /api/receipts - Liste des réceptions
// ============================================
router.get('/', auth, async (req, res) => {
  try {
    const {
      status,
      supplier,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (supplier) query.supplier = supplier;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const receipts = await Receipt.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('supplier', 'code company.name')
      .populate('receivedBy', 'name');

    const total = await Receipt.countDocuments(query);

    res.json({
      data: receipts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/receipts/pending - Réceptions en attente
// ============================================
router.get('/pending', auth, async (req, res) => {
  try {
    const receipts = await Receipt.findPending();
    res.json(receipts);
  } catch (error) {
    console.error('Error fetching pending receipts:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/receipts/today-stats - Stats du jour
// ============================================
router.get('/today-stats', auth, async (req, res) => {
  try {
    const stats = await Receipt.getTodayStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching today stats:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// GET /api/receipts/:id - Détail d'une réception
// ============================================
router.get('/:id', auth, async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('supplier', 'code company contact')
      .populate('items.product', 'sku name barcode category')
      .populate('items.location', 'code zone')
      .populate('items.stockLot', 'lotNumber')
      .populate('receivedBy validatedBy', 'name email');

    if (!receipt) {
      return res.status(404).json({ message: 'Réception non trouvée' });
    }

    res.json(receipt);
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// ============================================
// POST /api/receipts - Créer une réception
// ============================================
router.post('/',
  auth,
  checkRole(['ADMIN', 'MANAGER', 'MAGASINIER']),
  [
    body('supplier').isMongoId().withMessage('Fournisseur invalide'),
    body('items').isArray({ min: 1 }).withMessage('Au moins un article requis')
  ],
  validate,
  async (req, res) => {
    try {
      // Générer le numéro de réception
      const receiptNumber = await Receipt.generateReceiptNumber();

      const receipt = new Receipt({
        ...req.body,
        receiptNumber,
        receivedBy: req.user.id,
        status: 'DRAFT'
      });

      await receipt.save();

      res.status(201).json(receipt);
    } catch (error) {
      console.error('Error creating receipt:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/receipts/from-ocr - Créer depuis OCR
// ============================================
router.post('/from-ocr',
  auth,
  checkRole(['ADMIN', 'MANAGER', 'MAGASINIER']),
  [
    body('supplier').isMongoId().withMessage('Fournisseur invalide'),
    body('ocrData').isObject().withMessage('Données OCR requises')
  ],
  validate,
  async (req, res) => {
    try {
      const { supplier, ocrData, documentUrl } = req.body;

      // Récupérer le fournisseur pour le mapping des produits
      const supplierDoc = await Supplier.findById(supplier);
      if (!supplierDoc) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }

      // Mapper les articles OCR vers les produits
      const items = [];
      for (const ocrItem of ocrData.items || []) {
        // Chercher le produit par référence fournisseur ou code-barres
        let product = await Product.findOne({
          $or: [
            { supplierRef: ocrItem.reference },
            { barcode: ocrItem.barcode },
            { sku: ocrItem.sku }
          ]
        });

        items.push({
          product: product?._id,
          supplierRef: ocrItem.reference,
          description: ocrItem.description || ocrItem.name,
          expectedQuantity: ocrItem.quantity,
          receivedQuantity: ocrItem.quantity,
          unit: ocrItem.unit || 'PIECE',
          unitPrice: ocrItem.unitPrice,
          totalPrice: ocrItem.totalPrice || (ocrItem.quantity * ocrItem.unitPrice),
          expiryDate: ocrItem.expiryDate ? new Date(ocrItem.expiryDate) : null,
          status: 'PENDING'
        });
      }

      // Générer le numéro de réception
      const receiptNumber = await Receipt.generateReceiptNumber();

      const receipt = new Receipt({
        receiptNumber,
        supplier,
        deliveryNote: {
          number: ocrData.deliveryNoteNumber || ocrData.blNumber,
          date: ocrData.date ? new Date(ocrData.date) : new Date(),
          originalFile: documentUrl,
          ocrData: {
            raw: ocrData.rawText,
            parsed: ocrData,
            confidence: ocrData.confidence || 0,
            processedAt: new Date()
          }
        },
        items,
        receivedBy: req.user.id,
        status: 'DRAFT'
      });

      await receipt.save();

      res.status(201).json(receipt);
    } catch (error) {
      console.error('Error creating receipt from OCR:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// PUT /api/receipts/:id - Modifier une réception
// ============================================
router.put('/:id',
  auth,
  checkRole(['ADMIN', 'MANAGER', 'MAGASINIER']),
  async (req, res) => {
    try {
      const receipt = await Receipt.findById(req.params.id);

      if (!receipt) {
        return res.status(404).json({ message: 'Réception non trouvée' });
      }

      if (receipt.status === 'COMPLETED') {
        return res.status(400).json({ message: 'Impossible de modifier une réception terminée' });
      }

      Object.assign(receipt, req.body);
      await receipt.save();

      res.json(receipt);
    } catch (error) {
      console.error('Error updating receipt:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/receipts/:id/start - Démarrer la réception
// ============================================
router.post('/:id/start',
  auth,
  checkRole(['ADMIN', 'MANAGER', 'MAGASINIER']),
  async (req, res) => {
    try {
      const receipt = await Receipt.findById(req.params.id);

      if (!receipt) {
        return res.status(404).json({ message: 'Réception non trouvée' });
      }

      await receipt.startReception(req.user.id);

      res.json(receipt);
    } catch (error) {
      console.error('Error starting receipt:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/receipts/:id/items/:itemIndex/receive - Recevoir un article
// ============================================
router.post('/:id/items/:itemIndex/receive',
  auth,
  checkRole(['ADMIN', 'MANAGER', 'MAGASINIER']),
  [
    body('receivedQuantity').isNumeric().withMessage('Quantité requise'),
    body('locationCode').optional().isString()
  ],
  validate,
  async (req, res) => {
    try {
      const receipt = await Receipt.findById(req.params.id);
      const itemIndex = parseInt(req.params.itemIndex);

      if (!receipt) {
        return res.status(404).json({ message: 'Réception non trouvée' });
      }

      if (!receipt.items[itemIndex]) {
        return res.status(404).json({ message: 'Article non trouvé' });
      }

      const item = receipt.items[itemIndex];
      const { receivedQuantity, acceptedQuantity, rejectedQuantity, locationCode, expiryDate, quality } = req.body;

      // Mettre à jour l'article
      item.receivedQuantity = receivedQuantity;
      item.acceptedQuantity = acceptedQuantity || receivedQuantity;
      item.rejectedQuantity = rejectedQuantity || 0;
      item.locationCode = locationCode;
      item.status = 'RECEIVED';

      if (expiryDate) {
        item.expiryDate = new Date(expiryDate);
      }

      if (quality) {
        item.quality = {
          ...quality,
          checkedBy: req.user.id,
          checkedAt: new Date()
        };
      }

      // Trouver l'emplacement
      if (locationCode) {
        const location = await Location.findOne({ code: locationCode });
        if (location) {
          item.location = location._id;
        }
      }

      // Créer le lot de stock si le produit existe
      if (item.product && item.acceptedQuantity > 0) {
        const lotNumber = await StockLot.generateLotNumber();

        const stockLot = new StockLot({
          lotNumber,
          product: item.product,
          supplier: receipt.supplier,
          receipt: receipt._id,
          quantity: {
            initial: item.acceptedQuantity,
            current: item.acceptedQuantity,
            unit: item.unit
          },
          dates: {
            production: item.productionDate,
            expiry: item.expiryDate,
            received: new Date()
          },
          location: item.location,
          locationCode: item.locationCode,
          purchasePrice: {
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          },
          status: 'AVAILABLE'
        });

        await stockLot.save();

        item.stockLot = stockLot._id;
        item.lotNumber = lotNumber;

        // Mettre à jour le stock du produit
        const product = await Product.findById(item.product);
        if (product) {
          await product.addStock(item.acceptedQuantity, lotNumber);
        }

        // Créer le mouvement de stock
        const stockMovement = new StockMovement({
          type: 'ENTRY',
          product: item.product,
          quantity: item.acceptedQuantity,
          unit: item.unit,
          reference: receipt.receiptNumber,
          referenceType: 'RECEIPT',
          referenceId: receipt._id,
          lotNumber,
          location: item.locationCode,
          reason: 'Réception fournisseur',
          user: req.user.id
        });

        await stockMovement.save();

        // Mettre à jour l'emplacement
        if (item.location) {
          const location = await Location.findById(item.location);
          if (location) {
            location.currentProducts.push({
              product: item.product,
              stockLot: stockLot._id,
              quantity: item.acceptedQuantity,
              placedAt: new Date()
            });
            location.status = 'OCCUPIED';
            await location.save();
          }
        }
      }

      item.status = 'STORED';
      await receipt.save();

      res.json(receipt);
    } catch (error) {
      console.error('Error receiving item:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/receipts/:id/complete - Terminer la réception
// ============================================
router.post('/:id/complete',
  auth,
  checkRole(['ADMIN', 'MANAGER', 'MAGASINIER']),
  async (req, res) => {
    try {
      const receipt = await Receipt.findById(req.params.id);

      if (!receipt) {
        return res.status(404).json({ message: 'Réception non trouvée' });
      }

      await receipt.completeReception(req.user.id);

      res.json(receipt);
    } catch (error) {
      console.error('Error completing receipt:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// ============================================
// POST /api/receipts/:id/anomaly - Signaler une anomalie
// ============================================
router.post('/:id/anomaly',
  auth,
  checkRole(['ADMIN', 'MANAGER', 'MAGASINIER']),
  [
    body('type').isIn(['QUANTITY', 'QUALITY', 'DAMAGE', 'TEMPERATURE', 'MISSING', 'OTHER']),
    body('description').notEmpty()
  ],
  validate,
  async (req, res) => {
    try {
      const receipt = await Receipt.findById(req.params.id);

      if (!receipt) {
        return res.status(404).json({ message: 'Réception non trouvée' });
      }

      await receipt.addAnomaly(req.body);

      res.json(receipt);
    } catch (error) {
      console.error('Error adding anomaly:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// POST /api/receipts/:id/document - Ajouter un document
// ============================================
router.post('/:id/document',
  auth,
  checkRole(['ADMIN', 'MANAGER', 'MAGASINIER']),
  [
    body('type').isIn(['BL', 'FACTURE', 'CERTIFICAT', 'PHOTO', 'AUTRE']),
    body('url').notEmpty()
  ],
  validate,
  async (req, res) => {
    try {
      const receipt = await Receipt.findById(req.params.id);

      if (!receipt) {
        return res.status(404).json({ message: 'Réception non trouvée' });
      }

      receipt.documents.push({
        ...req.body,
        uploadedAt: new Date()
      });

      await receipt.save();

      res.json(receipt);
    } catch (error) {
      console.error('Error adding document:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

// ============================================
// DELETE /api/receipts/:id - Annuler une réception
// ============================================
router.delete('/:id',
  auth,
  checkRole(['ADMIN', 'MANAGER']),
  async (req, res) => {
    try {
      const receipt = await Receipt.findById(req.params.id);

      if (!receipt) {
        return res.status(404).json({ message: 'Réception non trouvée' });
      }

      if (receipt.status === 'COMPLETED') {
        return res.status(400).json({
          message: 'Impossible d\'annuler une réception terminée'
        });
      }

      receipt.status = 'CANCELLED';
      await receipt.save();

      res.json({ message: 'Réception annulée' });
    } catch (error) {
      console.error('Error cancelling receipt:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }
);

module.exports = router;
