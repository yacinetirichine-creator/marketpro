// ============================================
// MARKET PRO API - Modèle Réception Fournisseur
// ============================================

const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  // Numéro de réception unique
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  // Fournisseur
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },

  // Commande d'achat associée (optionnel)
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder'
  },
  purchaseOrderRef: String,

  // Document de livraison (BL)
  deliveryNote: {
    number: String,
    date: Date,
    originalFile: String, // URL du fichier scanné
    ocrData: {
      raw: String, // Texte brut OCR
      parsed: mongoose.Schema.Types.Mixed, // Données extraites
      confidence: Number, // Score de confiance OCR
      processedAt: Date
    }
  },

  // Articles reçus
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    supplierRef: String, // Référence fournisseur
    description: String,

    // Quantités
    expectedQuantity: { type: Number, min: 0 },
    receivedQuantity: { type: Number, required: true, min: 0 },
    acceptedQuantity: { type: Number, min: 0 },
    rejectedQuantity: { type: Number, default: 0, min: 0 },

    unit: {
      type: String,
      enum: ['PIECE', 'KG', 'LITRE', 'CARTON', 'PALETTE'],
      default: 'PIECE'
    },

    // Prix
    unitPrice: { type: Number, min: 0 },
    totalPrice: { type: Number, min: 0 },

    // Lot créé
    stockLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StockLot'
    },
    lotNumber: String,

    // Dates produit
    productionDate: Date,
    expiryDate: Date,

    // Emplacement assigné
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    },
    locationCode: String,

    // Contrôle qualité
    quality: {
      status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'PARTIAL'],
        default: 'PENDING'
      },
      grade: String,
      notes: String,
      checkedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      checkedAt: Date
    },

    // Écart
    variance: {
      quantity: Number, // Différence attendu vs reçu
      reason: String
    },

    // Statut ligne
    status: {
      type: String,
      enum: ['PENDING', 'RECEIVED', 'STORED', 'REJECTED'],
      default: 'PENDING'
    }
  }],

  // Totaux
  totals: {
    expectedItems: { type: Number, default: 0 },
    receivedItems: { type: Number, default: 0 },
    totalExpectedQty: { type: Number, default: 0 },
    totalReceivedQty: { type: Number, default: 0 },
    totalAcceptedQty: { type: Number, default: 0 },
    totalRejectedQty: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'EUR' }
  },

  // Statut global
  status: {
    type: String,
    enum: ['DRAFT', 'IN_PROGRESS', 'PENDING_QC', 'COMPLETED', 'CANCELLED'],
    default: 'DRAFT'
  },

  // Quai de réception
  receivingDock: {
    code: String,
    name: String
  },

  // Transporteur
  carrier: {
    name: String,
    vehicleNumber: String,
    driverName: String,
    temperature: Number // Température relevée à l'arrivée
  },

  // Documents associés
  documents: [{
    type: {
      type: String,
      enum: ['BL', 'FACTURE', 'CERTIFICAT', 'PHOTO', 'AUTRE']
    },
    name: String,
    url: String,
    ocrProcessed: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Utilisateurs
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Dates
  dates: {
    expected: Date,
    started: Date,
    completed: Date
  },

  // Notes
  notes: String,

  // Anomalies
  anomalies: [{
    type: {
      type: String,
      enum: ['QUANTITY', 'QUALITY', 'DAMAGE', 'TEMPERATURE', 'MISSING', 'OTHER']
    },
    description: String,
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    photo: String,
    resolvedAt: Date,
    resolution: String
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
receiptSchema.index({ receiptNumber: 1 });
receiptSchema.index({ supplier: 1 });
receiptSchema.index({ status: 1 });
receiptSchema.index({ createdAt: -1 });
receiptSchema.index({ 'deliveryNote.number': 1 });

// Virtuals
receiptSchema.virtual('hasVariance').get(function() {
  return this.items.some(item =>
    item.receivedQuantity !== item.expectedQuantity
  );
});

receiptSchema.virtual('variancePercentage').get(function() {
  if (this.totals.totalExpectedQty === 0) return 0;
  const variance = this.totals.totalReceivedQty - this.totals.totalExpectedQty;
  return ((variance / this.totals.totalExpectedQty) * 100).toFixed(2);
});

receiptSchema.virtual('isComplete').get(function() {
  return this.status === 'COMPLETED';
});

// Pré-save: calculer les totaux
receiptSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totals.expectedItems = this.items.length;
    this.totals.receivedItems = this.items.filter(i => i.status !== 'PENDING').length;
    this.totals.totalExpectedQty = this.items.reduce((sum, i) => sum + (i.expectedQuantity || 0), 0);
    this.totals.totalReceivedQty = this.items.reduce((sum, i) => sum + (i.receivedQuantity || 0), 0);
    this.totals.totalAcceptedQty = this.items.reduce((sum, i) => sum + (i.acceptedQuantity || 0), 0);
    this.totals.totalRejectedQty = this.items.reduce((sum, i) => sum + (i.rejectedQuantity || 0), 0);
    this.totals.totalAmount = this.items.reduce((sum, i) => sum + (i.totalPrice || 0), 0);

    // Calculer les écarts
    this.items.forEach(item => {
      if (item.expectedQuantity !== undefined) {
        item.variance = {
          quantity: item.receivedQuantity - item.expectedQuantity,
          reason: item.variance?.reason || ''
        };
      }
    });
  }

  next();
});

// Méthodes statiques
receiptSchema.statics.generateReceiptNumber = async function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const count = await this.countDocuments({
    createdAt: {
      $gte: new Date(year, date.getMonth(), 1),
      $lt: new Date(year, date.getMonth() + 1, 1)
    }
  });

  return `REC-${year}${month}-${String(count + 1).padStart(4, '0')}`;
};

receiptSchema.statics.findBySupplier = function(supplierId, options = {}) {
  const query = { supplier: supplierId };
  if (options.status) query.status = options.status;

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .populate('supplier', 'code company.name')
    .populate('receivedBy', 'name');
};

receiptSchema.statics.findPending = function() {
  return this.find({ status: { $in: ['DRAFT', 'IN_PROGRESS', 'PENDING_QC'] } })
    .sort({ 'dates.expected': 1 })
    .populate('supplier', 'code company.name');
};

receiptSchema.statics.getTodayStats = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const stats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: today, $lt: tomorrow }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totals.totalAmount' },
        totalItems: { $sum: '$totals.receivedItems' }
      }
    }
  ]);

  return stats;
};

// Méthodes d'instance
receiptSchema.methods.startReception = async function(userId) {
  this.status = 'IN_PROGRESS';
  this.receivedBy = userId;
  this.dates.started = new Date();
  return this.save();
};

receiptSchema.methods.completeReception = async function(userId) {
  // Vérifier que tous les articles sont traités
  const pendingItems = this.items.filter(i => i.status === 'PENDING');
  if (pendingItems.length > 0) {
    throw new Error(`${pendingItems.length} articles en attente de traitement`);
  }

  this.status = 'COMPLETED';
  this.validatedBy = userId;
  this.dates.completed = new Date();
  return this.save();
};

receiptSchema.methods.addAnomaly = async function(anomaly) {
  this.anomalies.push({
    ...anomaly,
    createdAt: new Date()
  });
  return this.save();
};

module.exports = mongoose.model('Receipt', receiptSchema);
