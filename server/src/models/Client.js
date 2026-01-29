// ============================================
// MARKET PRO API - Modèle Client
// ============================================

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['BILLING', 'SHIPPING', 'BOTH'],
    default: 'BOTH'
  },
  street: { type: String, required: true },
  complement: String,
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'France' },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: String,
  email: String,
  phone: String,
  mobile: String,
  isPrimary: { type: Boolean, default: false }
}, { _id: true });

const clientSchema = new mongoose.Schema({
  // Identification
  code: {
    type: String,
    required: [true, 'Code client requis'],
    unique: true,
    uppercase: true,
    trim: true
  },
  
  // Type de client
  type: {
    type: String,
    enum: ['PARTICULIER', 'PROFESSIONNEL', 'GROSSISTE', 'DISTRIBUTEUR'],
    default: 'PROFESSIONNEL'
  },
  
  // Informations entreprise
  company: {
    name: { type: String, required: true },
    legalForm: String, // SARL, SAS, etc.
    siret: {
      type: String,
      match: [/^\d{14}$/, 'SIRET invalide (14 chiffres)']
    },
    vatNumber: String,
    rcs: String,
    capital: Number
  },
  
  // Contact principal
  contact: {
    firstName: String,
    lastName: String,
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    phone: String,
    mobile: String
  },
  
  // Contacts additionnels
  contacts: [contactSchema],
  
  // Adresses
  addresses: [addressSchema],
  
  // Conditions commerciales
  commercial: {
    category: {
      type: String,
      enum: ['STANDARD', 'SILVER', 'GOLD', 'PLATINUM'],
      default: 'STANDARD'
    },
    paymentTerms: {
      type: Number,
      default: 30, // Jours
      min: 0,
      max: 90
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CHECK', 'TRANSFER', 'CARD', 'PRELEVEMENT'],
      default: 'TRANSFER'
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 50
    },
    priceList: {
      type: String,
      default: 'STANDARD'
    }
  },
  
  // Commercial assigné
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Statistiques
  stats: {
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    outstandingBalance: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    lastOrderDate: Date,
    firstOrderDate: Date
  },
  
  // Documents
  documents: [{
    name: String,
    type: { type: String, enum: ['KBIS', 'RIB', 'CONTRAT', 'AUTRE'] },
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Notes
  notes: [{
    content: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Statut
  status: {
    type: String,
    enum: ['PROSPECT', 'ACTIVE', 'INACTIVE', 'BLOCKED', 'ARCHIVED'],
    default: 'PROSPECT'
  },
  blockedReason: String,
  
  // Compte utilisateur lié
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Origine
  source: {
    type: String,
    enum: ['WEBSITE', 'PHONE', 'COMMERCIAL', 'REFERRAL', 'SALON', 'OTHER'],
    default: 'OTHER'
  },
  
  // Tags
  tags: [String]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// INDEX
// ============================================
clientSchema.index({ code: 1 });
clientSchema.index({ 'company.name': 'text', 'contact.email': 'text' });
clientSchema.index({ 'company.siret': 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ assignedTo: 1 });
clientSchema.index({ 'commercial.category': 1 });

// ============================================
// VIRTUALS
// ============================================

// Nom complet du contact
clientSchema.virtual('contactFullName').get(function() {
  return `${this.contact?.firstName || ''} ${this.contact?.lastName || ''}`.trim();
});

// Adresse de facturation par défaut
clientSchema.virtual('defaultBillingAddress').get(function() {
  return this.addresses?.find(a => 
    (a.type === 'BILLING' || a.type === 'BOTH') && a.isDefault
  ) || this.addresses?.[0];
});

// Adresse de livraison par défaut
clientSchema.virtual('defaultShippingAddress').get(function() {
  return this.addresses?.find(a => 
    (a.type === 'SHIPPING' || a.type === 'BOTH') && a.isDefault
  ) || this.addresses?.[0];
});

// Crédit disponible
clientSchema.virtual('availableCredit').get(function() {
  const limit = this.commercial?.creditLimit || 0;
  const outstanding = this.stats?.outstandingBalance || 0;
  return Math.max(0, limit - outstanding);
});

// ============================================
// MÉTHODES D'INSTANCE
// ============================================

// Mettre à jour les statistiques après commande
clientSchema.methods.updateStatsAfterOrder = async function(orderAmount) {
  this.stats.totalOrders += 1;
  this.stats.totalRevenue += orderAmount;
  this.stats.outstandingBalance += orderAmount;
  this.stats.lastOrderDate = new Date();
  
  if (!this.stats.firstOrderDate) {
    this.stats.firstOrderDate = new Date();
  }
  
  this.stats.averageOrderValue = this.stats.totalRevenue / this.stats.totalOrders;
  
  // Passer en actif si prospect
  if (this.status === 'PROSPECT') {
    this.status = 'ACTIVE';
  }
  
  return this.save();
};

// Enregistrer un paiement
clientSchema.methods.recordPayment = async function(amount) {
  this.stats.totalPaid += amount;
  this.stats.outstandingBalance = Math.max(0, this.stats.outstandingBalance - amount);
  return this.save();
};

// Vérifier le crédit
clientSchema.methods.canOrder = function(amount) {
  if (this.status === 'BLOCKED') return { allowed: false, reason: 'Compte bloqué' };
  
  const limit = this.commercial?.creditLimit || 0;
  if (limit === 0) return { allowed: true }; // Pas de limite
  
  const outstanding = this.stats?.outstandingBalance || 0;
  const available = limit - outstanding;
  
  if (amount > available) {
    return { 
      allowed: false, 
      reason: `Crédit insuffisant (disponible: ${available.toFixed(2)}€)` 
    };
  }
  
  return { allowed: true };
};

// ============================================
// MÉTHODES STATIQUES
// ============================================

// Générer un code client
clientSchema.statics.generateCode = async function() {
  const lastClient = await this.findOne().sort({ createdAt: -1 });
  const lastNumber = lastClient 
    ? parseInt(lastClient.code.replace('CLI', ''), 10) 
    : 0;
  return `CLI${String(lastNumber + 1).padStart(6, '0')}`;
};

// Clients avec solde impayé
clientSchema.statics.findWithOutstanding = function() {
  return this.find({ 
    'stats.outstandingBalance': { $gt: 0 },
    status: { $ne: 'ARCHIVED' }
  }).sort({ 'stats.outstandingBalance': -1 });
};

// Top clients par CA
clientSchema.statics.findTopByRevenue = function(limit = 10) {
  return this.find({ status: 'ACTIVE' })
    .sort({ 'stats.totalRevenue': -1 })
    .limit(limit);
};

module.exports = mongoose.model('Client', clientSchema);
