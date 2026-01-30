// ============================================
// MARKET PRO API - Export des modèles
// ============================================

const User = require('./User');
const Product = require('./Product');
const Client = require('./Client');
const Supplier = require('./Supplier');
const Order = require('./Order');
const Invoice = require('./Invoice');
const Payment = require('./Payment');
const StockMovement = require('./StockMovement');
const AuditLog = require('./AuditLog');

// Nouveaux modèles logistique
const Location = require('./Location');
const StockLot = require('./StockLot');
const Receipt = require('./Receipt');
const Inventory = require('./Inventory');
const PickingList = require('./PickingList');
const Category = require('./Category');

module.exports = {
  User,
  Product,
  Client,
  Supplier,
  Order,
  Invoice,
  Payment,
  StockMovement,
  AuditLog,
  // Nouveaux modèles
  Location,
  StockLot,
  Receipt,
  Inventory,
  PickingList,
  Category
};
