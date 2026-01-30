// ============================================
// MARKET PRO - DONNÉES DES DEVIS
// Gestion complète du cycle de vie des devis
// ============================================

// Statuts des devis
export const quoteStatuses = {
  draft: { label: 'Brouillon', color: '#6b7280' },
  sent: { label: 'Envoyé', color: '#3b82f6' },
  accepted: { label: 'Accepté', color: '#10b981' },
  rejected: { label: 'Refusé', color: '#ef4444' },
  expired: { label: 'Expiré', color: '#f59e0b' },
  converted: { label: 'Converti', color: '#8b5cf6' }
};

// Données de devis mock
export const quotes = [
  {
    id: 'DEV-2025-0001',
    clientId: 'CLI001',
    date: '2025-01-28',
    validUntil: '2025-02-28',
    status: 'sent',
    items: [
      { productId: 'PRD001', quantity: 20, unitPrice: 32.90, discount: 5 },
      { productId: 'PRD002', quantity: 15, unitPrice: 26.50, discount: 0 },
      { productId: 'PRD003', quantity: 10, unitPrice: 24.90, discount: 10 }
    ],
    subtotal: 1230.80,
    discountAmount: 0,
    tax: 246.16,
    total: 1476.96,
    discount: 0,
    discountType: 'percent',
    notes: 'Offre spéciale nouveau trimestre',
    createdBy: 'Pierre Bernard',
    sentAt: '2025-01-28T14:30:00',
    version: 1
  },
  {
    id: 'DEV-2025-0002',
    clientId: 'CLI002',
    date: '2025-01-25',
    validUntil: '2025-02-10',
    status: 'accepted',
    items: [
      { productId: 'PRD002', quantity: 25, unitPrice: 26.50, discount: 0 },
      { productId: 'PRD006', quantity: 30, unitPrice: 4.80, discount: 0 }
    ],
    subtotal: 806.50,
    discountAmount: 40.33,
    tax: 153.23,
    total: 919.40,
    discount: 5,
    discountType: 'percent',
    notes: 'Client régulier - remise fidélité',
    createdBy: 'Pierre Bernard',
    sentAt: '2025-01-25T10:00:00',
    acceptedAt: '2025-01-27T09:15:00',
    version: 1
  },
  {
    id: 'DEV-2025-0003',
    clientId: 'CLI003',
    date: '2025-01-20',
    validUntil: '2025-02-20',
    status: 'converted',
    items: [
      { productId: 'PRD001', quantity: 50, unitPrice: 32.90, discount: 8 },
      { productId: 'PRD004', quantity: 100, unitPrice: 3.90, discount: 5 },
      { productId: 'PRD005', quantity: 20, unitPrice: 42.00, discount: 0 }
    ],
    subtotal: 2723.20,
    discountAmount: 136.16,
    tax: 517.41,
    total: 3104.45,
    discount: 5,
    discountType: 'percent',
    notes: 'Commande mensuelle volume',
    createdBy: 'Pierre Bernard',
    sentAt: '2025-01-20T11:00:00',
    acceptedAt: '2025-01-22T08:30:00',
    convertedAt: '2025-01-22T14:00:00',
    orderId: 'CMD-2025-006',
    version: 1
  },
  {
    id: 'DEV-2025-0004',
    clientId: 'CLI005',
    date: '2025-01-27',
    validUntil: '2025-02-27',
    status: 'draft',
    items: [
      { productId: 'PRD002', quantity: 30, unitPrice: 26.50, discount: 0 },
      { productId: 'PRD007', quantity: 20, unitPrice: 12.50, discount: 0 }
    ],
    subtotal: 1045.00,
    discountAmount: 0,
    tax: 209.00,
    total: 1254.00,
    discount: 0,
    discountType: 'percent',
    notes: 'Événement spécial hôtel',
    createdBy: 'Sophie Petit',
    version: 1
  },
  {
    id: 'DEV-2025-0005',
    clientId: 'CLI004',
    date: '2025-01-15',
    validUntil: '2025-01-25',
    status: 'expired',
    items: [
      { productId: 'PRD006', quantity: 50, unitPrice: 4.80, discount: 0 }
    ],
    subtotal: 240.00,
    discountAmount: 0,
    tax: 48.00,
    total: 288.00,
    discount: 0,
    discountType: 'percent',
    notes: '',
    createdBy: 'Pierre Bernard',
    sentAt: '2025-01-15T16:00:00',
    version: 1
  },
  {
    id: 'DEV-2025-0006',
    clientId: 'CLI008',
    date: '2025-01-26',
    validUntil: '2025-02-26',
    status: 'rejected',
    items: [
      { productId: 'PRD001', quantity: 30, unitPrice: 32.90, discount: 0 },
      { productId: 'PRD002', quantity: 20, unitPrice: 26.50, discount: 0 }
    ],
    subtotal: 1517.00,
    discountAmount: 0,
    tax: 303.40,
    total: 1820.40,
    discount: 0,
    discountType: 'percent',
    notes: 'Proposition initiale',
    createdBy: 'Pierre Bernard',
    sentAt: '2025-01-26T09:00:00',
    rejectedAt: '2025-01-28T11:30:00',
    rejectionReason: 'Prix trop élevé',
    version: 1
  },
  {
    id: 'DEV-2025-0007',
    clientId: 'CLI006',
    date: '2025-01-29',
    validUntil: '2025-03-01',
    status: 'sent',
    items: [
      { productId: 'PRD003', quantity: 15, unitPrice: 24.90, discount: 0 },
      { productId: 'PRD005', quantity: 5, unitPrice: 42.00, discount: 5 }
    ],
    subtotal: 573.00,
    discountAmount: 28.65,
    tax: 108.87,
    total: 653.22,
    discount: 5,
    discountType: 'percent',
    notes: 'Nouvelle gamme épicerie fine',
    createdBy: 'Sophie Petit',
    sentAt: '2025-01-29T10:30:00',
    version: 1
  },
  {
    id: 'DEV-2025-0008',
    clientId: 'CLI007',
    date: '2025-01-29',
    validUntil: '2025-02-15',
    status: 'draft',
    items: [
      { productId: 'PRD004', quantity: 200, unitPrice: 3.90, discount: 10 },
      { productId: 'PRD006', quantity: 100, unitPrice: 4.80, discount: 5 }
    ],
    subtotal: 1158.00,
    discountAmount: 57.90,
    tax: 220.02,
    total: 1320.12,
    discount: 5,
    discountType: 'percent',
    notes: 'Approvisionnement cantine février',
    createdBy: 'Pierre Bernard',
    version: 2
  }
];

