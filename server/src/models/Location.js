// ============================================
// MARKET PRO API - Modèle Emplacement Entrepôt
// ============================================

const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  // Code unique d'emplacement: [ZONE]-[ALLÉE]-[RAYON]-[NIVEAU]
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  // Composants de l'emplacement
  zone: {
    type: String,
    required: true,
    enum: ['F', 'S', 'C', 'Q', 'P'], // Frais, Sec, Congélateur, Quai, Préparation
    uppercase: true
  },
  aisle: {
    type: String,
    required: true,
    uppercase: true,
    match: [/^[A-Z]$/, 'L\'allée doit être une lettre A-Z']
  },
  rack: {
    type: String,
    required: true,
    match: [/^\d{2}$/, 'Le rayon doit être un nombre à 2 chiffres']
  },
  level: {
    type: String,
    required: true,
    match: [/^\d{2}$/, 'Le niveau doit être un nombre à 2 chiffres']
  },

  // Informations de la zone
  zoneInfo: {
    name: {
      type: String,
      enum: ['Frais', 'Sec', 'Congélateur', 'Quai', 'Préparation']
    },
    temperature: {
      min: Number,
      max: Number,
      unit: { type: String, default: '°C' }
    },
    humidity: {
      min: Number,
      max: Number
    }
  },

  // Capacité
  capacity: {
    maxWeight: { type: Number, default: 500 }, // kg
    maxVolume: { type: Number, default: 1 }, // m³
    maxPalettes: { type: Number, default: 2 },
    currentOccupancy: { type: Number, default: 0, min: 0, max: 100 } // %
  },

  // Dimensions
  dimensions: {
    width: Number,  // cm
    depth: Number,  // cm
    height: Number  // cm
  },

  // Type d'emplacement
  type: {
    type: String,
    enum: ['RACK', 'SOL', 'PALETTE', 'PICKING', 'RESERVE', 'QUARANTINE'],
    default: 'RACK'
  },

  // Produits autorisés (catégories)
  allowedCategories: [{
    type: String,
    enum: [
      'FRU', 'LEG', 'VIA', 'POI', 'LAI', 'BOI',
      'EPI', 'SUR', 'FRA', 'HYG', 'EMB', 'DIV'
    ]
  }],

  // Produits actuellement stockés
  currentProducts: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    stockLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StockLot'
    },
    quantity: Number,
    placedAt: { type: Date, default: Date.now }
  }],

  // Statut
  status: {
    type: String,
    enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'BLOCKED'],
    default: 'AVAILABLE'
  },

  // Ordre de picking (pour optimisation parcours)
  pickingOrder: {
    type: Number,
    default: 0
  },

  // Coordonnées pour navigation
  coordinates: {
    x: Number,
    y: Number,
    floor: { type: Number, default: 0 }
  },

  // Notes
  notes: String,

  // Actif
  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
locationSchema.index({ code: 1 });
locationSchema.index({ zone: 1, aisle: 1, rack: 1, level: 1 });
locationSchema.index({ status: 1 });
locationSchema.index({ pickingOrder: 1 });
locationSchema.index({ 'currentProducts.product': 1 });

// Virtuals
locationSchema.virtual('zoneName').get(function() {
  const zoneNames = {
    'F': 'Frais',
    'S': 'Sec',
    'C': 'Congélateur',
    'Q': 'Quai',
    'P': 'Préparation'
  };
  return zoneNames[this.zone] || this.zone;
});

locationSchema.virtual('isEmpty').get(function() {
  return !this.currentProducts || this.currentProducts.length === 0;
});

locationSchema.virtual('fullCode').get(function() {
  return `${this.zone}-${this.aisle}-${this.rack}-${this.level}`;
});

// Pré-save: générer le code automatiquement
locationSchema.pre('save', function(next) {
  if (!this.code) {
    this.code = `${this.zone}-${this.aisle}-${this.rack}-${this.level}`;
  }

  // Définir les infos de zone
  const zoneConfigs = {
    'F': { name: 'Frais', temperature: { min: 2, max: 8 } },
    'S': { name: 'Sec', temperature: { min: 15, max: 25 } },
    'C': { name: 'Congélateur', temperature: { min: -25, max: -18 } },
    'Q': { name: 'Quai', temperature: { min: 10, max: 20 } },
    'P': { name: 'Préparation', temperature: { min: 10, max: 20 } }
  };

  if (zoneConfigs[this.zone]) {
    this.zoneInfo = zoneConfigs[this.zone];
  }

  next();
});

// Méthodes statiques
locationSchema.statics.findAvailable = function(zone = null) {
  const query = { status: 'AVAILABLE', isActive: true };
  if (zone) query.zone = zone;
  return this.find(query).sort({ pickingOrder: 1 });
};

locationSchema.statics.findByZone = function(zone) {
  return this.find({ zone, isActive: true }).sort({ aisle: 1, rack: 1, level: 1 });
};

locationSchema.statics.suggestLocation = async function(product) {
  // Suggérer un emplacement basé sur la catégorie du produit
  const categoryZoneMap = {
    'FRU': 'F', 'LEG': 'F', 'VIA': 'F', 'POI': 'F', 'LAI': 'F', 'FRA': 'F',
    'SUR': 'C',
    'EPI': 'S', 'BOI': 'S', 'HYG': 'S', 'EMB': 'S', 'DIV': 'S'
  };

  const zone = categoryZoneMap[product.categoryCode] || 'S';

  return this.findOne({
    zone,
    status: 'AVAILABLE',
    isActive: true
  }).sort({ pickingOrder: 1 });
};

// Générer le plan de l'entrepôt
locationSchema.statics.generateWarehouseLocations = async function(config = {}) {
  const {
    zones = ['F', 'S', 'C'],
    aislesPerZone = 4,
    racksPerAisle = 10,
    levelsPerRack = 5
  } = config;

  const locations = [];
  let pickingOrder = 0;

  for (const zone of zones) {
    for (let a = 0; a < aislesPerZone; a++) {
      const aisle = String.fromCharCode(65 + a); // A, B, C, D...
      for (let r = 1; r <= racksPerAisle; r++) {
        const rack = String(r).padStart(2, '0');
        for (let l = 1; l <= levelsPerRack; l++) {
          const level = String(l).padStart(2, '0');
          locations.push({
            zone,
            aisle,
            rack,
            level,
            code: `${zone}-${aisle}-${rack}-${level}`,
            pickingOrder: pickingOrder++,
            status: 'AVAILABLE',
            isActive: true
          });
        }
      }
    }
  }

  return this.insertMany(locations, { ordered: false });
};

module.exports = mongoose.model('Location', locationSchema);
