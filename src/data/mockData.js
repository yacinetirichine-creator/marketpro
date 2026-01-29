// MARKET PRO - BASE DE DONNÉES COMPLÈTE
export const clients = [
  { id: 'CLI001', name: 'Carrefour Express Lyon 3', type: 'supermarket', contact: 'Marie Dubois', email: 'marie.dubois@carrefour.fr', phone: '04 72 33 45 67', address: '45 Rue de la République, 69003 Lyon', creditLimit: 50000, paymentDelay: 30, scoring: 92, status: 'active', createdAt: '2022-03-15', siret: '12345678901234' },
  { id: 'CLI002', name: 'Restaurant Le Gourmet', type: 'restaurant', contact: 'Jean-Pierre Martin', email: 'contact@legourmet.fr', phone: '04 78 42 18 90', address: '12 Place Bellecour, 69002 Lyon', creditLimit: 25000, paymentDelay: 15, scoring: 88, status: 'active', createdAt: '2021-06-20', siret: '98765432109876' },
  { id: 'CLI003', name: 'Intermarché Villeurbanne', type: 'supermarket', contact: 'Sophie Lefebvre', email: 's.lefebvre@intermarche.fr', phone: '04 78 89 23 45', address: '234 Cours Emile Zola, 69100 Villeurbanne', creditLimit: 100000, paymentDelay: 45, scoring: 95, status: 'active', createdAt: '2020-01-10', siret: '45678901234567' },
  { id: 'CLI004', name: 'Boulangerie Paul & Marie', type: 'bakery', contact: 'Paul Moreau', email: 'paul@boulangeriepm.fr', phone: '04 72 77 88 99', address: '8 Rue Victor Hugo, 69002 Lyon', creditLimit: 10000, paymentDelay: 7, scoring: 85, status: 'active', createdAt: '2023-02-14', siret: '78901234567890' },
  { id: 'CLI005', name: 'Hôtel Mercure Part-Dieu', type: 'hotel', contact: 'François Girard', email: 'f.girard@mercure-lyon.com', phone: '04 72 61 90 90', address: '50 Rue de la Villette, 69003 Lyon', creditLimit: 75000, paymentDelay: 30, scoring: 91, status: 'active', createdAt: '2021-09-01', siret: '23456789012345' },
  { id: 'CLI006', name: 'Épicerie Fine Bellecour', type: 'grocery', contact: 'Claire Rousseau', email: 'claire@epiceriefine.fr', phone: '04 78 37 45 12', address: '3 Rue de la Barre, 69002 Lyon', creditLimit: 15000, paymentDelay: 15, scoring: 78, status: 'active', createdAt: '2022-11-30', siret: '56789012345678' },
  { id: 'CLI007', name: 'Cantine Scolaire Herriot', type: 'canteen', contact: 'Marc Bernard', email: 'm.bernard@mairie-lyon.fr', phone: '04 72 10 30 30', address: '6 Place Herriot, 69001 Lyon', creditLimit: 40000, paymentDelay: 60, scoring: 98, status: 'active', createdAt: '2019-09-01', siret: '89012345678901' },
  { id: 'CLI008', name: 'Traiteur Prestige', type: 'caterer', contact: 'Antoine Petit', email: 'contact@traiteur-prestige.fr', phone: '04 78 95 67 34', address: '78 Avenue Jean Jaurès, 69007 Lyon', creditLimit: 35000, paymentDelay: 30, scoring: 72, status: 'warning', createdAt: '2023-04-22', siret: '34567890123456' },
];

