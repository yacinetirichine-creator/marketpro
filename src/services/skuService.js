// ============================================
// MARKET PRO - Service de Codification SKU
// ============================================

/**
 * Configuration des catégories et codes
 */
export const CATEGORY_CODES = {
  // Fruits
  FRU: {
    name: 'Fruits',
    zone: 'F',
    subCategories: {
      AGR: 'Agrumes',
      POM: 'Pommes & Poires',
      BAN: 'Bananes',
      BAI: 'Baies & Fruits rouges',
      TRO: 'Fruits tropicaux',
      MEL: 'Melons & Pastèques',
      RAI: 'Raisins',
      SEC: 'Fruits secs'
    }
  },
  // Légumes
  LEG: {
    name: 'Légumes',
    zone: 'F',
    subCategories: {
      FEU: 'Légumes feuilles',
      RAC: 'Légumes racines',
      TOM: 'Tomates',
      COU: 'Courges & Courgettes',
      OIG: 'Oignons & Ail',
      POI: 'Poivrons & Piments',
      CHA: 'Champignons',
      HER: 'Herbes aromatiques'
    }
  },
  // Viandes
  VIA: {
    name: 'Viandes',
    zone: 'F',
    subCategories: {
      BOE: 'Boeuf',
      VEA: 'Veau',
      AGN: 'Agneau & Mouton',
      POR: 'Porc',
      VOL: 'Volailles',
      GIB: 'Gibier',
      ABA: 'Abats',
      CHA: 'Charcuterie'
    }
  },
  // Poissons
  POI: {
    name: 'Poissons & Fruits de mer',
    zone: 'F',
    subCategories: {
      BLA: 'Poissons blancs',
      GRA: 'Poissons gras',
      CRU: 'Crustacés',
      COQ: 'Coquillages',
      FUM: 'Poissons fumés',
      CAV: 'Caviar & Oeufs'
    }
  },
  // Produits laitiers
  LAI: {
    name: 'Produits laitiers',
    zone: 'F',
    subCategories: {
      LAT: 'Lait',
      FRO: 'Fromages',
      YAO: 'Yaourts',
      BEU: 'Beurre & Crème',
      OEU: 'Oeufs',
      DES: 'Desserts lactés'
    }
  },
  // Boissons
  BOI: {
    name: 'Boissons',
    zone: 'S',
    subCategories: {
      EAU: 'Eaux',
      JUS: 'Jus de fruits',
      SOD: 'Sodas',
      CAF: 'Café & Thé',
      VIN: 'Vins',
      BIE: 'Bières',
      SPI: 'Spiritueux'
    }
  },
  // Épicerie
  EPI: {
    name: 'Épicerie sèche',
    zone: 'S',
    subCategories: {
      PAT: 'Pâtes',
      RIZ: 'Riz & Céréales',
      FAR: 'Farines',
      LEG: 'Légumes secs',
      HUI: 'Huiles & Vinaigres',
      SUC: 'Sucres & Miel',
      CON: 'Conserves',
      SAU: 'Sauces & Condiments',
      EPC: 'Épices'
    }
  },
  // Surgelés
  SUR: {
    name: 'Surgelés',
    zone: 'C',
    subCategories: {
      VIA: 'Viandes surgelées',
      POI: 'Poissons surgelés',
      LEG: 'Légumes surgelés',
      PLA: 'Plats préparés',
      GLA: 'Glaces & Sorbets',
      PAT: 'Pâtisseries surgelées',
      PAI: 'Pains surgelés'
    }
  },
  // Frais préparé
  FRA: {
    name: 'Produits frais préparés',
    zone: 'F',
    subCategories: {
      SAL: 'Salades',
      SAN: 'Sandwiches',
      PLA: 'Plats traiteur',
      SOU: 'Soupes',
      TRA: 'Traiteur'
    }
  },
  // Boulangerie
  BOU: {
    name: 'Boulangerie & Pâtisserie',
    zone: 'S',
    subCategories: {
      PAI: 'Pains',
      VIE: 'Viennoiseries',
      GAT: 'Gâteaux',
      BIS: 'Biscuits'
    }
  },
  // Hygiène
  HYG: {
    name: 'Hygiène & Entretien',
    zone: 'S',
    subCategories: {
      NET: 'Nettoyants',
      LES: 'Lessives',
      VAI: 'Vaisselle',
      PAP: 'Papeterie'
    }
  },
  // Emballages
  EMB: {
    name: 'Emballages',
    zone: 'S',
    subCategories: {
      SAC: 'Sacs & Sachets',
      BAR: 'Barquettes',
      FIL: 'Films',
      CAR: 'Cartons'
    }
  },
  // Divers
  DIV: {
    name: 'Divers',
    zone: 'S',
    subCategories: {}
  }
};

/**
 * Compteurs internes pour la séquence
 * En production, cela devrait être géré par la base de données
 */
let sequenceCounters = {};