// Conditions de paiement par défaut pour les devis
export const defaultPaymentTerms = [
  { id: 'immediate', label: 'Paiement immédiat', days: 0 },
  { id: '7days', label: '7 jours', days: 7 },
  { id: '15days', label: '15 jours', days: 15 },
  { id: '30days', label: '30 jours fin de mois', days: 30 },
  { id: '45days', label: '45 jours fin de mois', days: 45 },
  { id: '60days', label: '60 jours fin de mois', days: 60 }
];

// Textes légaux par défaut pour les devis
export const defaultLegalTexts = {
  validity: 'Ce devis est valable pour la durée indiquée à compter de sa date d\'émission.',
  payment: 'Paiement selon les conditions convenues. Tout retard de paiement entraînera des pénalités de retard.',
  delivery: 'Délai de livraison indicatif, sous réserve de disponibilité des stocks.',
  terms: 'Conditions générales de vente disponibles sur demande.'
};

// Fonction pour générer un numéro de devis
export const generateQuoteNumber = (existingQuotes = []) => {
  const year = new Date().getFullYear();
  const existingThisYear = existingQuotes.filter(q => q.id.includes(year.toString()));
  const nextNumber = existingThisYear.length + 1;
  return `DEV-${year}-${nextNumber.toString().padStart(4, '0')}`;
};

