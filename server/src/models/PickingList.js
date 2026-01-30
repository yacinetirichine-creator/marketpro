// ============================================
// MARKET PRO API - Modèle Liste de Picking
// ============================================

const mongoose = require('mongoose');

const pickingListSchema = new mongoose.Schema({
  // Numéro de picking unique
  pickingNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  // Commandes associées
  orders: [{
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    orderNumber: String,
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    clientName: String,
    priority: {
      type: Number,
      default: 0 // Plus haut = plus prioritaire
    },
    deliveryMode: {
      type: String,
      enum: ['DELIVERY', 'PICKUP']
    },
    deliverySlot: {
      date: Date,
      startTime: String,
      endTime: String
    }
  }],

  // Mode de picking
  mode: {
    type: String,
    enum: ['SINGLE', 'BATCH', 'WAVE'],
    // SINGLE = 1 commande, BATCH = plusieurs commandes, WAVE = par créneau
    default: 'SINGLE'
  },

  // Vague (pour WAVE picking)
  wave: {
    number: Number,
    name: String,
    deliverySlot: {
      date: Date,
      startTime: String,
      endTime: String
    }
  },

  // Articles à prélever (route optimisée)
  items: [{
    // Ordre dans le parcours
    sequence: { type: Number, required: true },

    // Produit
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    sku: String,
    productName: String,
    barcode: String,

    // Lot à prélever (FEFO)
    stockLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StockLot'
    },
    lotNumber: String,
    expiryDate: Date,

    // Emplacement
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    },
    locationCode: String,
    zone: String,

    // Quantités
    requestedQty: { type: Number, required: true, min: 0 },
    pickedQty: { type: Number, default: 0, min: 0 },
    unit: {
      type: String,
      enum: ['PIECE', 'KG', 'LITRE', 'CARTON', 'PALETTE'],
      default: 'PIECE'
    },

    // Pour quelle(s) commande(s)
    forOrders: [{
      order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      },
      orderNumber: String,
      quantity: Number
    }],

    // Statut de la ligne
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'PICKED', 'PARTIAL', 'SHORTAGE', 'SKIPPED'],
      default: 'PENDING'
    },

    // Picking
    pickedAt: Date,
    pickedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // En cas de problème
    issue: {
      type: {
        type: String,
        enum: ['SHORTAGE', 'WRONG_LOCATION', 'DAMAGED', 'EXPIRED', 'NOT_FOUND']
      },
      description: String,
      photo: String,
      substitute: {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        quantity: Number,
        approved: Boolean,
        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    },

    // Scan de validation
    scanned: {
      type: Boolean,
      default: false
    },
    scannedBarcode: String
  }],

  // Parcours optimisé
  route: {
    totalDistance: Number, // mètres
    estimatedTime: Number, // minutes
    zones: [String], // Ordre des zones
    path: [{
      locationCode: String,
      sequence: Number,
      coordinates: {
        x: Number,
        y: Number
      }
    }]
  },

  // Préparateur assigné
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,

  // Équipement
  equipment: {
    type: {
      type: String,
      enum: ['MANUAL', 'CART', 'FORKLIFT', 'PALLET_JACK']
    },
    id: String
  },

  // Statut global
  status: {
    type: String,
    enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },

  // Statistiques
  stats: {
    totalItems: { type: Number, default: 0 },
    pickedItems: { type: Number, default: 0 },
    totalQty: { type: Number, default: 0 },
    pickedQty: { type: Number, default: 0 },
    shortageItems: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 } // %
  },

  // Timestamps
  dates: {
    created: { type: Date, default: Date.now },
    assigned: Date,
    started: Date,
    completed: Date
  },

  // Durée réelle
  duration: {
    planned: Number, // minutes
    actual: Number   // minutes
  },

  // Zone de préparation (consolidation)
  preparationZone: {
    code: String,
    bay: String
  },

  // Notes
  notes: String,

  // Priorité globale
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL'
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
pickingListSchema.index({ pickingNumber: 1 });
pickingListSchema.index({ status: 1 });
pickingListSchema.index({ assignedTo: 1 });
pickingListSchema.index({ priority: -1 });
pickingListSchema.index({ 'dates.created': -1 });
pickingListSchema.index({ 'orders.order': 1 });

