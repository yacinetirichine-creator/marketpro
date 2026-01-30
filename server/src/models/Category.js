// ============================================
// MARKET PRO API - Modèle Catégorie Produit
// ============================================

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  // Code unique de catégorie
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 10
  },

  // Nom de la catégorie
  name: {
    type: String,
    required: true,
    trim: true
  },

  // Nom traduit
  nameTranslations: {
    fr: String,
    en: String,
    ar: String
  },

  // Description
  description: {
    type: String,
    trim: true
  },

  // Catégorie parente (pour hiérarchie)
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  parentCode: String,

  // Niveau dans la hiérarchie
  level: {
    type: Number,
    default: 0 // 0 = racine
  },

  // Chemin complet (pour recherche rapide)
  path: {
    type: String,
    default: ''
  },

  // Icône
  icon: {
    type: String,
    default: 'Package'
  },

  // Couleur d'affichage
  color: {
    type: String,
    default: '#00D4AA'
  },

  // Image
  image: String,

  // Zone de stockage recommandée
  recommendedZone: {
    type: String,
    enum: ['F', 'S', 'C', 'Q', 'P'],
    default: 'S'
  },

  // Conditions de stockage
  storageConditions: {
    temperature: {
      min: Number,
      max: Number,
      unit: { type: String, default: '°C' }
    },
    humidity: {
      min: Number,
      max: Number
    },
    lightSensitive: { type: Boolean, default: false }
  },

  // TVA par défaut
  defaultTaxRate: {
    type: Number,
    default: 20,
    min: 0,
    max: 100
  },

  // DLC moyenne (jours)
  averageShelfLife: {
    type: Number,
    default: 30
  },

  // Sous-catégories prédéfinies
  subCategories: [{
    code: { type: String, uppercase: true },
    name: String,
    icon: String
  }],

  // Attributs spécifiques à cette catégorie
  attributes: [{
    name: String,
    type: {
      type: String,
      enum: ['STRING', 'NUMBER', 'BOOLEAN', 'SELECT', 'DATE']
    },
    required: { type: Boolean, default: false },
    options: [String] // Pour type SELECT
  }],

  // Ordre d'affichage
  displayOrder: {
    type: Number,
    default: 0
  },

  // Statistiques
  stats: {
    productCount: { type: Number, default: 0 },
    totalStockValue: { type: Number, default: 0 },
    avgMargin: { type: Number, default: 0 }
  },

  // Statut
  isActive: {
    type: Boolean,
    default: true
  },

  // Visible pour les clients
  isVisibleToClients: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
categorySchema.index({ code: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ path: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ displayOrder: 1 });

// Virtuals
categorySchema.virtual('fullName').get(function() {
  if (!this.path) return this.name;
  return this.path.split('/').filter(Boolean).join(' > ');
});

categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Pré-save: mettre à jour le chemin
categorySchema.pre('save', async function(next) {
  if (this.parent && this.isModified('parent')) {
    const parentCat = await this.constructor.findById(this.parent);
    if (parentCat) {
      this.parentCode = parentCat.code;
      this.level = parentCat.level + 1;
      this.path = parentCat.path ? `${parentCat.path}/${this.name}` : this.name;
    }
  } else if (!this.parent) {
    this.level = 0;
    this.path = this.name;
  }
  next();
});

// Méthodes statiques
categorySchema.statics.getRootCategories = function() {
  return this.find({ level: 0, isActive: true }).sort({ displayOrder: 1 });
};

categorySchema.statics.getTree = async function() {
  const categories = await this.find({ isActive: true }).sort({ level: 1, displayOrder: 1 });

  const tree = [];
  const map = new Map();

  categories.forEach(cat => {
    map.set(cat._id.toString(), { ...cat.toObject(), children: [] });
  });

  categories.forEach(cat => {
    const item = map.get(cat._id.toString());
    if (cat.parent) {
      const parent = map.get(cat.parent.toString());
      if (parent) {
        parent.children.push(item);
      }
    } else {
      tree.push(item);
    }
  });

  return tree;
};

categorySchema.statics.getByCode = function(code) {
  return this.findOne({ code: code.toUpperCase(), isActive: true });
};