/**
 * Récupère le prochain numéro de séquence pour une catégorie
 * @param {string} categoryCode - Code de la catégorie
 * @param {string} subCategoryCode - Code de la sous-catégorie
 * @returns {number} Prochain numéro de séquence
 */
const getNextSequence = async (categoryCode, subCategoryCode) => {
  const key = `${categoryCode}-${subCategoryCode}`;

  if (!sequenceCounters[key]) {
    // En production, charger depuis l'API/DB
    sequenceCounters[key] = 0;
  }

  sequenceCounters[key]++;
  return sequenceCounters[key];
};

/**
 * Calcule le digit de contrôle (Luhn algorithm)
 * @param {string} code - Code sans le digit de contrôle
 * @returns {number} Digit de contrôle
 */
export const calculateCheckDigit = (code) => {
  // Convertir les lettres en chiffres (A=10, B=11, etc.)
  const digits = code
    .toUpperCase()
    .split('')
    .map(char => {
      const charCode = char.charCodeAt(0);
      if (charCode >= 48 && charCode <= 57) {
        return parseInt(char);
      } else if (charCode >= 65 && charCode <= 90) {
        return charCode - 55; // A=10, B=11, etc.
      }
      return 0;
    });

  // Algorithme de Luhn modifié
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return (10 - (sum % 10)) % 10;
};

/**
 * Valide un digit de contrôle
 * @param {string} sku - SKU complet avec digit de contrôle
 * @returns {boolean} Vrai si valide
 */
export const validateCheckDigit = (sku) => {
  if (!sku || sku.length < 2) return false;

  const codeWithoutCheck = sku.slice(0, -1);
  const providedCheck = parseInt(sku.slice(-1));
  const calculatedCheck = calculateCheckDigit(codeWithoutCheck);

  return providedCheck === calculatedCheck;
};

/**
 * Génère un SKU complet
 * Format: MP-[CATÉGORIE]-[SOUS-CAT]-[SÉQUENCE]-[CONTRÔLE]
 * Exemple: MP-FRU-AGR-00142-7
 *
 * @param {Object} options - Options de génération
 * @param {string} options.categoryCode - Code de catégorie (ex: 'FRU')
 * @param {string} options.subCategoryCode - Code de sous-catégorie (ex: 'AGR')
 * @param {number} [options.sequenceNumber] - Numéro de séquence (auto si non fourni)
 * @returns {Promise<Object>} SKU généré avec métadonnées
 */
export const generateSKU = async (options) => {
  const { categoryCode, subCategoryCode, sequenceNumber } = options;

  // Valider la catégorie
  if (!CATEGORY_CODES[categoryCode]) {
    throw new Error(`Catégorie invalide: ${categoryCode}`);
  }

  // Valider la sous-catégorie si fournie
  if (subCategoryCode && !CATEGORY_CODES[categoryCode].subCategories[subCategoryCode]) {
    throw new Error(`Sous-catégorie invalide: ${subCategoryCode} pour ${categoryCode}`);
  }

  // Obtenir le numéro de séquence
  const sequence = sequenceNumber || await getNextSequence(categoryCode, subCategoryCode || 'GEN');
  const sequenceStr = String(sequence).padStart(5, '0');

  // Construire le code de base
  const baseCode = subCategoryCode
    ? `MP-${categoryCode}-${subCategoryCode}-${sequenceStr}`
    : `MP-${categoryCode}-${sequenceStr}`;

  // Calculer le digit de contrôle
  const checkDigit = calculateCheckDigit(baseCode);

  // SKU final
  const sku = `${baseCode}-${checkDigit}`;

  return {
    sku,
    categoryCode,
    categoryName: CATEGORY_CODES[categoryCode].name,
    subCategoryCode: subCategoryCode || null,
    subCategoryName: subCategoryCode ? CATEGORY_CODES[categoryCode].subCategories[subCategoryCode] : null,
    sequence,
    checkDigit,
    recommendedZone: CATEGORY_CODES[categoryCode].zone
  };
};

/**
 * Parse un SKU existant
 * @param {string} sku - SKU à parser
 * @returns {Object|null} Données du SKU ou null si invalide
 */
export const parseSKU = (sku) => {
  if (!sku) return null;

  // Pattern: MP-XXX-YYY-NNNNN-C ou MP-XXX-NNNNN-C
  const patterns = [
    /^MP-([A-Z]{3})-([A-Z]{3})-(\d{5})-(\d)$/,
    /^MP-([A-Z]{3})-(\d{5})-(\d)$/
  ];

  for (const pattern of patterns) {
    const match = sku.match(pattern);
    if (match) {
      const hasSubCategory = match.length === 5;

      const categoryCode = match[1];
      const subCategoryCode = hasSubCategory ? match[2] : null;
      const sequence = parseInt(hasSubCategory ? match[3] : match[2]);
      const checkDigit = parseInt(hasSubCategory ? match[4] : match[3]);

      // Valider le digit de contrôle
      if (!validateCheckDigit(sku)) {
        return { error: 'Digit de contrôle invalide', sku };
      }

      // Récupérer les métadonnées
      const category = CATEGORY_CODES[categoryCode];

      return {
        sku,
        isValid: true,
        categoryCode,
        categoryName: category?.name || 'Inconnu',
        subCategoryCode,
        subCategoryName: subCategoryCode && category
          ? category.subCategories[subCategoryCode] || 'Inconnu'
          : null,
        sequence,
        checkDigit,
        recommendedZone: category?.zone || 'S'
      };
    }
  }

  return { error: 'Format SKU invalide', sku, isValid: false };
};