// Virtuals
pickingListSchema.virtual('progress').get(function() {
  if (this.stats.totalItems === 0) return 0;
  return Math.round((this.stats.pickedItems / this.stats.totalItems) * 100);
});

pickingListSchema.virtual('isComplete').get(function() {
  return this.status === 'COMPLETED';
});

pickingListSchema.virtual('hasShortages').get(function() {
  return this.items.some(i => i.status === 'SHORTAGE');
});

pickingListSchema.virtual('currentItem').get(function() {
  return this.items.find(i => i.status === 'IN_PROGRESS') ||
         this.items.find(i => i.status === 'PENDING');
});

// Pré-save: calculer les stats
pickingListSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.stats.totalItems = this.items.length;
    this.stats.pickedItems = this.items.filter(i =>
      i.status === 'PICKED' || i.status === 'PARTIAL'
    ).length;
    this.stats.totalQty = this.items.reduce((sum, i) => sum + i.requestedQty, 0);
    this.stats.pickedQty = this.items.reduce((sum, i) => sum + i.pickedQty, 0);
    this.stats.shortageItems = this.items.filter(i => i.status === 'SHORTAGE').length;

    // Précision
    if (this.stats.totalQty > 0) {
      this.stats.accuracy = Math.round((this.stats.pickedQty / this.stats.totalQty) * 100);
    }
  }

  next();
});