export const clientSalesHistory = {
  CLI001: [{ month: '2024-01', revenue: 38500, margin: 7700, orders: 12 },{ month: '2024-02', revenue: 41200, margin: 8240, orders: 14 },{ month: '2024-03', revenue: 39800, margin: 7960, orders: 13 },{ month: '2024-04', revenue: 43500, margin: 8700, orders: 15 },{ month: '2024-05', revenue: 45200, margin: 9040, orders: 16 },{ month: '2024-06', revenue: 42100, margin: 8420, orders: 14 },{ month: '2024-07', revenue: 38900, margin: 7780, orders: 13 },{ month: '2024-08', revenue: 35600, margin: 7120, orders: 11 },{ month: '2024-09', revenue: 44300, margin: 8860, orders: 15 },{ month: '2024-10', revenue: 47800, margin: 9560, orders: 17 },{ month: '2024-11', revenue: 46200, margin: 9240, orders: 16 },{ month: '2024-12', revenue: 52400, margin: 10480, orders: 19 },{ month: '2025-01', revenue: 41500, margin: 8300, orders: 14 }],
  CLI002: [{ month: '2024-01', revenue: 21500, margin: 5375, orders: 22 },{ month: '2024-02', revenue: 23200, margin: 5800, orders: 24 },{ month: '2024-03', revenue: 22800, margin: 5700, orders: 23 },{ month: '2024-04', revenue: 24500, margin: 6125, orders: 25 },{ month: '2024-05', revenue: 26200, margin: 6550, orders: 27 },{ month: '2024-06', revenue: 28100, margin: 7025, orders: 29 },{ month: '2024-07', revenue: 25800, margin: 6450, orders: 26 },{ month: '2024-08', revenue: 19200, margin: 4800, orders: 18 },{ month: '2024-09', revenue: 24600, margin: 6150, orders: 25 },{ month: '2024-10', revenue: 25400, margin: 6350, orders: 26 },{ month: '2024-11', revenue: 23800, margin: 5950, orders: 24 },{ month: '2024-12', revenue: 27200, margin: 6800, orders: 28 },{ month: '2025-01', revenue: 22100, margin: 5525, orders: 22 }],
  CLI003: [{ month: '2024-01', revenue: 98500, margin: 19700, orders: 28 },{ month: '2024-02', revenue: 102300, margin: 20460, orders: 30 },{ month: '2024-03', revenue: 105800, margin: 21160, orders: 31 },{ month: '2024-04', revenue: 108500, margin: 21700, orders: 32 },{ month: '2024-05', revenue: 112400, margin: 22480, orders: 34 },{ month: '2024-06', revenue: 106200, margin: 21240, orders: 31 },{ month: '2024-07', revenue: 98700, margin: 19740, orders: 29 },{ month: '2024-08', revenue: 92400, margin: 18480, orders: 26 },{ month: '2024-09', revenue: 110500, margin: 22100, orders: 33 },{ month: '2024-10', revenue: 118200, margin: 23640, orders: 36 },{ month: '2024-11', revenue: 115800, margin: 23160, orders: 35 },{ month: '2024-12', revenue: 128500, margin: 25700, orders: 40 },{ month: '2025-01', revenue: 105200, margin: 21040, orders: 32 }],
  CLI004: [{ month: '2024-01', revenue: 4200, margin: 1260, orders: 18 },{ month: '2024-02', revenue: 4500, margin: 1350, orders: 20 },{ month: '2024-03', revenue: 4800, margin: 1440, orders: 21 },{ month: '2024-04', revenue: 5100, margin: 1530, orders: 22 },{ month: '2024-05', revenue: 5400, margin: 1620, orders: 24 },{ month: '2024-06', revenue: 5200, margin: 1560, orders: 23 },{ month: '2024-07', revenue: 4900, margin: 1470, orders: 21 },{ month: '2024-08', revenue: 3800, margin: 1140, orders: 16 },{ month: '2024-09', revenue: 5300, margin: 1590, orders: 23 },{ month: '2024-10', revenue: 5600, margin: 1680, orders: 25 },{ month: '2024-11', revenue: 5800, margin: 1740, orders: 26 },{ month: '2024-12', revenue: 6200, margin: 1860, orders: 28 },{ month: '2025-01', revenue: 4900, margin: 1470, orders: 22 }],
  CLI005: [{ month: '2024-01', revenue: 52000, margin: 10400, orders: 15 },{ month: '2024-02', revenue: 48500, margin: 9700, orders: 14 },{ month: '2024-03', revenue: 55200, margin: 11040, orders: 16 },{ month: '2024-04', revenue: 58900, margin: 11780, orders: 17 },{ month: '2024-05', revenue: 62400, margin: 12480, orders: 18 },{ month: '2024-06', revenue: 68500, margin: 13700, orders: 20 },{ month: '2024-07', revenue: 72100, margin: 14420, orders: 22 },{ month: '2024-08', revenue: 75800, margin: 15160, orders: 24 },{ month: '2024-09', revenue: 65200, margin: 13040, orders: 19 },{ month: '2024-10', revenue: 58400, margin: 11680, orders: 17 },{ month: '2024-11', revenue: 54200, margin: 10840, orders: 16 },{ month: '2024-12', revenue: 61800, margin: 12360, orders: 18 },{ month: '2025-01', revenue: 49500, margin: 9900, orders: 14 }],
  CLI006: [{ month: '2024-01', revenue: 8500, margin: 2550, orders: 28 },{ month: '2024-02', revenue: 9200, margin: 2760, orders: 30 },{ month: '2024-03', revenue: 8800, margin: 2640, orders: 29 },{ month: '2024-04', revenue: 9500, margin: 2850, orders: 31 },{ month: '2024-05', revenue: 10200, margin: 3060, orders: 34 },{ month: '2024-06', revenue: 9800, margin: 2940, orders: 32 },{ month: '2024-07', revenue: 8600, margin: 2580, orders: 28 },{ month: '2024-08', revenue: 7200, margin: 2160, orders: 24 },{ month: '2024-09', revenue: 9400, margin: 2820, orders: 31 },{ month: '2024-10', revenue: 10500, margin: 3150, orders: 35 },{ month: '2024-11', revenue: 11200, margin: 3360, orders: 37 },{ month: '2024-12', revenue: 13500, margin: 4050, orders: 45 },{ month: '2025-01', revenue: 9100, margin: 2730, orders: 30 }],
  CLI007: [{ month: '2024-01', revenue: 32500, margin: 6500, orders: 22 },{ month: '2024-02', revenue: 34200, margin: 6840, orders: 23 },{ month: '2024-03', revenue: 33800, margin: 6760, orders: 23 },{ month: '2024-04', revenue: 35100, margin: 7020, orders: 24 },{ month: '2024-05', revenue: 36400, margin: 7280, orders: 25 },{ month: '2024-06', revenue: 28500, margin: 5700, orders: 19 },{ month: '2024-07', revenue: 0, margin: 0, orders: 0 },{ month: '2024-08', revenue: 0, margin: 0, orders: 0 },{ month: '2024-09', revenue: 35800, margin: 7160, orders: 24 },{ month: '2024-10', revenue: 37200, margin: 7440, orders: 25 },{ month: '2024-11', revenue: 36500, margin: 7300, orders: 24 },{ month: '2024-12', revenue: 38900, margin: 7780, orders: 26 },{ month: '2025-01', revenue: 33200, margin: 6640, orders: 22 }],
  CLI008: [{ month: '2024-01', revenue: 18500, margin: 4625, orders: 8 },{ month: '2024-02', revenue: 22400, margin: 5600, orders: 10 },{ month: '2024-03', revenue: 28500, margin: 7125, orders: 12 },{ month: '2024-04', revenue: 35200, margin: 8800, orders: 15 },{ month: '2024-05', revenue: 42800, margin: 10700, orders: 18 },{ month: '2024-06', revenue: 48500, margin: 12125, orders: 21 },{ month: '2024-07', revenue: 38200, margin: 9550, orders: 16 },{ month: '2024-08', revenue: 25600, margin: 6400, orders: 11 },{ month: '2024-09', revenue: 32400, margin: 8100, orders: 14 },{ month: '2024-10', revenue: 28900, margin: 7225, orders: 12 },{ month: '2024-11', revenue: 35200, margin: 8800, orders: 15 },{ month: '2024-12', revenue: 52400, margin: 13100, orders: 22 },{ month: '2025-01', revenue: 28500, margin: 7125, orders: 12 }],
};

