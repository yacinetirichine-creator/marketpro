// ============================================
// MARKET PRO API - Modèle Commande
// ============================================

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sku: String,
  name: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  taxRate: {
    type: Number,
    default: 20
  },
  totalHT: Number,
  totalTTC: Number,
  notes: String
}, { _id: true });

const orderSchema = new mongoose.Schema({
  // Numéro de commande
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // Type de commande
  type: {
    type: String,
    enum: ['STANDARD', 'URGENT', 'RECURRING', 'QUOTE'],
    default: 'STANDARD'
  },
  
  // Client
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  clientCode: String,
  clientName: String,
  
  // Contact
  contact: {
    name: String,
    email: String,
    phone: String
  },
  
  // Adresses
  billingAddress: {
    street: String,
    complement: String,
    city: String,
    postalCode: String,
    country: String
  },
  shippingAddress: {
    street: String,
    complement: String,
    city: String,
    postalCode: String,
    country: String
  },
  
  // Articles
  items: [orderItemSchema],
  
  // Totaux
  totals: {
    subtotalHT: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalHT: { type: Number, default: 0 },
    totalTTC: { type: Number, default: 0 }
  },
  
  // Statut
  status: {
    type: String,
    enum: [
      'DRAFT',           // Brouillon
      'PENDING',         // En attente de validation
      'CONFIRMED',       // Confirmée
      'PROCESSING',      // En préparation
      'READY',           // Prête
      'SHIPPED',         // Expédiée
      'DELIVERED',       // Livrée
      'COMPLETED',       // Terminée
      'CANCELLED',       // Annulée
      'RETURNED'         // Retournée
    ],
    default: 'DRAFT'
  },
  
  // Historique des statuts
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String
  }],
  
  // Dates
  dates: {
    ordered: { type: Date, default: Date.now },
    confirmed: Date,
    processed: Date,
    shipped: Date,
    delivered: Date,
    expectedDelivery: Date,
    cancelled: Date
  },
  
  // Paiement
  payment: {
    status: {
      type: String,
      enum: ['PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'FAILED'],
      default: 'PENDING'
    },
    method: {
      type: String,
      enum: ['CASH', 'CHECK', 'TRANSFER', 'CARD', 'PRELEVEMENT'],
      default: 'TRANSFER'
    },
    paidAmount: { type: Number, default: 0 },
    dueDate: Date
  },
  
  // Facture liée
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  
  // Livraison
  shipping: {
    method: {
      type: String,
      enum: ['PICKUP', 'DELIVERY', 'EXPRESS'],
      default: 'DELIVERY'
    },
    carrier: String,
    trackingNumber: String,
    weight: Number,
    packages: Number
  },
  
  // Responsable
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notes
  notes: String,
  internalNotes: String,
  
  // Tags
  tags: [String],
  
  // Priorité
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL'
  },
  
  // Source
  source: {
    type: String,
    enum: ['WEB', 'PHONE', 'EMAIL', 'COMMERCIAL', 'PORTAL'],
    default: 'WEB'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ client: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'dates.ordered': -1 });
orderSchema.index({ assignedTo: 1 });
orderSchema.index({ 'payment.status': 1 });

// Virtuals
orderSchema.virtual('itemCount').get(function() {
  return this.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
});

orderSchema.virtual('remainingAmount').get(function() {
  return (this.totals?.totalTTC || 0) - (this.payment?.paidAmount || 0);
});

orderSchema.virtual('isPaid').get(function() {
  return this.payment?.status === 'PAID';
});

// Méthodes
orderSchema.methods.calculateTotals = function() {
  let subtotalHT = 0;
  let taxAmount = 0;
  
  this.items.forEach(item => {
    const lineHT = item.quantity * item.unitPrice * (1 - item.discount / 100);
    const lineTax = lineHT * (item.taxRate / 100);
    
    item.totalHT = lineHT;
    item.totalTTC = lineHT + lineTax;
    
    subtotalHT += lineHT;
    taxAmount += lineTax;
  });
  
  this.totals.subtotalHT = subtotalHT;
  this.totals.discountAmount = subtotalHT * (this.totals.discountPercent / 100);
  this.totals.totalHT = subtotalHT - this.totals.discountAmount + this.totals.shippingCost;
  this.totals.taxAmount = taxAmount;
  this.totals.totalTTC = this.totals.totalHT + taxAmount;
  
  return this;
};

orderSchema.methods.updateStatus = async function(newStatus, userId, reason = '') {
  this.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy: userId,
    reason
  });
  
  this.status = newStatus;
  
  // Mettre à jour les dates
  const statusDateMap = {
    'CONFIRMED': 'confirmed',
    'PROCESSING': 'processed',
    'SHIPPED': 'shipped',
    'DELIVERED': 'delivered',
    'CANCELLED': 'cancelled'
  };
  
  if (statusDateMap[newStatus]) {
    this.dates[statusDateMap[newStatus]] = new Date();
  }
  
  return this.save();
};

// Statiques
orderSchema.statics.generateOrderNumber = async function() {
  const year = new Date().getFullYear();
  const prefix = `CMD${year}`;
  
  const lastOrder = await this.findOne({ orderNumber: new RegExp(`^${prefix}`) })
    .sort({ orderNumber: -1 });
  
  const lastNumber = lastOrder 
    ? parseInt(lastOrder.orderNumber.replace(prefix, ''), 10) 
    : 0;
  
  return `${prefix}${String(lastNumber + 1).padStart(6, '0')}`;
};

orderSchema.statics.getStatusStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totals.totalTTC' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
