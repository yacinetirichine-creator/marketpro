// ============================================
// MARKET PRO API - Seeds (Données initiales)
// ============================================

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import des modèles
const User = require('../models/User');
const Product = require('../models/Product');
const Client = require('../models/Client');
const Supplier = require('../models/Supplier');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marketpro');
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// ============================================
// UTILISATEURS
// ============================================
const users = [
  {
    email: 'admin@marketpro.fr',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'System',
    role: 'ADMIN',
    phone: '0612345678',
    isActive: true,
    isVerified: true
  },
  {
    email: 'manager@marketpro.fr',
    password: 'Manager123!',
    firstName: 'Marie',
    lastName: 'Dupont',
    role: 'MANAGER',
    phone: '0623456789',
    isActive: true,
    isVerified: true
  },
  {
    email: 'commercial@marketpro.fr',
    password: 'Commercial123!',
    firstName: 'Pierre',
    lastName: 'Martin',
    role: 'COMMERCIAL',
    phone: '0634567890',
    isActive: true,
    isVerified: true
  },
  {
    email: 'caissier@marketpro.fr',
    password: 'Caissier123!',
    firstName: 'Sophie',
    lastName: 'Bernard',
    role: 'CAISSIER',
    phone: '0645678901',
    isActive: true,
    isVerified: true
  },
  {
    email: 'magasinier@marketpro.fr',
    password: 'Magasinier123!',
    firstName: 'Lucas',
    lastName: 'Petit',
    role: 'MAGASINIER',
    phone: '0656789012',
    isActive: true,
    isVerified: true
  },
  {
    email: 'comptable@marketpro.fr',
    password: 'Comptable123!',
    firstName: 'Julie',
    lastName: 'Moreau',
    role: 'COMPTABLE',
    phone: '0667890123',
    isActive: true,
    isVerified: true
  },
  {
    email: 'client@marketpro.fr',
    password: 'Client123!',
    firstName: 'Jean',
    lastName: 'Client',
    role: 'CLIENT',
    phone: '0678901234',
    isActive: true,
    isVerified: true
  }
];

