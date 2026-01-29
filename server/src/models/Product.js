// ============================================
// MARKET PRO API - Modèle Produit
// ============================================

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Identification
  sku: {
    type: String,
    required: [true, 'SKU requis'],
    unique: true,
    uppercase: true,
    trim: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  
  // Informations produit
  name: {
    type: String,
    required: [true, 'Nom du produit requis'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Catégorisation
  category: {
    type: String,
    required: [true, 'Catégorie requise'],
    enum: [
      'FRUITS_LEGUMES',
      'VIANDES',
      'POISSONS',
      'PRODUITS_LAITIERS',
      'EPICERIE',
      'BOISSONS',
      'SURGELES',
      'CONSERVES',
      'CONDIMENTS',
      'AUTRES'
    ]
  },
  subCategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Prix
  pricing: {
    purchasePrice: {
      type: Number,
      required: [true, 'Prix d\'achat requis'],
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Prix de vente requis'],
      min: 0
    },
    wholesalePrice: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    taxRate: {
      type: Number,
      default: 20, // TVA 20%
      min: 0,
      max: 100
    }
  },
  
  // Stock
  stock: {
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    minQuantity: {
      type: Number,
      default: 10,
      min: 0
    },
    maxQuantity: {
      type: Number,
      default: 1000,
      min: 0
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    unit: {
      type: String,
      enum: ['PIECE', 'KG', 'LITRE', 'CARTON', 'PALETTE'],
      default: 'PIECE'
    },
    unitWeight: {
      type: Number,
      min: 0
    }
  },
  
  // Emplacement entrepôt (WMS)
  location: {
    warehouse: {
      type: String,
      default: 'PRINCIPAL'
    },
    zone: {
      type: String,
      trim: true
    },
    aisle: {
      type: String,
      trim: true
    },
    shelf: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      trim: true
    }
  },
  
  // Fournisseur
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  supplierRef: {
    type: String,
    trim: true
  },
  
  // Dates importantes
  dates: {
    expirationDate: Date,
    productionDate: Date,
    lastRestockDate: Date
  },
  
  // Traçabilité
  traceability: {
    lotNumber: String,
    origin: String,
    certifications: [String]
  },
  
  // Médias
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Statut
  isActive: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Statistiques
  stats: {
    totalSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// INDEX
// ============================================
productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ 'stock.quantity': 1 });
productSchema.index({ supplier: 1 });
productSchema.index({ isActive: 1, isVisible: 1 });

// ============================================
// VIRTUALS
// ============================================

// Marge
productSchema.virtual('margin').get(function() {
  if (!this.pricing?.purchasePrice || !this.pricing?.sellingPrice) return 0;
  return ((this.pricing.sellingPrice - this.pricing.purchasePrice) / this.pricing.purchasePrice * 100).toFixed(2);
});

// Stock disponible
productSchema.virtual('availableStock').get(function() {
  return (this.stock?.quantity || 0) - (this.stock?.reservedQuantity || 0);
});

// Statut stock
productSchema.virtual('stockStatus').get(function() {
  const available = this.availableStock;
  const min = this.stock?.minQuantity || 10;
  
  if (available <= 0) return 'OUT_OF_STOCK';
  if (available <= min * 0.5) return 'CRITICAL';
  if (available <= min) return 'LOW';
  return 'IN_STOCK';
});

// Prix TTC
productSchema.virtual('priceWithTax').get(function() {
  if (!this.pricing?.sellingPrice) return 0;
  const taxRate = this.pricing.taxRate || 20;
  return (this.pricing.sellingPrice * (1 + taxRate / 100)).toFixed(2);
});

// Emplacement complet
productSchema.virtual('fullLocation').get(function() {
  const loc = this.location;
  if (!loc) return '';
  return [loc.zone, loc.aisle, loc.shelf, loc.position].filter(Boolean).join('-');
});

// ============================================
// MÉTHODES D'INSTANCE
// ============================================

// Réserver du stock
productSchema.methods.reserveStock = async function(quantity) {
  if (this.availableStock < quantity) {
    throw new Error('Stock insuffisant');
  }
  this.stock.reservedQuantity += quantity;
  return this.save();
};

// Libérer du stock réservé
productSchema.methods.releaseStock = async function(quantity) {
  this.stock.reservedQuantity = Math.max(0, this.stock.reservedQuantity - quantity);
  return this.save();
};

// Déduire du stock (après vente)
productSchema.methods.deductStock = async function(quantity) {
  if (this.stock.quantity < quantity) {
    throw new Error('Stock insuffisant');
  }
  this.stock.quantity -= quantity;
  this.stock.reservedQuantity = Math.max(0, this.stock.reservedQuantity - quantity);
  return this.save();
};

// Ajouter au stock (réception)
productSchema.methods.addStock = async function(quantity, lotNumber = null) {
  this.stock.quantity += quantity;
  this.dates.lastRestockDate = new Date();
  if (lotNumber) {
    this.traceability.lotNumber = lotNumber;
  }
  return this.save();
};

// ============================================
// MÉTHODES STATIQUES
// ============================================

// Produits en rupture
productSchema.statics.findOutOfStock = function() {
  return this.find({ 'stock.quantity': { $lte: 0 }, isActive: true });
};

// Produits en stock bas
productSchema.statics.findLowStock = function() {
  return this.find({
    isActive: true,
    $expr: { $lte: ['$stock.quantity', '$stock.minQuantity'] }
  });
};

// Recherche par catégorie
productSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true, isVisible: true });
};

// Statistiques globales
productSchema.statics.getGlobalStats = async function() {
  const stats = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalStockValue: { $sum: { $multiply: ['$stock.quantity', '$pricing.purchasePrice'] } },
        totalSellingValue: { $sum: { $multiply: ['$stock.quantity', '$pricing.sellingPrice'] } },
        avgMargin: { $avg: { $subtract: ['$pricing.sellingPrice', '$pricing.purchasePrice'] } },
        outOfStock: { $sum: { $cond: [{ $lte: ['$stock.quantity', 0] }, 1, 0] } }
      }
    }
  ]);
  return stats[0] || {};
};

module.exports = mongoose.model('Product', productSchema);
