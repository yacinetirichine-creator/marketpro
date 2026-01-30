// ============================================
// MARKET PRO API - Modèle Inventaire
// ============================================

const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  // Numéro d'inventaire unique
  inventoryNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  // Type d'inventaire
  type: {
    type: String,
    required: true,
    enum: ['FULL', 'PARTIAL', 'CYCLIC', 'SPOT'],
    // FULL = Complet, PARTIAL = Par zone, CYCLIC = Tournant, SPOT = Ponctuel
  },

  // Périmètre de l'inventaire
  scope: {
    zones: [String], // Zones concernées (F, S, C, etc.)
    categories: [String], // Catégories de produits
    locations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    }],
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }]
  },

  // Équipes assignées
  teams: [{
    name: String,
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['COUNTER', 'VALIDATOR', 'SUPERVISOR']
      }
    }],
    assignedZones: [String]
  }],

  // Comptages
  counts: [{
    // Produit/Lot
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    stockLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StockLot'
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    },
    locationCode: String,

    // Quantités
    theoreticalQty: { type: Number, default: 0 },
    countedQty: { type: Number },
    reCountedQty: { type: Number }, // 2ème comptage si écart
    finalQty: { type: Number },

    unit: {
      type: String,
      enum: ['PIECE', 'KG', 'LITRE', 'CARTON', 'PALETTE'],
      default: 'PIECE'
    },

    // Écart
    variance: {
      quantity: Number,
      percentage: Number,
      value: Number, // Valeur de l'écart en €
      reason: {
        type: String,
        enum: ['THEFT', 'DAMAGE', 'COUNTING_ERROR', 'SYSTEM_ERROR', 'UNKNOWN', 'EXPIRY', 'OTHER']
      },
      notes: String
    },

    // Statut du comptage
    status: {
      type: String,
      enum: ['PENDING', 'COUNTED', 'VARIANCE', 'RECOUNTED', 'VALIDATED', 'ADJUSTED'],
      default: 'PENDING'
    },

    // Qui a compté
    countedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    countedAt: Date,

    reCountedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reCountedAt: Date,

    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    validatedAt: Date
  }],

  // Régularisations (ajustements de stock)
  adjustments: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    stockLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StockLot'
    },
    location: String,

    previousQty: Number,
    newQty: Number,
    adjustment: Number,
    value: Number,

    reason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,

    stockMovement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StockMovement'
    }
  }],

  // Statistiques globales
  stats: {
    totalLocations: { type: Number, default: 0 },
    countedLocations: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    countedProducts: { type: Number, default: 0 },

    theoreticalValue: { type: Number, default: 0 },
    countedValue: { type: Number, default: 0 },
    varianceValue: { type: Number, default: 0 },

    positiveVariances: { type: Number, default: 0 },
    negativeVariances: { type: Number, default: 0 },
    noVariances: { type: Number, default: 0 },

    accuracy: { type: Number, default: 0 } // % de précision
  },

  // Statut global
  status: {
    type: String,
    enum: ['PLANNED', 'IN_PROGRESS', 'COUNTING', 'VALIDATION', 'ADJUSTMENT', 'COMPLETED', 'CANCELLED'],
    default: 'PLANNED'
  },

  // Configuration
  config: {
    varianceThreshold: { type: Number, default: 5 }, // % d'écart pour recomptage
    requireDoubleCount: { type: Boolean, default: true },
    autoAdjust: { type: Boolean, default: false },
    freezeStock: { type: Boolean, default: false } // Bloquer mouvements pendant inventaire
  },

  // Dates
  dates: {
    planned: Date,
    started: Date,
    countingEnded: Date,
    validationEnded: Date,
    completed: Date
  },

  // Responsables
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  supervisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Notes
  notes: String,

  // Rapport final
  report: {
    generated: { type: Boolean, default: false },
    url: String,
    generatedAt: Date
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
inventorySchema.index({ inventoryNumber: 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ type: 1 });
inventorySchema.index({ 'dates.planned': 1 });
inventorySchema.index({ createdAt: -1 });

// Virtuals
inventorySchema.virtual('progress').get(function() {
  if (this.stats.totalProducts === 0) return 0;
  return Math.round((this.stats.countedProducts / this.stats.totalProducts) * 100);
});

inventorySchema.virtual('isComplete').get(function() {
  return this.status === 'COMPLETED';
});

inventorySchema.virtual('hasVariances').get(function() {
  return this.counts.some(c => c.status === 'VARIANCE' || (c.variance && c.variance.quantity !== 0));
});

// Pré-save: calculer les statistiques
inventorySchema.pre('save', function(next) {
  if (this.counts && this.counts.length > 0) {
    // Stats de comptage
    this.stats.totalProducts = this.counts.length;
    this.stats.countedProducts = this.counts.filter(c => c.status !== 'PENDING').length;

    // Stats de variance
    let positiveVariances = 0;
    let negativeVariances = 0;
    let noVariances = 0;
    let theoreticalValue = 0;
    let countedValue = 0;

    this.counts.forEach(count => {
      if (count.variance && count.variance.quantity !== undefined) {
        if (count.variance.quantity > 0) positiveVariances++;
        else if (count.variance.quantity < 0) negativeVariances++;
        else noVariances++;

        if (count.variance.value) {
          theoreticalValue += Math.abs(count.theoreticalQty * (count.variance.value / count.variance.quantity || 0));
        }
      }
    });

    this.stats.positiveVariances = positiveVariances;
    this.stats.negativeVariances = negativeVariances;
    this.stats.noVariances = noVariances;

    // Précision
    if (this.stats.countedProducts > 0) {
      this.stats.accuracy = Math.round((noVariances / this.stats.countedProducts) * 100);
    }
  }

  next();
});

// Méthodes statiques
inventorySchema.statics.generateInventoryNumber = async function(type) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const typePrefix = type.charAt(0); // F, P, C, S

  const count = await this.countDocuments({
    createdAt: {
      $gte: new Date(year, 0, 1),
      $lt: new Date(year + 1, 0, 1)
    }
  });

  return `INV-${typePrefix}-${year}${month}-${String(count + 1).padStart(4, '0')}`;
};

