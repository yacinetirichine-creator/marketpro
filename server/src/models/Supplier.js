// ============================================
// MARKET PRO API - Modèle Fournisseur
// ============================================

const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  // Identification
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  
  // Informations entreprise
  company: {
    name: { type: String, required: true },
    legalForm: String,
    siret: {
      type: String,
      match: [/^\d{14}$/, 'SIRET invalide']
    },
    vatNumber: String,
    website: String
  },
  
  // Contact
  contact: {
    name: String,
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: String,
    mobile: String
  },
  
  // Adresse
  address: {
    street: String,
    complement: String,
    city: String,
    postalCode: String,
    country: { type: String, default: 'France' }
  },
  
  // Coordonnées bancaires
  banking: {
    iban: String,
    bic: String,
    bankName: String
  },
  
  // Conditions
  conditions: {
    paymentTerms: { type: Number, default: 30 },
    paymentMethod: {
      type: String,
      enum: ['TRANSFER', 'CHECK', 'CARD', 'PRELEVEMENT'],
      default: 'TRANSFER'
    },
    minOrderAmount: { type: Number, default: 0 },
    deliveryTime: { type: Number, default: 3 }, // Jours
    currency: { type: String, default: 'EUR' }
  },
  
  // Catégories de produits
  categories: [{
    type: String,
    enum: [
      'FRUITS_LEGUMES', 'VIANDES', 'POISSONS', 'PRODUITS_LAITIERS',
      'EPICERIE', 'BOISSONS', 'SURGELES', 'CONSERVES', 'CONDIMENTS', 'AUTRES'
    ]
  }],
  
  // Évaluation
  rating: {
    quality: { type: Number, min: 0, max: 5, default: 0 },
    delivery: { type: Number, min: 0, max: 5, default: 0 },
    pricing: { type: Number, min: 0, max: 5, default: 0 },
    communication: { type: Number, min: 0, max: 5, default: 0 },
    overall: { type: Number, min: 0, max: 5, default: 0 }
  },
  
  // Statistiques
  stats: {
    totalOrders: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    outstandingBalance: { type: Number, default: 0 },
    avgDeliveryTime: { type: Number, default: 0 },
    lastOrderDate: Date
  },
  
  // Documents
  documents: [{
    name: String,
    type: { type: String, enum: ['KBIS', 'RIB', 'CONTRAT', 'CATALOGUE', 'CERTIFICAT', 'AUTRE'] },
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Notes
  notes: String,
  
  // Statut
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED'],
    default: 'PENDING'
  },
  
  // Tags
  tags: [String]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
supplierSchema.index({ code: 1 });
supplierSchema.index({ 'company.name': 'text' });
supplierSchema.index({ categories: 1 });
supplierSchema.index({ status: 1 });

// Virtuals
supplierSchema.virtual('fullAddress').get(function() {
  const a = this.address;
  if (!a) return '';
  return `${a.street || ''}, ${a.postalCode || ''} ${a.city || ''}, ${a.country || ''}`.trim();
});

// Générer code
supplierSchema.statics.generateCode = async function() {
  const last = await this.findOne().sort({ createdAt: -1 });
  const lastNumber = last ? parseInt(last.code.replace('FRN', ''), 10) : 0;
  return `FRN${String(lastNumber + 1).padStart(5, '0')}`;
};

module.exports = mongoose.model('Supplier', supplierSchema);