// Initialiser les catégories agroalimentaires
categorySchema.statics.initializeCategories = async function() {
  const categories = [
    // Fruits et Légumes
    {
      code: 'FRU',
      name: 'Fruits',
      nameTranslations: { fr: 'Fruits', en: 'Fruits', ar: 'فواكه' },
      icon: 'Apple',
      color: '#FF6B6B',
      recommendedZone: 'F',
      storageConditions: { temperature: { min: 2, max: 8 } },
      defaultTaxRate: 5.5,
      averageShelfLife: 7,
      displayOrder: 1,
      subCategories: [
        { code: 'AGR', name: 'Agrumes', icon: 'Citrus' },
        { code: 'POM', name: 'Pommes & Poires', icon: 'Apple' },
        { code: 'BAN', name: 'Bananes', icon: 'Banana' },
        { code: 'BAI', name: 'Baies & Fruits rouges', icon: 'Cherry' },
        { code: 'TRO', name: 'Fruits tropicaux', icon: 'Palmtree' },
        { code: 'MEL', name: 'Melons & Pastèques', icon: 'Melon' },
        { code: 'RAI', name: 'Raisins', icon: 'Grape' },
        { code: 'SEC', name: 'Fruits secs', icon: 'Nut' }
      ]
    },
    {
      code: 'LEG',
      name: 'Légumes',
      nameTranslations: { fr: 'Légumes', en: 'Vegetables', ar: 'خضروات' },
      icon: 'Carrot',
      color: '#4ECDC4',
      recommendedZone: 'F',
      storageConditions: { temperature: { min: 2, max: 8 } },
      defaultTaxRate: 5.5,
      averageShelfLife: 7,
      displayOrder: 2,
      subCategories: [
        { code: 'FEU', name: 'Légumes feuilles', icon: 'Leaf' },
        { code: 'RAC', name: 'Légumes racines', icon: 'Carrot' },
        { code: 'TOM', name: 'Tomates', icon: 'Tomato' },
        { code: 'COU', name: 'Courges & Courgettes', icon: 'Squash' },
        { code: 'OIG', name: 'Oignons & Ail', icon: 'Onion' },
        { code: 'POI', name: 'Poivrons & Piments', icon: 'Pepper' },
        { code: 'CHA', name: 'Champignons', icon: 'Mushroom' },
        { code: 'HER', name: 'Herbes aromatiques', icon: 'Herb' }
      ]
    },

    // Viandes
    {
      code: 'VIA',
      name: 'Viandes',
      nameTranslations: { fr: 'Viandes', en: 'Meat', ar: 'لحوم' },
      icon: 'Beef',
      color: '#E74C3C',
      recommendedZone: 'F',
      storageConditions: { temperature: { min: 0, max: 4 } },
      defaultTaxRate: 5.5,
      averageShelfLife: 5,
      displayOrder: 3,
      subCategories: [
        { code: 'BOE', name: 'Boeuf', icon: 'Beef' },
        { code: 'VEA', name: 'Veau', icon: 'Beef' },
        { code: 'AGN', name: 'Agneau & Mouton', icon: 'Lamb' },
        { code: 'POR', name: 'Porc', icon: 'Pig' },
        { code: 'VOL', name: 'Volailles', icon: 'Bird' },
        { code: 'GIB', name: 'Gibier', icon: 'Rabbit' },
        { code: 'ABA', name: 'Abats', icon: 'Organ' },
        { code: 'CHA', name: 'Charcuterie', icon: 'Sausage' }
      ]
    },

    // Poissons & Fruits de mer
    {
      code: 'POI',
      name: 'Poissons & Fruits de mer',
      nameTranslations: { fr: 'Poissons & Fruits de mer', en: 'Fish & Seafood', ar: 'أسماك ومأكولات بحرية' },
      icon: 'Fish',
      color: '#3498DB',
      recommendedZone: 'F',
      storageConditions: { temperature: { min: 0, max: 2 } },
      defaultTaxRate: 5.5,
      averageShelfLife: 3,
      displayOrder: 4,
      subCategories: [
        { code: 'BLA', name: 'Poissons blancs', icon: 'Fish' },
        { code: 'GRA', name: 'Poissons gras', icon: 'Fish' },
        { code: 'CRU', name: 'Crustacés', icon: 'Shrimp' },
        { code: 'COQ', name: 'Coquillages', icon: 'Shell' },
        { code: 'FUM', name: 'Poissons fumés', icon: 'Fish' },
        { code: 'CAV', name: 'Caviar & Oeufs', icon: 'Caviar' }
      ]
    },

    // Produits laitiers
    {
      code: 'LAI',
      name: 'Produits laitiers',
      nameTranslations: { fr: 'Produits laitiers', en: 'Dairy', ar: 'منتجات الألبان' },
      icon: 'Milk',
      color: '#F5F5DC',
      recommendedZone: 'F',
      storageConditions: { temperature: { min: 2, max: 6 } },
      defaultTaxRate: 5.5,
      averageShelfLife: 14,
      displayOrder: 5,
      subCategories: [
        { code: 'LAT', name: 'Lait', icon: 'Milk' },
        { code: 'FRO', name: 'Fromages', icon: 'Cheese' },
        { code: 'YAO', name: 'Yaourts', icon: 'Yogurt' },
        { code: 'BEU', name: 'Beurre & Crème', icon: 'Butter' },
        { code: 'OEU', name: 'Oeufs', icon: 'Egg' },
        { code: 'DES', name: 'Desserts lactés', icon: 'Dessert' }
      ]
    },

    // Boissons
    {
      code: 'BOI',
      name: 'Boissons',
      nameTranslations: { fr: 'Boissons', en: 'Beverages', ar: 'مشروبات' },
      icon: 'GlassWater',
      color: '#00CED1',
      recommendedZone: 'S',
      storageConditions: { temperature: { min: 10, max: 20 } },
      defaultTaxRate: 20,
      averageShelfLife: 180,
      displayOrder: 6,
      subCategories: [
        { code: 'EAU', name: 'Eaux', icon: 'Droplet' },
        { code: 'JUS', name: 'Jus de fruits', icon: 'GlassWater' },
        { code: 'SOD', name: 'Sodas', icon: 'Soda' },
        { code: 'CAF', name: 'Café & Thé', icon: 'Coffee' },
        { code: 'VIN', name: 'Vins', icon: 'Wine' },
        { code: 'BIE', name: 'Bières', icon: 'Beer' },
        { code: 'SPI', name: 'Spiritueux', icon: 'Martini' }
      ]
    },

    // Épicerie sèche
    {
      code: 'EPI',
      name: 'Épicerie sèche',
      nameTranslations: { fr: 'Épicerie sèche', en: 'Dry Goods', ar: 'بقالة جافة' },
      icon: 'Wheat',
      color: '#DEB887',
      recommendedZone: 'S',
      storageConditions: { temperature: { min: 15, max: 25 }, humidity: { min: 40, max: 60 } },
      defaultTaxRate: 5.5,
      averageShelfLife: 365,
      displayOrder: 7,
      subCategories: [
        { code: 'PAT', name: 'Pâtes', icon: 'Pasta' },
        { code: 'RIZ', name: 'Riz & Céréales', icon: 'Wheat' },
        { code: 'FAR', name: 'Farines', icon: 'Flour' },
        { code: 'LEG', name: 'Légumes secs', icon: 'Bean' },
        { code: 'HUI', name: 'Huiles & Vinaigres', icon: 'Oil' },
        { code: 'SUC', name: 'Sucres & Miel', icon: 'Sugar' },
        { code: 'CON', name: 'Conserves', icon: 'Can' },
        { code: 'SAU', name: 'Sauces & Condiments', icon: 'Sauce' },
        { code: 'EPC', name: 'Épices', icon: 'Spice' }
      ]
    },

    // Surgelés
    {
      code: 'SUR',
      name: 'Surgelés',
      nameTranslations: { fr: 'Surgelés', en: 'Frozen', ar: 'مجمدات' },
      icon: 'Snowflake',
      color: '#87CEEB',
      recommendedZone: 'C',
      storageConditions: { temperature: { min: -25, max: -18 } },
      defaultTaxRate: 5.5,
      averageShelfLife: 365,
      displayOrder: 8,
      subCategories: [
        { code: 'VIA', name: 'Viandes surgelées', icon: 'Beef' },
        { code: 'POI', name: 'Poissons surgelés', icon: 'Fish' },
        { code: 'LEG', name: 'Légumes surgelés', icon: 'Carrot' },
        { code: 'PLA', name: 'Plats préparés', icon: 'Meal' },
        { code: 'GLA', name: 'Glaces & Sorbets', icon: 'IceCream' },
        { code: 'PAT', name: 'Pâtisseries surgelées', icon: 'Croissant' },
        { code: 'PAI', name: 'Pains surgelés', icon: 'Bread' }
      ]
    },

    // Produits frais préparés
    {
      code: 'FRA',
      name: 'Produits frais préparés',
      nameTranslations: { fr: 'Produits frais préparés', en: 'Fresh Prepared', ar: 'منتجات طازجة محضرة' },
      icon: 'Salad',
      color: '#90EE90',
      recommendedZone: 'F',
      storageConditions: { temperature: { min: 2, max: 6 } },
      defaultTaxRate: 5.5,
      averageShelfLife: 5,
      displayOrder: 9,
      subCategories: [
        { code: 'SAL', name: 'Salades', icon: 'Salad' },
        { code: 'SAN', name: 'Sandwiches', icon: 'Sandwich' },
        { code: 'PLA', name: 'Plats traiteur', icon: 'Meal' },
        { code: 'SOU', name: 'Soupes', icon: 'Soup' },
        { code: 'TRA', name: 'Traiteur', icon: 'Chef' }
      ]
    },

    // Boulangerie / Pâtisserie
    {
      code: 'BOU',
      name: 'Boulangerie & Pâtisserie',
      nameTranslations: { fr: 'Boulangerie & Pâtisserie', en: 'Bakery & Pastry', ar: 'مخبوزات وحلويات' },
      icon: 'Croissant',
      color: '#D2691E',
      recommendedZone: 'S',
      storageConditions: { temperature: { min: 15, max: 22 } },
      defaultTaxRate: 5.5,
      averageShelfLife: 3,
      displayOrder: 10,
      subCategories: [
        { code: 'PAI', name: 'Pains', icon: 'Bread' },
        { code: 'VIE', name: 'Viennoiseries', icon: 'Croissant' },
        { code: 'GAT', name: 'Gâteaux', icon: 'Cake' },
        { code: 'BIS', name: 'Biscuits', icon: 'Cookie' }
      ]
    },

    // Hygiène et entretien
    {
      code: 'HYG',
      name: 'Hygiène & Entretien',
      nameTranslations: { fr: 'Hygiène & Entretien', en: 'Hygiene & Cleaning', ar: 'نظافة وصيانة' },
      icon: 'Sparkles',
      color: '#9370DB',
      recommendedZone: 'S',
      storageConditions: { temperature: { min: 10, max: 25 } },
      defaultTaxRate: 20,
      averageShelfLife: 730,
      displayOrder: 11,
      subCategories: [
        { code: 'NET', name: 'Nettoyants', icon: 'Spray' },
        { code: 'LES', name: 'Lessives', icon: 'Washing' },
        { code: 'VAI', name: 'Vaisselle', icon: 'Dishes' },
        { code: 'PAP', name: 'Papeterie', icon: 'Paper' }
      ]
    },

    // Emballages
    {
      code: 'EMB',
      name: 'Emballages',
      nameTranslations: { fr: 'Emballages', en: 'Packaging', ar: 'تغليف' },
      icon: 'Package',
      color: '#A0522D',
      recommendedZone: 'S',
      storageConditions: { temperature: { min: 10, max: 30 } },
      defaultTaxRate: 20,
      averageShelfLife: 1825,
      displayOrder: 12,
      subCategories: [
        { code: 'SAC', name: 'Sacs & Sachets', icon: 'Bag' },
        { code: 'BAR', name: 'Barquettes', icon: 'Tray' },
        { code: 'FIL', name: 'Films', icon: 'Film' },
        { code: 'CAR', name: 'Cartons', icon: 'Box' }
      ]
    },

    // Divers
    {
      code: 'DIV',
      name: 'Divers',
      nameTranslations: { fr: 'Divers', en: 'Miscellaneous', ar: 'متنوع' },
      icon: 'MoreHorizontal',
      color: '#808080',
      recommendedZone: 'S',
      defaultTaxRate: 20,
      averageShelfLife: 365,
      displayOrder: 99,
      subCategories: []
    }
  ];

  // Supprimer les catégories existantes
  await this.deleteMany({});

  // Créer les nouvelles catégories
  return this.insertMany(categories);
};

module.exports = mongoose.model('Category', categorySchema);
