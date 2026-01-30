// ============================================
// MARKET PRO - Service de Picking Optimisé
// ============================================

import api from './api';

/**
 * Configuration des zones et leur ordre de parcours
 */
const ZONE_ORDER = {
  'F': 1,  // Frais en premier (température)
  'S': 2,  // Sec
  'C': 3,  // Congélateur en dernier (chaîne du froid)
  'Q': 4,  // Quai
  'P': 5   // Préparation
};

/**
 * Calcule la distance entre deux emplacements
 * @param {Object} loc1 - Premier emplacement {zone, aisle, rack, level}
 * @param {Object} loc2 - Deuxième emplacement {zone, aisle, rack, level}
 * @returns {number} Distance estimée en mètres
 */
export const calculateDistance = (loc1, loc2) => {
  if (!loc1 || !loc2) return Infinity;

  // Constantes de distance (en mètres)
  const ZONE_CHANGE_DISTANCE = 50;
  const AISLE_DISTANCE = 8;
  const RACK_DISTANCE = 1.5;
  const LEVEL_DISTANCE = 0.5;

  let distance = 0;

  // Changement de zone
  if (loc1.zone !== loc2.zone) {
    distance += ZONE_CHANGE_DISTANCE;
  }

  // Distance entre allées
  const aisle1 = loc1.aisle?.charCodeAt(0) || 65;
  const aisle2 = loc2.aisle?.charCodeAt(0) || 65;
  distance += Math.abs(aisle1 - aisle2) * AISLE_DISTANCE;

  // Distance entre rayons
  const rack1 = parseInt(loc1.rack) || 0;
  const rack2 = parseInt(loc2.rack) || 0;
  distance += Math.abs(rack1 - rack2) * RACK_DISTANCE;

  // Distance entre niveaux (moins important)
  const level1 = parseInt(loc1.level) || 0;
  const level2 = parseInt(loc2.level) || 0;
  distance += Math.abs(level1 - level2) * LEVEL_DISTANCE;

  return distance;
};

/**
 * Parse un code d'emplacement en composants
 * @param {string} code - Code d'emplacement (ex: "F-A-02-15")
 * @returns {Object} Composants de l'emplacement
 */
export const parseLocationCode = (code) => {
  if (!code) return null;

  const pattern = /^([FSCQP])-([A-Z])-(\d{2})-(\d{2})$/;
  const match = code.match(pattern);

  if (!match) return null;

  return {
    zone: match[1],
    aisle: match[2],
    rack: match[3],
    level: match[4]
  };
};

/**
 * Optimise le parcours de picking avec l'algorithme du serpentin
 * @param {Array} items - Liste des articles à prélever
 * @returns {Array} Articles triés selon le parcours optimal
 */
export const optimizePickingRoute = (items) => {
  if (!items || items.length === 0) return [];

  // Parser les codes d'emplacement
  const itemsWithLocation = items.map(item => ({
    ...item,
    parsedLocation: parseLocationCode(item.locationCode)
  }));

  // Grouper par zone
  const itemsByZone = {};
  itemsWithLocation.forEach(item => {
    const zone = item.parsedLocation?.zone || 'S';
    if (!itemsByZone[zone]) {
      itemsByZone[zone] = [];
    }
    itemsByZone[zone].push(item);
  });

  // Trier les zones
  const sortedZones = Object.keys(itemsByZone).sort((a, b) =>
    (ZONE_ORDER[a] || 99) - (ZONE_ORDER[b] || 99)
  );

  const optimizedItems = [];
  let direction = 1; // 1 = aller, -1 = retour (serpentin)

  for (const zone of sortedZones) {
    const zoneItems = itemsByZone[zone];

    // Trier par allée
    const itemsByAisle = {};
    zoneItems.forEach(item => {
      const aisle = item.parsedLocation?.aisle || 'A';
      if (!itemsByAisle[aisle]) {
        itemsByAisle[aisle] = [];
      }
      itemsByAisle[aisle].push(item);
    });

    // Parcourir les allées dans l'ordre ou l'inverse (serpentin)
    const aisles = Object.keys(itemsByAisle).sort();
    if (direction === -1) {
      aisles.reverse();
    }

    for (const aisle of aisles) {
      const aisleItems = itemsByAisle[aisle];

      // Trier par rayon puis niveau
      aisleItems.sort((a, b) => {
        const locA = a.parsedLocation || {};
        const locB = b.parsedLocation || {};

        // Rayon
        const rackDiff = (parseInt(locA.rack) || 0) - (parseInt(locB.rack) || 0);
        if (rackDiff !== 0) return rackDiff * direction;

        // Niveau (toujours du bas vers le haut)
        return (parseInt(locA.level) || 0) - (parseInt(locB.level) || 0);
      });

      optimizedItems.push(...aisleItems);

      // Inverser la direction pour la prochaine allée
      direction *= -1;
    }
  }

  // Mettre à jour les séquences
  return optimizedItems.map((item, index) => ({
    ...item,
    sequence: index + 1,
    parsedLocation: undefined // Nettoyer
  }));
};

/**
 * Calcule les statistiques du parcours
 * @param {Array} items - Liste des articles avec emplacements
 * @returns {Object} Statistiques du parcours
 */
