// ============================================
// MARKET PRO API - Modèle Facture
// ============================================

const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  sku: String,
  name: String,
  description: String,
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 },
  taxRate: { type: Number, default: 20 },
  totalHT: Number,
  totalTTC: Number
}, { _id: true });

const invoiceSchema = new mongoose.Schema({
  // Numéro de facture
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Type
  type: {
    type: String,
    enum: ['INVOICE', 'CREDIT_NOTE', 'PROFORMA', 'QUOTE'],
    default: 'INVOICE'
  },
  
  // Client
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  clientInfo: {
    code: String,
    name: String,
    siret: String,
    vatNumber: String,
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String
    }
  },
  
  // Commande liée
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  orderNumber: String,
  
  // Articles
  items: [invoiceItemSchema],
  
  // Totaux
  totals: {
    subtotalHT: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    totalHT: { type: Number, default: 0 },
    taxDetails: [{
      rate: Number,
      base: Number,
      amount: Number
    }],
    totalTax: { type: Number, default: 0 },
    totalTTC: { type: Number, default: 0 }
  },
  
  // Statut
  status: {
    type: String,
    enum: ['DRAFT', 'SENT', 'VIEWED', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED'],
    default: 'DRAFT'
  },
  
  // Dates
  dates: {
    issued: { type: Date, default: Date.now },
    due: { type: Date, required: true },
    sent: Date,
    paid: Date,
    cancelled: Date
  },
  
  // Paiements
  payments: [{
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['CASH', 'CHECK', 'TRANSFER', 'CARD', 'PRELEVEMENT'] },
    reference: String,
    notes: String,
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  paidAmount: { type: Number, default: 0 },
  
  // Conditions
  paymentTerms: { type: Number, default: 30 },
  paymentMethod: String,
  
  // Coordonnées bancaires
  bankDetails: {
    iban: String,
    bic: String,
    bankName: String
  },
  
  // Notes
  notes: String,
  internalNotes: String,
  legalNotice: String,
  
  // PDF
  pdfUrl: String,
  
  // Historique envois
  emailHistory: [{
    sentAt: { type: Date, default: Date.now },
    sentTo: String,
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    opened: Boolean,
    openedAt: Date
  }],
  
  // Relances
  reminders: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['EMAIL', 'SMS', 'LETTER', 'PHONE'] },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String
  }],
  
  // Créateur
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ client: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ 'dates.issued': -1 });
invoiceSchema.index({ 'dates.due': 1 });

// Virtuals
invoiceSchema.virtual('remainingAmount').get(function() {
  return (this.totals?.totalTTC || 0) - (this.paidAmount || 0);
});

invoiceSchema.virtual('isPaid').get(function() {
  return this.status === 'PAID';
});

invoiceSchema.virtual('isOverdue').get(function() {
  return this.status !== 'PAID' && this.dates?.due < new Date();
});

invoiceSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const diff = Date.now() - this.dates.due.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Méthodes
invoiceSchema.methods.calculateTotals = function() {
  let subtotalHT = 0;
  const taxByRate = {};
  
  this.items.forEach(item => {
    const lineHT = item.quantity * item.unitPrice * (1 - item.discount / 100);
    const lineTax = lineHT * (item.taxRate / 100);
    
    item.totalHT = lineHT;
    item.totalTTC = lineHT + lineTax;
    
    subtotalHT += lineHT;
    
    // Grouper TVA par taux
    if (!taxByRate[item.taxRate]) {
      taxByRate[item.taxRate] = { rate: item.taxRate, base: 0, amount: 0 };
    }
    taxByRate[item.taxRate].base += lineHT;
    taxByRate[item.taxRate].amount += lineTax;
  });
  
  this.totals.subtotalHT = subtotalHT;
  this.totals.discountAmount = subtotalHT * (this.totals.discountPercent / 100);
  this.totals.totalHT = subtotalHT - this.totals.discountAmount + this.totals.shippingCost;
  this.totals.taxDetails = Object.values(taxByRate);
  this.totals.totalTax = Object.values(taxByRate).reduce((sum, t) => sum + t.amount, 0);
  this.totals.totalTTC = this.totals.totalHT + this.totals.totalTax;
  
  return this;
};

invoiceSchema.methods.addPayment = async function(amount, method, reference, userId) {
  this.payments.push({
    amount,
    method,
    reference,
    recordedBy: userId
  });
  
  this.paidAmount += amount;
  
  if (this.paidAmount >= this.totals.totalTTC) {
    this.status = 'PAID';
    this.dates.paid = new Date();
  } else if (this.paidAmount > 0) {
    this.status = 'PARTIAL';
  }
  
  return this.save();
};

// Statiques
invoiceSchema.statics.generateInvoiceNumber = async function(type = 'INVOICE') {
  const year = new Date().getFullYear();
  const prefix = type === 'CREDIT_NOTE' ? `AV${year}` : `FAC${year}`;
  
  const last = await this.findOne({ invoiceNumber: new RegExp(`^${prefix}`) })
    .sort({ invoiceNumber: -1 });
  
  const lastNumber = last ? parseInt(last.invoiceNumber.replace(prefix, ''), 10) : 0;
  return `${prefix}${String(lastNumber + 1).padStart(6, '0')}`;
};

invoiceSchema.statics.getOverdue = function() {
  return this.find({
    status: { $nin: ['PAID', 'CANCELLED', 'REFUNDED'] },
    'dates.due': { $lt: new Date() }
  }).populate('client');
};

invoiceSchema.statics.getUnpaidTotal = async function() {
  const result = await this.aggregate([
    { $match: { status: { $nin: ['PAID', 'CANCELLED', 'REFUNDED'] } } },
    { $group: { _id: null, total: { $sum: { $subtract: ['$totals.totalTTC', '$paidAmount'] } } } }
  ]);
  return result[0]?.total || 0;
};

module.exports = mongoose.model('Invoice', invoiceSchema);
