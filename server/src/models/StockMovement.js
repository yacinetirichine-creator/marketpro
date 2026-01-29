// ============================================
// MARKET PRO API - Modèle Mouvement de Stock
// ============================================

const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  // Référence
  reference: {
    type: String,
    required: true,
    unique: true
  },
  
  // Produit
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productSku: String,
  productName: String,
  
  // Type de mouvement
  type: {
    type: String,
    enum: [
      'IN_PURCHASE',      // Réception achat
      'IN_RETURN',        // Retour client
      'IN_TRANSFER',      // Transfert entrant
      'IN_ADJUSTMENT',    // Ajustement positif
      'IN_PRODUCTION',    // Entrée production
      'OUT_SALE',         // Vente
      'OUT_RETURN',       // Retour fournisseur
      'OUT_TRANSFER',     // Transfert sortant
      'OUT_ADJUSTMENT',   // Ajustement négatif
      'OUT_WASTE',        // Perte/Casse
      'OUT_EXPIRED',      // Produit expiré
      'INVENTORY'         // Inventaire
    ],
    required: true
  },
  
  // Quantités
  quantity: {
    type: Number,
    required: true
  },
  previousStock: Number,
  newStock: Number,
  
  // Emplacement
  location: {
    warehouse: String,
    zone: String,
    aisle: String,
    shelf: String,
    position: String
  },
  
  // Documents liés
  sourceDocument: {
    type: { type: String, enum: ['ORDER', 'PURCHASE', 'INVOICE', 'TRANSFER', 'INVENTORY'] },
    id: mongoose.Schema.Types.ObjectId,
    reference: String
  },
  
  // Lot / Traçabilité
  lot: {
    number: String,
    expirationDate: Date,
    productionDate: Date,
    origin: String
  },
  
  // Valeur
  unitCost: Number,
  totalValue: Number,
  
  // Motif
  reason: String,
  notes: String,
  
  // Utilisateur
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Validation
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  validatedAt: Date,
  isValidated: { type: Boolean, default: false }
  
}, {
  timestamps: true
});

// Index
stockMovementSchema.index({ reference: 1 });
stockMovementSchema.index({ product: 1 });
stockMovementSchema.index({ type: 1 });
stockMovementSchema.index({ createdAt: -1 });
stockMovementSchema.index({ 'lot.number': 1 });

// Statiques
stockMovementSchema.statics.generateReference = async function() {
  const date = new Date();
  const prefix = `MVT${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  
  const count = await this.countDocuments({
    reference: new RegExp(`^${prefix}`)
  });
  
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
};

stockMovementSchema.statics.getMovementsByProduct = function(productId, startDate, endDate) {
  const match = { product: productId };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;
  }
  return this.find(match).sort({ createdAt: -1 });
};

module.exports = mongoose.model('StockMovement', stockMovementSchema);