export const clientFixedCosts = {
  CLI001: { logistics: 450, delivery: 380, admin: 120, creditCost: 95, total: 1045 },
  CLI002: { logistics: 280, delivery: 420, admin: 80, creditCost: 45, total: 825 },
  CLI003: { logistics: 850, delivery: 620, admin: 180, creditCost: 220, total: 1870 },
  CLI004: { logistics: 120, delivery: 180, admin: 40, creditCost: 15, total: 355 },
  CLI005: { logistics: 520, delivery: 350, admin: 140, creditCost: 150, total: 1160 },
  CLI006: { logistics: 180, delivery: 240, admin: 60, creditCost: 28, total: 508 },
  CLI007: { logistics: 380, delivery: 280, admin: 100, creditCost: 85, total: 845 },
  CLI008: { logistics: 320, delivery: 450, admin: 90, creditCost: 65, total: 925 },
};

// Encours clients (ajouté aux clients)
clients.forEach(c => {
  const bal = {
    CLI001: 28500, CLI002: 8200, CLI003: 45800, CLI004: 2100, 
    CLI005: 35200, CLI006: 5400, CLI007: 22100, CLI008: 18500
  };
  c.encours = bal[c.id] || 0;
  c.totalCA = Object.values(clientSalesHistory[c.id] || []).reduce((s, m) => s + m.revenue, 0);
  c.lastOrder = '2025-01-' + (15 + Math.floor(Math.random() * 14));
});

