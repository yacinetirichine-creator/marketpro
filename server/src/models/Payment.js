// ============================================
// MARKET PRO API - Modèle Paiement
// ============================================

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Référence
  reference: {
    type: String,
    required: true,
    unique: true
  },
  
  // Type
  type: {
    type: String,
    enum: ['RECEIPT', 'REFUND', 'ADVANCE'],
    default: 'RECEIPT'
  },
  
  // Client
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  clientName: String,
  
  // Documents liés
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  invoiceNumber: String,
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  orderNumber: String,
  
  // Montant
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  
  // Mode de paiement
  method: {
    type: String,
    enum: ['CASH', 'CHECK', 'TRANSFER', 'CARD', 'PRELEVEMENT', 'OTHER'],
    required: true
  },
  
  // Détails selon le mode
  details: {
    // Chèque
    checkNumber: String,
    checkBank: String,
    checkDate: Date,
    
    // Virement
    transferReference: String,
    
    // Carte
    cardLast4: String,
    cardBrand: String,
    transactionId: String,
    
    // Prélèvement
    mandateRef: String
  },
  
  // Statut
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING'
  },
  
  // Dates
  dates: {
    payment: { type: Date, default: Date.now },
    received: Date,
    deposited: Date,
    cleared: Date
  },
  
  // Rapprochement bancaire
  reconciliation: {
    isReconciled: { type: Boolean, default: false },
    reconciledAt: Date,
    reconciledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bankReference: String
  },
  
  // Notes
  notes: String,
  
  // Enregistré par
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
paymentSchema.index({ reference: 1 });
paymentSchema.index({ client: 1 });
paymentSchema.index({ invoice: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ 'dates.payment': -1 });
paymentSchema.index({ method: 1 });

// Statiques
paymentSchema.statics.generateReference = async function() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const prefix = `PAY${year}${month}`;
  
  const last = await this.findOne({ reference: new RegExp(`^${prefix}`) })
    .sort({ reference: -1 });
  
  const lastNumber = last ? parseInt(last.reference.replace(prefix, ''), 10) : 0;
  return `${prefix}${String(lastNumber + 1).padStart(5, '0')}`;
};

paymentSchema.statics.getTotalByMethod = async function(startDate, endDate) {
  const match = { status: 'COMPLETED' };
  if (startDate) match['dates.payment'] = { $gte: startDate };
  if (endDate) match['dates.payment'] = { ...match['dates.payment'], $lte: endDate };
  
  return this.aggregate([
    { $match: match },
    { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);
};

paymentSchema.statics.getPendingChecks = function() {
  return this.find({ method: 'CHECK', status: 'PENDING' })
    .populate('client', 'company.name')
    .sort({ 'dates.payment': 1 });
};

module.exports = mongoose.model('Payment', paymentSchema);