// Fonction pour convertir un devis en commande
export const convertQuoteToOrder = (quote) => {
  const year = new Date().getFullYear();
  const orderNumber = `CMD-${year}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  return {
    id: orderNumber,
    clientId: quote.clientId,
    quoteId: quote.id,
    date: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deliverySlot: '08:00-12:00',
    status: 'pending',
    items: quote.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice * (1 - (item.discount || 0) / 100),
      total: item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)
    })),
    subtotal: quote.subtotal - (quote.discountAmount || 0),
    tax: quote.tax,
    total: quote.total,
    notes: `Créé depuis le devis ${quote.id}`,
    createdBy: 'Système'
  };
};

// Fonction pour créer une facture depuis un devis accepté
export const createInvoiceFromQuote = (quote) => {
  const year = new Date().getFullYear();
  const invoiceNumber = `FAC-${year}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // 30 jours par défaut

  return {
    id: invoiceNumber,
    quoteId: quote.id,
    clientId: quote.clientId,
    date: new Date().toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    status: 'pending',
    items: quote.items,
    subtotal: quote.subtotal - (quote.discountAmount || 0),
    tax: quote.tax,
    total: quote.total,
    paidAmount: 0,
    remainingAmount: quote.total
  };
};

// Calcul des statistiques des devis
export const calculateQuoteStats = (quotesData) => {
  const now = new Date();
  const thisMonth = quotesData.filter(q => {
    const quoteDate = new Date(q.date);
    return quoteDate.getMonth() === now.getMonth() && quoteDate.getFullYear() === now.getFullYear();
  });

  const lastMonth = quotesData.filter(q => {
    const quoteDate = new Date(q.date);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    return quoteDate.getMonth() === lastMonthDate.getMonth() &&
           quoteDate.getFullYear() === lastMonthDate.getFullYear();
  });

  const sent = quotesData.filter(q => ['sent', 'accepted', 'rejected', 'expired', 'converted'].includes(q.status));
  const accepted = quotesData.filter(q => ['accepted', 'converted'].includes(q.status));
  const converted = quotesData.filter(q => q.status === 'converted');

  return {
    total: quotesData.length,
    thisMonth: thisMonth.length,
    lastMonth: lastMonth.length,
    monthGrowth: lastMonth.length > 0
      ? Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 100)
      : 0,
    pending: quotesData.filter(q => q.status === 'sent').length,
    pendingValue: quotesData.filter(q => q.status === 'sent').reduce((s, q) => s + q.total, 0),
    draft: quotesData.filter(q => q.status === 'draft').length,
    accepted: accepted.length,
    acceptedValue: accepted.reduce((s, q) => s + q.total, 0),
    rejected: quotesData.filter(q => q.status === 'rejected').length,
    expired: quotesData.filter(q => q.status === 'expired').length,
    converted: converted.length,
    convertedValue: converted.reduce((s, q) => s + q.total, 0),
    conversionRate: sent.length > 0
      ? Math.round((accepted.length / sent.length) * 100)
      : 0,
    avgValue: quotesData.length > 0
      ? Math.round(quotesData.reduce((s, q) => s + q.total, 0) / quotesData.length)
      : 0,
    avgConversionTime: 2.5 // jours (à calculer dynamiquement)
  };
};

// Vérifier si un devis est expiré
export const isQuoteExpired = (quote) => {
  if (quote.status !== 'sent') return false;
  return new Date(quote.validUntil) < new Date();
};

// Obtenir les devis à relancer
export const getQuotesToFollowUp = (quotesData, daysBeforeExpiry = 7) => {
  const now = new Date();
  const warningDate = new Date(now.getTime() + daysBeforeExpiry * 24 * 60 * 60 * 1000);

  return quotesData.filter(q => {
    if (q.status !== 'sent') return false;
    const validUntil = new Date(q.validUntil);
    return validUntil > now && validUntil <= warningDate;
  });
};

export default quotes;