// Alias pour compatibilité
export const clientHistory = clientSalesHistory;

export const stockAlerts = [
  { id: 1, type: 'stock_low', productId: 'PRD007', productName: 'Entrecôte de bœuf', message: 'Stock actuel: 18 kg (min: 25 kg)', severity: 'warning' },
  { id: 2, type: 'stock_low', productId: 'PRD008', productName: 'Crevettes roses', message: 'Stock critique: 12 kg (min: 20 kg)', severity: 'critical' },
  { id: 3, type: 'dlc_expiring', productId: 'PRD008', productName: 'Crevettes roses', message: 'DLC dans 5 jours', severity: 'warning' },
  { id: 4, type: 'dlc_expiring', productId: 'PRD006', productName: 'Crème fraîche', message: 'DLC dans 10 jours', severity: 'info' },
];

export const clientBalances = {
  CLI001: { current: 28500, invoicesPending: 3, oldestInvoice: '2024-12-15' },
  CLI002: { current: 8200, invoicesPending: 2, oldestInvoice: '2025-01-08' },
  CLI003: { current: 45800, invoicesPending: 4, oldestInvoice: '2024-12-20' },
  CLI004: { current: 2100, invoicesPending: 1, oldestInvoice: '2025-01-18' },
  CLI005: { current: 35200, invoicesPending: 3, oldestInvoice: '2024-12-28' },
  CLI006: { current: 12800, invoicesPending: 2, oldestInvoice: '2025-01-05' },
  CLI007: { current: 18500, invoicesPending: 2, oldestInvoice: '2024-11-30' },
  CLI008: { current: 28900, invoicesPending: 5, oldestInvoice: '2024-11-15' },
};

export const products = [
  { id: 'PRD001', name: 'Filet de bœuf Charolais', ean: '3760123456789', category: 'viandes', unit: 'kg', purchasePrice: 24.50, salePrice: 32.90, margin: 25.5, stock: 45, minStock: 50, maxStock: 200, zone: 'froid-negatif', supplier: 'FRN001', dlc: '2025-02-15', lot: 'LOT-2025-0125', status: 'low-stock' },
  { id: 'PRD002', name: 'Saumon frais Norvège', ean: '3760234567890', category: 'poissons', unit: 'kg', purchasePrice: 18.90, salePrice: 26.50, margin: 28.7, stock: 85, minStock: 40, maxStock: 150, zone: 'froid-positif', supplier: 'FRN002', dlc: '2025-02-02', lot: 'LOT-2025-0128', status: 'ok' },
  { id: 'PRD003', name: 'Comté AOP 18 mois', ean: '3760345678901', category: 'fromages', unit: 'kg', purchasePrice: 16.80, salePrice: 24.90, margin: 32.5, stock: 120, minStock: 30, maxStock: 200, zone: 'froid-laitier', supplier: 'FRN003', dlc: '2025-06-30', lot: 'LOT-2024-1215', status: 'ok' },
  { id: 'PRD004', name: 'Pommes Golden Bio', ean: '3760456789012', category: 'fruits-legumes', unit: 'kg', purchasePrice: 2.20, salePrice: 3.90, margin: 43.6, stock: 250, minStock: 100, maxStock: 500, zone: 'frais', supplier: 'FRN004', dlc: '2025-02-10', lot: 'LOT-2025-0120', status: 'ok' },
  { id: 'PRD005', name: 'Huile olive Extra Vierge 5L', ean: '3760567890123', category: 'epicerie', unit: 'unité', purchasePrice: 28.50, salePrice: 42.00, margin: 32.1, stock: 65, minStock: 20, maxStock: 100, zone: 'sec', supplier: 'FRN005', dlc: '2026-03-15', lot: 'LOT-2024-1101', status: 'ok' },
  { id: 'PRD006', name: 'Crème fraîche 35% 1L', ean: '3760678901234', category: 'cremerie', unit: 'unité', purchasePrice: 3.20, salePrice: 4.80, margin: 33.3, stock: 180, minStock: 50, maxStock: 300, zone: 'froid-laitier', supplier: 'FRN003', dlc: '2025-02-05', lot: 'LOT-2025-0122', status: 'dlc-proche' },
  { id: 'PRD007', name: 'Côtes de porc Label Rouge', ean: '3760789012345', category: 'viandes', unit: 'kg', purchasePrice: 8.90, salePrice: 12.50, margin: 28.8, stock: 95, minStock: 40, maxStock: 180, zone: 'froid-negatif', supplier: 'FRN001', dlc: '2025-02-08', lot: 'LOT-2025-0126', status: 'ok' },
  { id: 'PRD008', name: 'Crevettes roses cuites 500g', ean: '3760890123456', category: 'poissons', unit: 'unité', purchasePrice: 6.50, salePrice: 9.90, margin: 34.3, stock: 12, minStock: 30, maxStock: 100, zone: 'froid-positif', supplier: 'FRN002', dlc: '2025-01-31', lot: 'LOT-2025-0124', status: 'critical' },
];