export const calculateRouteStats = (items) => {
  if (!items || items.length === 0) {
    return { totalDistance: 0, estimatedTime: 0, zones: [] };
  }

  let totalDistance = 0;
  let previousLocation = null;
  const zones = new Set();

  const optimizedItems = optimizePickingRoute(items);

  for (const item of optimizedItems) {
    const currentLocation = parseLocationCode(item.locationCode);
    zones.add(currentLocation?.zone || 'S');

    if (previousLocation) {
      totalDistance += calculateDistance(previousLocation, currentLocation);
    }

    previousLocation = currentLocation;
  }

  // Temps estimé: 30 secondes par article + temps de déplacement (3 km/h = 0.83 m/s)
  const pickingTimePerItem = 30; // secondes
  const walkingSpeed = 0.83; // m/s
  const estimatedTime = Math.round(
    (items.length * pickingTimePerItem + totalDistance / walkingSpeed) / 60
  );

  return {
    totalDistance: Math.round(totalDistance),
    estimatedTime,
    zones: [...zones],
    itemCount: items.length
  };
};

/**
 * Groupe les commandes par créneau de livraison pour le wave picking
 * @param {Array} orders - Liste des commandes
 * @returns {Object} Commandes groupées par créneau
 */
export const groupOrdersByDeliverySlot = (orders) => {
  const waves = {};

  for (const order of orders) {
    const slot = order.deliverySlot;
    if (!slot) continue;

    const slotKey = `${slot.date}_${slot.startTime}-${slot.endTime}`;

    if (!waves[slotKey]) {
      waves[slotKey] = {
        deliverySlot: slot,
        orders: [],
        totalItems: 0
      };
    }

    waves[slotKey].orders.push(order);
    waves[slotKey].totalItems += order.items?.length || 0;
  }

  // Trier par créneau horaire
  return Object.values(waves).sort((a, b) => {
    const dateA = new Date(`${a.deliverySlot.date}T${a.deliverySlot.startTime}`);
    const dateB = new Date(`${b.deliverySlot.date}T${b.deliverySlot.startTime}`);
    return dateA - dateB;
  });
};

/**
 * Fusionne plusieurs commandes en une liste de picking batch
 * @param {Array} orders - Liste des commandes
 * @returns {Array} Articles fusionnés avec référence aux commandes
 */
export const mergeOrdersForBatchPicking = (orders) => {
  const productMap = new Map();

  for (const order of orders) {
    for (const item of order.items || []) {
      const key = item.product?._id || item.productId;

      if (!productMap.has(key)) {
        productMap.set(key, {
          product: item.product,
          productId: key,
          sku: item.sku || item.product?.sku,
          productName: item.name || item.product?.name,
          barcode: item.barcode || item.product?.barcode,
          locationCode: item.locationCode || item.product?.fullLocation,
          totalQty: 0,
          forOrders: []
        });
      }

      const entry = productMap.get(key);
      entry.totalQty += item.quantity;
      entry.forOrders.push({
        orderId: order._id,
        orderNumber: order.orderNumber,
        clientName: order.client?.name,
        quantity: item.quantity
      });
    }
  }

  return Array.from(productMap.values());
};

/**
 * Service API pour le picking
 */
export const pickingAPI = {
  /**
   * Récupère les listes de picking en attente
   */
  getPending: async () => {
    const response = await api.get('/picking/pending');
    return response.data;
  },

  /**
   * Récupère mes listes assignées
   */
  getMyLists: async () => {
    const response = await api.get('/picking/my-lists');
    return response.data;
  },

  /**
   * Récupère une liste de picking
   */
  getById: async (id) => {
    const response = await api.get(`/picking/${id}`);
    return response.data;
  },

  /**
   * Crée une liste de picking à partir de commandes
   */
  create: async (orderIds, priority = 'NORMAL') => {
    const response = await api.post('/picking', { orderIds, priority });
    return response.data;
  },

  /**
   * Crée une vague de picking
   */
  createWave: async (deliverySlot, priority = 'NORMAL') => {
    const response = await api.post('/picking/wave', { deliverySlot, priority });
    return response.data;
  },

  /**
   * S'auto-assigner une liste
   */
  selfAssign: async (pickingId) => {
    const response = await api.post(`/picking/${pickingId}/self-assign`);
    return response.data;
  },

  /**
   * Démarrer le picking
   */
  start: async (pickingId) => {
    const response = await api.post(`/picking/${pickingId}/start`);
    return response.data;
  },

  /**
   * Prélever un article
   */
  pickItem: async (pickingId, itemIndex, pickedQty, scannedBarcode = null) => {
    const response = await api.post(`/picking/${pickingId}/items/${itemIndex}/pick`, {
      pickedQty,
      scannedBarcode
    });
    return response.data;
  },

  /**
   * Passer un article
   */
  skipItem: async (pickingId, itemIndex, reason) => {
    const response = await api.post(`/picking/${pickingId}/items/${itemIndex}/skip`, {
      reason
    });
    return response.data;
  },

  /**
   * Signaler un problème
   */
  reportIssue: async (pickingId, itemIndex, issue) => {
    const response = await api.post(`/picking/${pickingId}/items/${itemIndex}/issue`, issue);
    return response.data;
  },

  /**
   * Terminer le picking
   */
  complete: async (pickingId) => {
    const response = await api.post(`/picking/${pickingId}/complete`);
    return response.data;
  },

  /**
   * Mettre en pause
   */
  pause: async (pickingId) => {
    const response = await api.post(`/picking/${pickingId}/pause`);
    return response.data;
  },

  /**
   * Reprendre
   */
  resume: async (pickingId) => {
    const response = await api.post(`/picking/${pickingId}/resume`);
    return response.data;
  },

  /**
   * Statistiques
   */
  getStats: async () => {
    const response = await api.get('/picking/stats');
    return response.data;
  }
};

// Export par défaut
const pickingService = {
  calculateDistance,
  parseLocationCode,
  optimizePickingRoute,
  calculateRouteStats,
  groupOrdersByDeliverySlot,
  mergeOrdersForBatchPicking,
  api: pickingAPI
};

export default pickingService;
