// ============================================
// MARKET PRO API - Modèle Lot de Stock
// ============================================

const mongoose = require('mongoose');

const stockLotSchema = new mongoose.Schema({
  // Numéro de lot unique
  lotNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  // Produit associé
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  // Fournisseur d'origine
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },

  // Réception associée
  receipt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt'
  },

  // Quantités
  quantity: {
    initial: { type: Number, required: true, min: 0 },
    current: { type: Number, required: true, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    unit: {
      type: String,
      enum: ['PIECE', 'KG', 'LITRE', 'CARTON', 'PALETTE'],
      default: 'PIECE'
    }
  },

  // Dates importantes
  dates: {
    production: Date,
    expiry: Date, // DLC
    bestBefore: Date, // DLUO
    received: { type: Date, default: Date.now }
  },

  // Emplacement actuel
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  locationCode: String,

  // Traçabilité
  traceability: {
    origin: String, // Pays/région d'origine
    certifications: [String], // Bio, Label Rouge, etc.
    batchRef: String, // Référence lot fournisseur
    temperature: {
      min: Number,
      max: Number,
      recorded: [{ value: Number, date: Date }]
    }
  },

  // Prix d'achat pour ce lot
  purchasePrice: {
    unitPrice: { type: Number, min: 0 },
    totalPrice: { type: Number, min: 0 },
    currency: { type: String, default: 'EUR' }
  },

  // Statut
  status: {
    type: String,
    enum: ['AVAILABLE', 'RESERVED', 'IN_PICKING', 'QUARANTINE', 'EXPIRED', 'CONSUMED'],
    default: 'AVAILABLE'
  },

  // Rotation (FIFO/LIFO/FEFO)
  rotationPriority: {
    type: Number,
    default: 0 // Plus bas = sorti en premier
  },

  // Qualité
  quality: {
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'REJECTED'],
      default: 'A'
    },
    inspectionDate: Date,
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  },

  // Historique des mouvements
  movements: [{
    type: {
      type: String,
      enum: ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'RETURN']
    },
    quantity: Number,
    reason: String,
    reference: String,
    fromLocation: String,
    toLocation: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: { type: Date, default: Date.now }
  }],

  // Notes
  notes: String

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
stockLotSchema.index({ lotNumber: 1 });
stockLotSchema.index({ product: 1 });
stockLotSchema.index({ supplier: 1 });
stockLotSchema.index({ location: 1 });
stockLotSchema.index({ status: 1 });
stockLotSchema.index({ 'dates.expiry': 1 });
stockLotSchema.index({ rotationPriority: 1 });

// Virtuals
stockLotSchema.virtual('availableQuantity').get(function() {
  return this.quantity.current - this.quantity.reserved;
});

stockLotSchema.virtual('isExpired').get(function() {
  if (!this.dates.expiry) return false;
  return new Date() > this.dates.expiry;
});

stockLotSchema.virtual('isNearExpiry').get(function() {
  if (!this.dates.expiry) return false;
  const daysToExpiry = Math.ceil((this.dates.expiry - new Date()) / (1000 * 60 * 60 * 24));
  return daysToExpiry <= 7 && daysToExpiry > 0;
});

stockLotSchema.virtual('daysToExpiry').get(function() {
  if (!this.dates.expiry) return null;
  return Math.ceil((this.dates.expiry - new Date()) / (1000 * 60 * 60 * 24));
});

// Pré-save: mettre à jour le statut et la priorité
stockLotSchema.pre('save', function(next) {
  // Vérifier expiration
  if (this.isExpired && this.status !== 'EXPIRED' && this.status !== 'CONSUMED') {
    this.status = 'EXPIRED';
  }

  // Calculer priorité de rotation FEFO (First Expired, First Out)
  if (this.dates.expiry) {
    this.rotationPriority = this.dates.expiry.getTime();
  } else {
    this.rotationPriority = this.dates.received.getTime();
  }

  next();
});

// Méthodes d'instance
stockLotSchema.methods.reserve = async function(qty) {
  if (this.availableQuantity < qty) {
    throw new Error('Quantité disponible insuffisante');
  }
  this.quantity.reserved += qty;
  this.status = 'RESERVED';
  return this.save();
};

stockLotSchema.methods.release = async function(qty) {
  this.quantity.reserved = Math.max(0, this.quantity.reserved - qty);
  if (this.quantity.reserved === 0 && this.quantity.current > 0) {
    this.status = 'AVAILABLE';
  }
  return this.save();
};

stockLotSchema.methods.consume = async function(qty, reason = '', userId = null) {
  if (this.quantity.current < qty) {
    throw new Error('Stock insuffisant');
  }

  this.quantity.current -= qty;
  this.quantity.reserved = Math.max(0, this.quantity.reserved - qty);

  this.movements.push({
    type: 'OUT',
    quantity: qty,
    reason,
    user: userId,
    date: new Date()
  });

  if (this.quantity.current === 0) {
    this.status = 'CONSUMED';
  }

  return this.save();
};

stockLotSchema.methods.transfer = async function(newLocationId, newLocationCode, userId = null) {
  const oldLocation = this.locationCode;
  this.location = newLocationId;
  this.locationCode = newLocationCode;

  this.movements.push({
    type: 'TRANSFER',
    quantity: this.quantity.current,
    fromLocation: oldLocation,
    toLocation: newLocationCode,
    user: userId,
    date: new Date()
  });

  return this.save();
};

// Méthodes statiques
stockLotSchema.statics.generateLotNumber = async function(prefix = 'LOT') {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const count = await this.countDocuments({
    createdAt: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999))
    }
  });
  return `${prefix}-${dateStr}-${String(count + 1).padStart(4, '0')}`;
};

stockLotSchema.statics.findByProduct = function(productId, includeExpired = false) {
  const query = { product: productId };
  if (!includeExpired) {
    query.status = { $nin: ['EXPIRED', 'CONSUMED'] };
  }
  return this.find(query).sort({ rotationPriority: 1 });
};

stockLotSchema.statics.findExpiringSoon = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    'dates.expiry': { $lte: futureDate, $gte: new Date() },
    status: { $nin: ['EXPIRED', 'CONSUMED'] }
  }).sort({ 'dates.expiry': 1 }).populate('product location');
};

stockLotSchema.statics.findExpired = function() {
  return this.find({
    'dates.expiry': { $lt: new Date() },
    status: { $ne: 'CONSUMED' },
    'quantity.current': { $gt: 0 }
  }).populate('product location');
};

// Sélectionner les lots pour le picking (FEFO)
stockLotSchema.statics.selectForPicking = async function(productId, requiredQty) {
  const lots = await this.find({
    product: productId,
    status: 'AVAILABLE',
    'quantity.current': { $gt: 0 }
  }).sort({ rotationPriority: 1 });

  const selectedLots = [];
  let remainingQty = requiredQty;

  for (const lot of lots) {
    if (remainingQty <= 0) break;

    const available = lot.availableQuantity;
    const toTake = Math.min(available, remainingQty);

    if (toTake > 0) {
      selectedLots.push({
        lot,
        quantity: toTake,
        location: lot.locationCode
      });
      remainingQty -= toTake;
    }
  }

  return {
    lots: selectedLots,
    fulfilled: remainingQty <= 0,
    shortage: Math.max(0, remainingQty)
  };
};

module.exports = mongoose.model('StockLot', stockLotSchema);