// Méthodes statiques
pickingListSchema.statics.generatePickingNumber = async function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const count = await this.countDocuments({
    createdAt: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999))
    }
  });

  return `PICK-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
};

pickingListSchema.statics.findPending = function() {
  return this.find({ status: { $in: ['PENDING', 'ASSIGNED'] } })
    .sort({ priority: -1, 'dates.created': 1 })
    .populate('assignedTo', 'name')
    .populate('orders.client', 'name');
};

pickingListSchema.statics.findByUser = function(userId) {
  return this.find({
    assignedTo: userId,
    status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'PAUSED'] }
  }).sort({ priority: -1 });
};

pickingListSchema.statics.findByOrder = function(orderId) {
  return this.findOne({ 'orders.order': orderId });
};

// Créer une liste de picking optimisée à partir de commandes
pickingListSchema.statics.createOptimizedList = async function(orderIds, options = {}) {
  const Order = mongoose.model('Order');
  const StockLot = mongoose.model('StockLot');
  const Location = mongoose.model('Location');

  // Récupérer les commandes
  const orders = await Order.find({ _id: { $in: orderIds } })
    .populate('client', 'name')
    .populate('items.product');

  if (orders.length === 0) {
    throw new Error('Aucune commande trouvée');
  }

  // Agréger les articles par produit
  const productMap = new Map();

  for (const order of orders) {
    for (const item of order.items) {
      const key = item.product._id.toString();
      if (!productMap.has(key)) {
        productMap.set(key, {
          product: item.product,
          totalQty: 0,
          forOrders: []
        });
      }
      const entry = productMap.get(key);
      entry.totalQty += item.quantity;
      entry.forOrders.push({
        order: order._id,
        orderNumber: order.orderNumber,
        quantity: item.quantity
      });
    }
  }

  // Sélectionner les lots et emplacements (FEFO)
  const items = [];
  let sequence = 1;

  for (const [productId, data] of productMap) {
    const lotSelection = await StockLot.selectForPicking(productId, data.totalQty);

    for (const selection of lotSelection.lots) {
      const location = await Location.findById(selection.lot.location);

      items.push({
        sequence,
        product: data.product._id,
        sku: data.product.sku,
        productName: data.product.name,
        barcode: data.product.barcode,
        stockLot: selection.lot._id,
        lotNumber: selection.lot.lotNumber,
        expiryDate: selection.lot.dates?.expiry,
        location: selection.lot.location,
        locationCode: selection.lot.locationCode || location?.code,
        zone: location?.zone,
        requestedQty: selection.quantity,
        unit: data.product.stock?.unit || 'PIECE',
        forOrders: data.forOrders,
        status: 'PENDING'
      });

      sequence++;
    }

    // Ajouter un item de shortage si nécessaire
    if (!lotSelection.fulfilled) {
      items.push({
        sequence,
        product: data.product._id,
        sku: data.product.sku,
        productName: data.product.name,
        barcode: data.product.barcode,
        locationCode: 'N/A',
        requestedQty: lotSelection.shortage,
        unit: data.product.stock?.unit || 'PIECE',
        forOrders: data.forOrders,
        status: 'SHORTAGE',
        issue: {
          type: 'SHORTAGE',
          description: `Rupture de stock: ${lotSelection.shortage} unités manquantes`
        }
      });
      sequence++;
    }
  }

  // Trier par zone puis par emplacement (parcours serpentin)
  items.sort((a, b) => {
    if (a.zone !== b.zone) {
      const zoneOrder = { 'F': 1, 'S': 2, 'C': 3 };
      return (zoneOrder[a.zone] || 99) - (zoneOrder[b.zone] || 99);
    }
    return (a.locationCode || '').localeCompare(b.locationCode || '');
  });

  // Renuméroter les séquences
  items.forEach((item, index) => {
    item.sequence = index + 1;
  });

  // Générer le numéro
  const pickingNumber = await this.generatePickingNumber();

  // Créer la liste
  const pickingList = new this({
    pickingNumber,
    mode: orders.length === 1 ? 'SINGLE' : 'BATCH',
    orders: orders.map(o => ({
      order: o._id,
      orderNumber: o.orderNumber,
      client: o.client._id,
      clientName: o.client.name,
      deliveryMode: o.deliveryMode || 'DELIVERY',
      deliverySlot: o.deliverySlot
    })),
    items,
    route: {
      zones: [...new Set(items.map(i => i.zone).filter(Boolean))],
      estimatedTime: Math.ceil(items.length * 0.5) // 30s par article en moyenne
    },
    priority: options.priority || 'NORMAL'
  });

  return pickingList.save();
};

// Méthodes d'instance
pickingListSchema.methods.assign = async function(userId) {
  this.assignedTo = userId;
  this.assignedAt = new Date();
  this.dates.assigned = new Date();
  this.status = 'ASSIGNED';
  return this.save();
};

pickingListSchema.methods.start = async function() {
  if (this.status !== 'ASSIGNED') {
    throw new Error('La liste doit être assignée avant de démarrer');
  }
  this.status = 'IN_PROGRESS';
  this.dates.started = new Date();

  // Marquer le premier item comme en cours
  if (this.items.length > 0) {
    this.items[0].status = 'IN_PROGRESS';
  }

  return this.save();
};

pickingListSchema.methods.pickItem = async function(itemIndex, pickedQty, scannedBarcode = null) {
  const item = this.items[itemIndex];
  if (!item) {
    throw new Error('Article non trouvé');
  }

  item.pickedQty = pickedQty;
  item.pickedAt = new Date();
  item.pickedBy = this.assignedTo;

  if (scannedBarcode) {
    item.scanned = true;
    item.scannedBarcode = scannedBarcode;
  }

  // Déterminer le statut
  if (pickedQty === item.requestedQty) {
    item.status = 'PICKED';
  } else if (pickedQty > 0) {
    item.status = 'PARTIAL';
  } else {
    item.status = 'SHORTAGE';
  }

  // Passer au prochain item
  const nextItem = this.items.find(i => i.status === 'PENDING');
  if (nextItem) {
    nextItem.status = 'IN_PROGRESS';
  }

  return this.save();
};

pickingListSchema.methods.complete = async function() {
  const pendingItems = this.items.filter(i =>
    i.status === 'PENDING' || i.status === 'IN_PROGRESS'
  );

  if (pendingItems.length > 0) {
    throw new Error(`${pendingItems.length} articles non traités`);
  }

  this.status = 'COMPLETED';
  this.dates.completed = new Date();

  // Calculer la durée
  if (this.dates.started) {
    this.duration.actual = Math.round(
      (this.dates.completed - this.dates.started) / (1000 * 60)
    );
  }

  return this.save();
};

pickingListSchema.methods.reportIssue = async function(itemIndex, issue) {
  const item = this.items[itemIndex];
  if (!item) {
    throw new Error('Article non trouvé');
  }

  item.issue = issue;
  item.status = 'SHORTAGE';

  return this.save();
};

module.exports = mongoose.model('PickingList', pickingListSchema);