// ============================================
// PRODUITS
// ============================================
const products = [
  // Fruits & Légumes
  {
    sku: 'FL001',
    barcode: '3760123456789',
    name: 'Pommes Golden 1kg',
    category: 'FRUITS_LEGUMES',
    subCategory: 'Pommes',
    pricing: { purchasePrice: 1.50, sellingPrice: 2.49, taxRate: 5.5 },
    stock: { quantity: 500, minQuantity: 50, unit: 'KG' },
    location: { warehouse: 'PRINCIPAL', zone: 'A', aisle: '01', shelf: '01' }
  },
  {
    sku: 'FL002',
    barcode: '3760123456790',
    name: 'Bananes 1kg',
    category: 'FRUITS_LEGUMES',
    subCategory: 'Bananes',
    pricing: { purchasePrice: 1.20, sellingPrice: 1.99, taxRate: 5.5 },
    stock: { quantity: 300, minQuantity: 30, unit: 'KG' },
    location: { warehouse: 'PRINCIPAL', zone: 'A', aisle: '01', shelf: '02' }
  },
  {
    sku: 'FL003',
    barcode: '3760123456791',
    name: 'Tomates grappe 500g',
    category: 'FRUITS_LEGUMES',
    subCategory: 'Tomates',
    pricing: { purchasePrice: 1.80, sellingPrice: 2.99, taxRate: 5.5 },
    stock: { quantity: 200, minQuantity: 40, unit: 'KG' },
    location: { warehouse: 'PRINCIPAL', zone: 'A', aisle: '02', shelf: '01' }
  },
  {
    sku: 'FL004',
    barcode: '3760123456792',
    name: 'Carottes 1kg',
    category: 'FRUITS_LEGUMES',
    pricing: { purchasePrice: 0.80, sellingPrice: 1.49, taxRate: 5.5 },
    stock: { quantity: 400, minQuantity: 50, unit: 'KG' },
    location: { warehouse: 'PRINCIPAL', zone: 'A', aisle: '02', shelf: '02' }
  },
  
  // Viandes
  {
    sku: 'VI001',
    barcode: '3760123456800',
    name: 'Poulet entier Label Rouge',
    category: 'VIANDES',
    subCategory: 'Volaille',
    pricing: { purchasePrice: 6.50, sellingPrice: 9.99, taxRate: 5.5 },
    stock: { quantity: 100, minQuantity: 20, unit: 'PIECE' },
    location: { warehouse: 'PRINCIPAL', zone: 'B', aisle: '01', shelf: '01' }
  },
  {
    sku: 'VI002',
    barcode: '3760123456801',
    name: 'Steak haché 15% MG x4',
    category: 'VIANDES',
    subCategory: 'Boeuf',
    pricing: { purchasePrice: 4.00, sellingPrice: 6.49, taxRate: 5.5 },
    stock: { quantity: 150, minQuantity: 30, unit: 'PIECE' },
    location: { warehouse: 'PRINCIPAL', zone: 'B', aisle: '01', shelf: '02' }
  },
  
  // Produits laitiers
  {
    sku: 'PL001',
    barcode: '3760123456810',
    name: 'Lait demi-écrémé 1L',
    category: 'PRODUITS_LAITIERS',
    subCategory: 'Lait',
    pricing: { purchasePrice: 0.70, sellingPrice: 1.09, taxRate: 5.5 },
    stock: { quantity: 600, minQuantity: 100, unit: 'PIECE' },
    location: { warehouse: 'PRINCIPAL', zone: 'C', aisle: '01', shelf: '01' }
  },
  {
    sku: 'PL002',
    barcode: '3760123456811',
    name: 'Beurre doux 250g',
    category: 'PRODUITS_LAITIERS',
    subCategory: 'Beurre',
    pricing: { purchasePrice: 1.50, sellingPrice: 2.49, taxRate: 5.5 },
    stock: { quantity: 200, minQuantity: 40, unit: 'PIECE' },
    location: { warehouse: 'PRINCIPAL', zone: 'C', aisle: '01', shelf: '02' }
  },
  {
    sku: 'PL003',
    barcode: '3760123456812',
    name: 'Fromage Emmental râpé 200g',
    category: 'PRODUITS_LAITIERS',
    subCategory: 'Fromage',
    pricing: { purchasePrice: 1.80, sellingPrice: 2.99, taxRate: 5.5 },
    stock: { quantity: 180, minQuantity: 30, unit: 'PIECE' },
    location: { warehouse: 'PRINCIPAL', zone: 'C', aisle: '02', shelf: '01' }
  },
  
  // Épicerie
  {
    sku: 'EP001',
    barcode: '3760123456820',
    name: 'Pâtes Penne 500g',
    category: 'EPICERIE',
    subCategory: 'Pâtes',
    pricing: { purchasePrice: 0.60, sellingPrice: 1.29, taxRate: 5.5 },
    stock: { quantity: 400, minQuantity: 50, unit: 'PIECE' },
    location: { warehouse: 'PRINCIPAL', zone: 'D', aisle: '01', shelf: '01' }
  },
  {
    sku: 'EP002',
    barcode: '3760123456821',
    name: 'Riz Basmati 1kg',
    category: 'EPICERIE',
    subCategory: 'Riz',
    pricing: { purchasePrice: 1.50, sellingPrice: 2.99, taxRate: 5.5 },
    stock: { quantity: 300, minQuantity: 40, unit: 'PIECE' },
    location: { warehouse: 'PRINCIPAL', zone: 'D', aisle: '01', shelf: '02' }
  },
  {
    sku: 'EP003',
    barcode: '3760123456822',
    name: 'Huile d\'olive vierge extra 1L',
    category: 'EPICERIE',
    subCategory: 'Huiles',
    pricing: { purchasePrice: 4.50, sellingPrice: 7.99, taxRate: 5.5 },
    stock: { quantity: 150, minQuantity: 25, unit: 'PIECE' },
    location: { warehouse: 'PRINCIPAL', zone: 'D', aisle: '02', shelf: '01' }
  },
  
  // Boissons
  {
    sku: 'BO001',
    barcode: '3760123456830',
    name: 'Eau minérale 1.5L x6',
    category: 'BOISSONS',
    subCategory: 'Eau',
    pricing: { purchasePrice: 1.50, sellingPrice: 2.49, taxRate: 5.5 },
    stock: { quantity: 200, minQuantity: 50, unit: 'CARTON' },
    location: { warehouse: 'PRINCIPAL', zone: 'E', aisle: '01', shelf: '01' }
  },
  {
    sku: 'BO002',
    barcode: '3760123456831',
    name: 'Jus d\'orange 1L',
    category: 'BOISSONS',
    subCategory: 'Jus',
    pricing: { purchasePrice: 1.20, sellingPrice: 2.19, taxRate: 5.5 },
    stock: { quantity: 250, minQuantity: 40, unit: 'PIECE' },
    location: { warehouse: 'PRINCIPAL', zone: 'E', aisle: '01', shelf: '02' }
  },
  
  // Conserves
  {
    sku: 'CO001',
    barcode: '3760123456840',
    name: 'Thon en conserve 200g',
    category: 'CONSERVES',
    pricing: { purchasePrice: 1.80, sellingPrice: 2.99, taxRate: 5.5 },
    stock: { quantity: 300, minQuantity: 50, unit: 'PIECE' },
    location: { warehouse: 'PRINCIPAL', zone: 'F', aisle: '01', shelf: '01' }
  },
  {
    sku: 'CO002',
    barcode: '3760123456841',
    name: 'Haricots verts 400g',
    category: 'CONSERVES',
    pricing: { purchasePrice: 0.80, sellingPrice: 1.49, taxRate: 5.5 },
    stock: { quantity: 280, minQuantity: 40, unit: 'PIECE' },
    location: { warehouse: 'PRINCIPAL', zone: 'F', aisle: '01', shelf: '02' }
  }
];