/**
 * Génère un code d'emplacement
 * Format: [ZONE]-[ALLÉE]-[RAYON]-[NIVEAU]
 * Exemple: F-A-02-15
 *
 * @param {Object} options - Options de génération
 * @returns {string} Code d'emplacement
 */
export const generateLocationCode = (options) => {
  const { zone, aisle, rack, level } = options;

  // Valider la zone
  const validZones = ['F', 'S', 'C', 'Q', 'P'];
  if (!validZones.includes(zone)) {
    throw new Error(`Zone invalide: ${zone}. Zones valides: ${validZones.join(', ')}`);
  }

  // Valider l'allée (lettre A-Z)
  if (!/^[A-Z]$/.test(aisle)) {
    throw new Error('L\'allée doit être une lettre de A à Z');
  }

  // Formater le rayon et le niveau
  const rackStr = String(rack).padStart(2, '0');
  const levelStr = String(level).padStart(2, '0');

  return `${zone}-${aisle}-${rackStr}-${levelStr}`;
};

/**
 * Parse un code d'emplacement
 * @param {string} code - Code d'emplacement
 * @returns {Object} Données de l'emplacement
 */
export const parseLocationCode = (code) => {
  const pattern = /^([FSCQP])-([A-Z])-(\d{2})-(\d{2})$/;
  const match = code?.match(pattern);

  if (!match) {
    return { error: 'Format de code emplacement invalide', code, isValid: false };
  }

  const zoneNames = {
    'F': 'Frais',
    'S': 'Sec',
    'C': 'Congélateur',
    'Q': 'Quai',
    'P': 'Préparation'
  };

  return {
    code,
    isValid: true,
    zone: match[1],
    zoneName: zoneNames[match[1]],
    aisle: match[2],
    rack: parseInt(match[3]),
    level: parseInt(match[4])
  };
};

/**
 * Génère un numéro de lot
 * Format: LOT-YYYYMMDD-NNNN
 *
 * @param {Date} [date] - Date du lot (défaut: aujourd'hui)
 * @param {number} [sequence] - Numéro de séquence
 * @returns {string} Numéro de lot
 */
export const generateLotNumber = (date = new Date(), sequence = null) => {
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const seqStr = sequence !== null
    ? String(sequence).padStart(4, '0')
    : String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');

  return `LOT-${dateStr}-${seqStr}`;
};

/**
 * Génère un code-barres EAN-13
 * @param {string} countryCode - Code pays (ex: '376' pour France)
 * @param {string} companyCode - Code entreprise
 * @param {string} productCode - Code produit
 * @returns {string} Code EAN-13
 */
export const generateEAN13 = (countryCode = '376', companyCode = '00000', productCode = '0000') => {
  // Construire les 12 premiers chiffres
  const code12 = `${countryCode}${companyCode}${productCode}`.padEnd(12, '0').slice(0, 12);

  // Calculer le digit de contrôle EAN
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(code12[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;

  return code12 + checkDigit;
};

/**
 * Valide un code EAN-13
 * @param {string} ean - Code EAN-13
 * @returns {boolean} Vrai si valide
 */
export const validateEAN13 = (ean) => {
  if (!ean || ean.length !== 13 || !/^\d+$/.test(ean)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(ean[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const calculatedCheck = (10 - (sum % 10)) % 10;

  return parseInt(ean[12]) === calculatedCheck;
};

/**
 * Suggère une zone de stockage basée sur la catégorie
 * @param {string} categoryCode - Code de catégorie
 * @returns {Object} Informations sur la zone recommandée
 */
export const suggestStorageZone = (categoryCode) => {
  const category = CATEGORY_CODES[categoryCode];

  if (!category) {
    return { zone: 'S', zoneName: 'Sec', reason: 'Catégorie inconnue - zone par défaut' };
  }

  const zoneNames = {
    'F': 'Frais (2-8°C)',
    'S': 'Sec (15-25°C)',
    'C': 'Congélateur (-25 à -18°C)',
    'Q': 'Quai (réception)',
    'P': 'Préparation'
  };

  return {
    zone: category.zone,
    zoneName: zoneNames[category.zone],
    categoryName: category.name,
    reason: `Zone recommandée pour ${category.name}`
  };
};

// Export par défaut
const skuService = {
  CATEGORY_CODES,
  generateSKU,
  parseSKU,
  validateCheckDigit,
  calculateCheckDigit,
  generateLocationCode,
  parseLocationCode,
  generateLotNumber,
  generateEAN13,
  validateEAN13,
  suggestStorageZone
};

export default skuService;