export const suppliers = [
  { id: 'FRN001', name: 'Viandes Charolais SARL', contact: 'Pierre Dupont', email: 'contact@viandes-charolais.fr', phone: '03 85 42 18 90', address: '12 ZI des Prés, 71120 Charolles', siret: '12345678900012', paymentTerms: 30, minOrder: 500, deliveryDays: ['mardi', 'jeudi'], categories: ['viandes'], rating: 4.8, status: 'active', balance: -12500 },
  { id: 'FRN002', name: 'Marée Bretonne', contact: 'Yann Le Goff', email: 'commandes@maree-bretonne.fr', phone: '02 98 55 12 34', address: 'Port de Pêche, 29200 Brest', siret: '23456789000123', paymentTerms: 15, minOrder: 300, deliveryDays: ['lundi', 'mercredi', 'vendredi'], categories: ['poissons'], rating: 4.6, status: 'active', balance: -8200 },
  { id: 'FRN003', name: 'Fromagerie Normande', contact: 'Marie Leblanc', email: 'pro@fromagerie-normande.fr', phone: '02 31 78 45 67', address: '45 Rue du Fromage, 14000 Caen', siret: '34567890001234', paymentTerms: 45, minOrder: 200, deliveryDays: ['mardi', 'vendredi'], categories: ['fromages', 'cremerie'], rating: 4.9, status: 'active', balance: -5400 },
  { id: 'FRN004', name: 'Primeurs du Sud-Est', contact: 'Antoine Mercier', email: 'antoine@primeurs-sudest.fr', phone: '04 90 23 45 67', address: 'MIN Avignon, 84000 Avignon', siret: '45678901002345', paymentTerms: 7, minOrder: 150, deliveryDays: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'], categories: ['fruits-legumes'], rating: 4.4, status: 'active', balance: -2100 },
  { id: 'FRN005', name: 'Épicerie Fine Import', contact: 'Sofia Rossi', email: 'sofia@epicerie-import.eu', phone: '01 45 67 89 01', address: '78 Rue du Commerce, 75015 Paris', siret: '56789012003456', paymentTerms: 30, minOrder: 400, deliveryDays: ['mercredi'], categories: ['epicerie'], rating: 4.7, status: 'active', balance: -3800 },
];

export const orders = [
  { id: 'CMD-2025-001', clientId: 'CLI001', date: '2025-01-29', deliveryDate: '2025-01-30', deliverySlot: '06:00-08:00', status: 'preparation', items: [{ productId: 'PRD001', quantity: 15, unitPrice: 32.90, total: 493.50 }, { productId: 'PRD003', quantity: 8, unitPrice: 24.90, total: 199.20 }], subtotal: 692.70, tax: 69.27, total: 761.97, notes: 'Livraison avant 8h', createdBy: 'Marie Dubois' },
  { id: 'CMD-2025-002', clientId: 'CLI002', date: '2025-01-29', deliveryDate: '2025-01-29', deliverySlot: '14:00-16:00', status: 'shipped', items: [{ productId: 'PRD002', quantity: 12, unitPrice: 26.50, total: 318.00 }], subtotal: 318.00, tax: 31.80, total: 349.80, notes: '', createdBy: 'Jean-Pierre Martin' },
  { id: 'CMD-2025-003', clientId: 'CLI003', date: '2025-01-28', deliveryDate: '2025-01-29', deliverySlot: '08:00-10:00', status: 'delivered', items: [{ productId: 'PRD001', quantity: 25, unitPrice: 32.90, total: 822.50 }, { productId: 'PRD004', quantity: 50, unitPrice: 3.90, total: 195.00 }], subtotal: 1017.50, tax: 101.75, total: 1119.25, notes: '', createdBy: 'Sophie Lefebvre' },
  { id: 'CMD-2025-004', clientId: 'CLI005', date: '2025-01-29', deliveryDate: '2025-01-31', deliverySlot: '10:00-12:00', status: 'pending', items: [{ productId: 'PRD002', quantity: 20, unitPrice: 26.50, total: 530.00 }], subtotal: 530.00, tax: 53.00, total: 583.00, notes: 'Événement', createdBy: 'François Girard' },
  { id: 'CMD-2025-005', clientId: 'CLI004', date: '2025-01-29', deliveryDate: '2025-01-30', deliverySlot: '05:00-06:00', status: 'pending', items: [{ productId: 'PRD006', quantity: 10, unitPrice: 4.80, total: 48.00 }], subtotal: 48.00, tax: 4.80, total: 52.80, notes: '', createdBy: 'Paul Moreau' },
];

export const invoices = [
  { id: 'FAC-2025-001', orderId: 'CMD-2025-003', clientId: 'CLI003', date: '2025-01-28', dueDate: '2025-03-14', status: 'pending', subtotal: 1017.50, tax: 101.75, total: 1119.25, paidAmount: 0, remainingAmount: 1119.25 },
  { id: 'FAC-2025-002', orderId: 'CMD-2024-245', clientId: 'CLI001', date: '2024-12-15', dueDate: '2025-01-14', status: 'overdue', subtotal: 2850.00, tax: 285.00, total: 3135.00, paidAmount: 0, remainingAmount: 3135.00 },
  { id: 'FAC-2025-003', orderId: 'CMD-2024-250', clientId: 'CLI002', date: '2025-01-08', dueDate: '2025-01-23', status: 'paid', subtotal: 1245.80, tax: 124.58, total: 1370.38, paidAmount: 1370.38, remainingAmount: 0, paidDate: '2025-01-20' },
  { id: 'FAC-2025-004', orderId: 'CMD-2024-248', clientId: 'CLI008', date: '2024-11-15', dueDate: '2024-12-15', status: 'overdue', subtotal: 4520.00, tax: 452.00, total: 4972.00, paidAmount: 2000.00, remainingAmount: 2972.00 },
  { id: 'FAC-2025-005', orderId: 'CMD-2024-260', clientId: 'CLI005', date: '2025-01-20', dueDate: '2025-02-19', status: 'pending', subtotal: 3250.00, tax: 325.00, total: 3575.00, paidAmount: 0, remainingAmount: 3575.00 },
];

export const purchases = [
  { id: 'ACH-2025-001', supplierId: 'FRN001', date: '2025-01-27', expectedDate: '2025-01-30', status: 'pending', items: [{ productId: 'PRD001', quantity: 100, unitPrice: 24.50, total: 2450.00 }], subtotal: 2450.00, tax: 245.00, total: 2695.00, notes: 'Urgent' },
  { id: 'ACH-2025-002', supplierId: 'FRN002', date: '2025-01-28', expectedDate: '2025-01-29', status: 'received', items: [{ productId: 'PRD002', quantity: 50, unitPrice: 18.90, total: 945.00 }], subtotal: 945.00, tax: 94.50, total: 1039.50, receivedDate: '2025-01-29' },
  { id: 'ACH-2025-003', supplierId: 'FRN003', date: '2025-01-25', expectedDate: '2025-01-28', status: 'partial', items: [{ productId: 'PRD003', quantity: 40, unitPrice: 16.80, total: 672.00 }], subtotal: 672.00, tax: 67.20, total: 739.20, notes: 'Rupture partielle' },
];

export const payments = [
  { id: 'REG-2025-001', invoiceId: 'FAC-2025-003', clientId: 'CLI002', date: '2025-01-20', amount: 1370.38, method: 'virement', reference: 'VIR-2025-0120', status: 'validated' },
  { id: 'REG-2025-002', invoiceId: 'FAC-2025-004', clientId: 'CLI008', date: '2025-01-15', amount: 2000.00, method: 'cheque', reference: 'CHQ-785412', status: 'validated' },
  { id: 'REG-2025-003', invoiceId: 'FAC-2025-002', clientId: 'CLI001', date: '2025-01-28', amount: 1500.00, method: 'virement', reference: 'VIR-2025-0128', status: 'pending' },
];

export const stockMovements = [
  { id: 'MVT001', date: '2025-01-29 08:30', productId: 'PRD002', type: 'entry', quantity: 50, reference: 'ACH-2025-002', user: 'Marc L.' },
  { id: 'MVT002', date: '2025-01-29 09:15', productId: 'PRD001', type: 'exit', quantity: 15, reference: 'CMD-2025-001', user: 'Julie P.' },
  { id: 'MVT003', date: '2025-01-29 10:00', productId: 'PRD003', type: 'exit', quantity: 8, reference: 'CMD-2025-001', user: 'Julie P.' },
  { id: 'MVT004', date: '2025-01-28 14:20', productId: 'PRD008', type: 'entry', quantity: 60, reference: 'ACH-2025-002', user: 'Marc L.' },
  { id: 'MVT005', date: '2025-01-28 16:45', productId: 'PRD004', type: 'exit', quantity: 50, reference: 'CMD-2025-003', user: 'Julie P.' },
];

export const storageZones = [
  { id: 'froid-negatif', name: 'Froid négatif', temp: '-18°C à -22°C', capacity: 500, used: 420, products: 12 },
  { id: 'froid-positif', name: 'Froid positif', temp: '0°C à +4°C', capacity: 800, used: 580, products: 18 },
  { id: 'froid-laitier', name: 'Frais laitiers', temp: '+2°C à +6°C', capacity: 400, used: 310, products: 15 },
  { id: 'frais', name: 'Fruits & Légumes', temp: '+8°C à +12°C', capacity: 600, used: 420, products: 22 },
  { id: 'sec', name: 'Stockage sec', temp: 'Ambiant', capacity: 1000, used: 650, products: 45 },
];

export const monthlyFinancials = [
  { month: '2024-02', revenue: 485000, costs: 388000, margin: 97000, orders: 245, clients: 42 },
  { month: '2024-03', revenue: 512000, costs: 405000, margin: 107000, orders: 268, clients: 44 },
  { month: '2024-04', revenue: 528000, costs: 418000, margin: 110000, orders: 275, clients: 45 },
  { month: '2024-05', revenue: 545000, costs: 430000, margin: 115000, orders: 285, clients: 47 },
  { month: '2024-06', revenue: 498000, costs: 398000, margin: 100000, orders: 258, clients: 45 },
  { month: '2024-07', revenue: 425000, costs: 345000, margin: 80000, orders: 215, clients: 40 },
  { month: '2024-08', revenue: 385000, costs: 315000, margin: 70000, orders: 188, clients: 35 },
  { month: '2024-09', revenue: 535000, costs: 422000, margin: 113000, orders: 278, clients: 48 },
  { month: '2024-10', revenue: 578000, costs: 455000, margin: 123000, orders: 302, clients: 52 },
  { month: '2024-11', revenue: 565000, costs: 445000, margin: 120000, orders: 295, clients: 51 },
  { month: '2024-12', revenue: 625000, costs: 490000, margin: 135000, orders: 328, clients: 55 },
  { month: '2025-01', revenue: 542000, costs: 428000, margin: 114000, orders: 282, clients: 49 },
];

export const financialPredictions = [
  { month: '2025-02', revenue: 558000, margin: 118000, confidence: 92, trend: 'up' },
  { month: '2025-03', revenue: 585000, margin: 125000, confidence: 88, trend: 'up' },
  { month: '2025-04', revenue: 612000, margin: 132000, confidence: 85, trend: 'up' },
  { month: '2025-05', revenue: 598000, margin: 128000, confidence: 82, trend: 'stable' },
  { month: '2025-06', revenue: 545000, margin: 115000, confidence: 78, trend: 'down' },
  { month: '2025-07', revenue: 480000, margin: 98000, confidence: 75, trend: 'down' },
];

export const globalKPIs = { totalRevenue: 6823000, totalMargin: 1384000, marginRate: 20.3, activeClients: 847, avgOrderValue: 1245, ordersPerDay: 28.5, stockValue: 485000, receivables: 245000, payables: 128000 };

export const alerts = [
  { id: 1, type: 'stock', severity: 'critical', message: 'Crevettes roses - Stock critique', productId: 'PRD008' },
  { id: 2, type: 'stock', severity: 'warning', message: 'Filet de bœuf - Stock bas', productId: 'PRD001' },
  { id: 3, type: 'dlc', severity: 'danger', message: 'Crème fraîche - DLC proche', productId: 'PRD006' },
  { id: 4, type: 'payment', severity: 'danger', message: 'Facture FAC-2025-002 - Impayée', invoiceId: 'FAC-2025-002' },
];

export const productCategories = [
  { id: 'viandes', name: 'Viandes', icon: '🥩' },
  { id: 'poissons', name: 'Poissons', icon: '🐟' },
  { id: 'fromages', name: 'Fromages', icon: '🧀' },
  { id: 'cremerie', name: 'Crèmerie', icon: '🥛' },
  { id: 'fruits-legumes', name: 'Fruits & Légumes', icon: '🍎' },
  { id: 'epicerie', name: 'Épicerie', icon: '🫒' },
];

export const clientTypes = [
  { id: 'supermarket', name: 'Supermarché', color: '#3b82f6' },
  { id: 'restaurant', name: 'Restaurant', color: '#10b981' },
  { id: 'hotel', name: 'Hôtel', color: '#8b5cf6' },
  { id: 'bakery', name: 'Boulangerie', color: '#f59e0b' },
  { id: 'grocery', name: 'Épicerie', color: '#ec4899' },
  { id: 'canteen', name: 'Cantine', color: '#06b6d4' },
  { id: 'caterer', name: 'Traiteur', color: '#84cc16' },
];

export const paymentMethods = [
  { id: 'virement', name: 'Virement', icon: '🏦' },
  { id: 'cheque', name: 'Chèque', icon: '📝' },
  { id: 'cb', name: 'CB', icon: '💳' },
  { id: 'especes', name: 'Espèces', icon: '💵' },
  { id: 'lcr', name: 'LCR', icon: '📄' },
];

// Alias pour compatibilité
export const categories = productCategories;

// Fonctions helper
export const getClientById = (id) => clients.find(c => c.id === id);
export const getSupplierById = (id) => suppliers.find(s => s.id === id);
export const getProductById = (id) => products.find(p => p.id === id);

// Statuses pour les commandes/factures
export const statuses = {
  orders: ['pending', 'confirmed', 'preparation', 'shipped', 'delivered', 'cancelled'],
  invoices: ['pending', 'paid', 'overdue', 'partial'],
  purchases: ['pending', 'received', 'partial', 'cancelled']
};

// Commandes fournisseurs
export const purchaseOrders = purchases;

// Factures fournisseurs
export const purchaseInvoices = purchases.map(p => ({
  id: p.id.replace('ACH', 'FAC-FRN'),
  purchaseOrderId: p.id,
  supplierId: p.supplierId,
  date: p.date,
  dueDate: new Date(new Date(p.date).getTime() + 30*24*60*60*1000).toISOString().split('T')[0],
  status: p.status === 'received' ? 'paid' : 'pending',
  subtotal: p.subtotal,
  tax: p.tax,
  total: p.total,
  paidAmount: p.status === 'received' ? p.total : 0,
  remainingAmount: p.status === 'received' ? 0 : p.total
}));

// Notifications
export const notifications = [
  { id: 1, type: 'stock', title: 'Stock critique', message: 'Crevettes roses - Stock critique (12 unités)', date: '2025-01-29', read: false },
  { id: 2, type: 'payment', title: 'Paiement reçu', message: 'Virement CLI002 - 1 370,38 €', date: '2025-01-28', read: true },
  { id: 3, type: 'order', title: 'Nouvelle commande', message: 'CMD-2025-004 - Grand Hôtel Palace', date: '2025-01-29', read: false },
  { id: 4, type: 'invoice', title: 'Facture en retard', message: 'FAC-2025-002 - 15 jours de retard', date: '2025-01-29', read: false },
];