// ============================================
// FOURNISSEURS
// ============================================
const suppliers = [
  {
    code: 'FRN00001',
    company: {
      name: 'FruitExpress France',
      siret: '12345678901234',
      website: 'www.fruitexpress.fr'
    },
    contact: { name: 'Marc Legrand', email: 'contact@fruitexpress.fr', phone: '0145678901' },
    address: { street: '123 Rue du Commerce', city: 'Rungis', postalCode: '94150', country: 'France' },
    categories: ['FRUITS_LEGUMES'],
    conditions: { paymentTerms: 30, deliveryTime: 2 },
    status: 'ACTIVE'
  },
  {
    code: 'FRN00002',
    company: {
      name: 'Viandes Premium SAS',
      siret: '23456789012345',
      website: 'www.viandespremium.fr'
    },
    contact: { name: 'Sophie Martin', email: 'commandes@viandespremium.fr', phone: '0156789012' },
    address: { street: '45 Avenue de la Boucherie', city: 'Lyon', postalCode: '69000', country: 'France' },
    categories: ['VIANDES'],
    conditions: { paymentTerms: 45, deliveryTime: 3 },
    status: 'ACTIVE'
  },
  {
    code: 'FRN00003',
    company: {
      name: 'Lactalis Distribution',
      siret: '34567890123456'
    },
    contact: { name: 'Pierre Blanc', email: 'pro@lactalis.fr', phone: '0167890123' },
    address: { street: '78 Rue du Lait', city: 'Laval', postalCode: '53000', country: 'France' },
    categories: ['PRODUITS_LAITIERS'],
    conditions: { paymentTerms: 30, deliveryTime: 2 },
    status: 'ACTIVE'
  },
  {
    code: 'FRN00004',
    company: {
      name: 'Épicerie Fine Import',
      siret: '45678901234567'
    },
    contact: { name: 'Claire Dubois', email: 'contact@epicerie-import.fr', phone: '0178901234' },
    address: { street: '12 Rue des Saveurs', city: 'Bordeaux', postalCode: '33000', country: 'France' },
    categories: ['EPICERIE', 'CONSERVES', 'CONDIMENTS'],
    conditions: { paymentTerms: 60, deliveryTime: 5 },
    status: 'ACTIVE'
  }
];