inventorySchema.statics.findActive = function() {
  return this.find({
    status: { $in: ['IN_PROGRESS', 'COUNTING', 'VALIDATION'] }
  }).populate('createdBy supervisedBy', 'name');
};

inventorySchema.statics.findPlanned = function() {
  return this.find({ status: 'PLANNED' })
    .sort({ 'dates.planned': 1 })
    .populate('createdBy', 'name');
};

// Méthodes d'instance
inventorySchema.methods.start = async function(userId) {
  if (this.status !== 'PLANNED') {
    throw new Error('L\'inventaire doit être en statut PLANNED pour démarrer');
  }

  this.status = 'IN_PROGRESS';
  this.dates.started = new Date();
  this.supervisedBy = userId;

  return this.save();
};

inventorySchema.methods.addCount = async function(countData) {
  // Calculer l'écart
  const variance = countData.countedQty - countData.theoreticalQty;
  const variancePercentage = countData.theoreticalQty > 0
    ? (variance / countData.theoreticalQty) * 100
    : 0;

  const needsRecount = Math.abs(variancePercentage) > this.config.varianceThreshold;

  const count = {
    ...countData,
    variance: {
      quantity: variance,
      percentage: variancePercentage
    },
    status: variance === 0 ? 'VALIDATED' : (needsRecount ? 'VARIANCE' : 'COUNTED'),
    countedAt: new Date()
  };

  // Chercher si le produit existe déjà
  const existingIndex = this.counts.findIndex(
    c => c.product?.toString() === countData.product?.toString() &&
         c.locationCode === countData.locationCode
  );

  if (existingIndex >= 0) {
    this.counts[existingIndex] = { ...this.counts[existingIndex], ...count };
  } else {
    this.counts.push(count);
  }

  return this.save();
};

inventorySchema.methods.validateCount = async function(countIndex, userId, finalQty = null) {
  if (!this.counts[countIndex]) {
    throw new Error('Comptage non trouvé');
  }

  const count = this.counts[countIndex];
  count.finalQty = finalQty !== null ? finalQty : count.countedQty;
  count.status = 'VALIDATED';
  count.validatedBy = userId;
  count.validatedAt = new Date();

  // Recalculer l'écart avec la quantité finale
  count.variance.quantity = count.finalQty - count.theoreticalQty;

  return this.save();
};

inventorySchema.methods.complete = async function(userId) {
  // Vérifier que tous les comptages sont validés
  const pendingCounts = this.counts.filter(c =>
    c.status !== 'VALIDATED' && c.status !== 'ADJUSTED'
  );

  if (pendingCounts.length > 0) {
    throw new Error(`${pendingCounts.length} comptages en attente de validation`);
  }

  this.status = 'COMPLETED';
  this.dates.completed = new Date();

  return this.save();
};

module.exports = mongoose.model('Inventory', inventorySchema);