// ============================================
// CLIENTS
// ============================================
const clients = [
  {
    code: 'CLI000001',
    type: 'PROFESSIONNEL',
    company: {
      name: 'Restaurant Le Gourmet',
      legalForm: 'SARL',
      siret: '11111111111111'
    },
    contact: { firstName: 'Jean', lastName: 'Durand', email: 'contact@legourmet.fr', phone: '0123456789' },
    addresses: [{
      type: 'BOTH',
      street: '25 Rue de la Gastronomie',
      city: 'Paris',
      postalCode: '75001',
      isDefault: true
    }],
    commercial: { category: 'GOLD', paymentTerms: 30, discount: 10, creditLimit: 10000 },
    status: 'ACTIVE'
  },
  {
    code: 'CLI000002',
    type: 'PROFESSIONNEL',
    company: {
      name: 'Hôtel Bellevue',
      legalForm: 'SAS',
      siret: '22222222222222'
    },
    contact: { firstName: 'Marie', lastName: 'Lambert', email: 'achats@hotelbellevue.fr', phone: '0234567890' },
    addresses: [{
      type: 'BOTH',
      street: '100 Avenue de la Mer',
      city: 'Nice',
      postalCode: '06000',
      isDefault: true
    }],
    commercial: { category: 'PLATINUM', paymentTerms: 45, discount: 15, creditLimit: 50000 },
    status: 'ACTIVE'
  },
  {
    code: 'CLI000003',
    type: 'PROFESSIONNEL',
    company: {
      name: 'Cantine Scolaire Jules Ferry',
      siret: '33333333333333'
    },
    contact: { firstName: 'Paul', lastName: 'Robert', email: 'cantine@julesferry.edu', phone: '0345678901' },
    addresses: [{
      type: 'BOTH',
      street: '5 Rue de l\'École',
      city: 'Marseille',
      postalCode: '13001',
      isDefault: true
    }],
    commercial: { category: 'SILVER', paymentTerms: 60, discount: 5, creditLimit: 5000 },
    status: 'ACTIVE'
  },
  {
    code: 'CLI000004',
    type: 'GROSSISTE',
    company: {
      name: 'Super Marché Plus',
      legalForm: 'SA',
      siret: '44444444444444'
    },
    contact: { firstName: 'Isabelle', lastName: 'Michel', email: 'achats@superplus.fr', phone: '0456789012' },
    addresses: [{
      type: 'BOTH',
      street: '200 Zone Industrielle Nord',
      city: 'Lille',
      postalCode: '59000',
      isDefault: true
    }],
    commercial: { category: 'PLATINUM', paymentTerms: 30, discount: 20, creditLimit: 100000 },
    status: 'ACTIVE'
  },
  {
    code: 'CLI000005',
    type: 'PROFESSIONNEL',
    company: {
      name: 'Traiteur Événements',
      legalForm: 'EURL',
      siret: '55555555555555'
    },
    contact: { firstName: 'Thomas', lastName: 'Garcia', email: 'commande@traiteur-event.fr', phone: '0567890123' },
    addresses: [{
      type: 'BOTH',
      street: '15 Rue des Fêtes',
      city: 'Toulouse',
      postalCode: '31000',
      isDefault: true
    }],
    commercial: { category: 'GOLD', paymentTerms: 30, discount: 10, creditLimit: 15000 },
    status: 'ACTIVE'
  }
];

// ============================================
// SEED FUNCTION
// ============================================
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Cleaning database...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Client.deleteMany({});
    await Supplier.deleteMany({});
    
    console.log('👤 Seeding users...');
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }
    console.log(`   ✓ ${users.length} users created`);
    
    console.log('📦 Seeding products...');
    await Product.insertMany(products);
    console.log(`   ✓ ${products.length} products created`);
    
    console.log('🏭 Seeding suppliers...');
    await Supplier.insertMany(suppliers);
    console.log(`   ✓ ${suppliers.length} suppliers created`);
    
    console.log('👥 Seeding clients...');
    await Client.insertMany(clients);
    console.log(`   ✓ ${clients.length} clients created`);
    
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📧 Demo accounts:');
    console.log('   Admin: admin@marketpro.fr / Admin123!');
    console.log('   Manager: manager@marketpro.fr / Manager123!');
    console.log('   Commercial: commercial@marketpro.fr / Commercial123!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run
seedDatabase();
