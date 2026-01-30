// ============================================
// MARKET PRO - Système de Rôles et Permissions
// Structure hiérarchique complète
// ============================================

// Définition des rôles avec hiérarchie
export const ROLES = {
  SUPER_ADMIN: 'super_admin',      // Niveau 1 - Multi-entreprises
  ADMIN: 'admin',                   // Niveau 2 - Administration entreprise
  RESP_LOGISTIQUE: 'resp_logistique', // Niveau 3 - Responsable logistique
  RESP_COMPTABLE: 'resp_comptable',   // Niveau 3 - Responsable comptable
  LOGISTICIEN: 'logisticien',       // Niveau 4 - Exécution logistique
  MAGASINIER: 'magasinier',         // Niveau 4 - Gestion stocks
  COMPTABLE: 'comptable',           // Niveau 4 - Saisie comptable
  COMMERCIAL: 'commercial',         // Niveau 4 - Ventes
  CAISSIER: 'caissier',            // Niveau 4 - Encaissement
  CLIENT: 'client'                  // Niveau 5 - Client externe
};

// Libellés des rôles
export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Administrateur',
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.RESP_LOGISTIQUE]: 'Responsable Logistique',
  [ROLES.RESP_COMPTABLE]: 'Responsable Comptable',
  [ROLES.LOGISTICIEN]: 'Logisticien',
  [ROLES.MAGASINIER]: 'Magasinier',
  [ROLES.COMPTABLE]: 'Comptable',
  [ROLES.COMMERCIAL]: 'Commercial',
  [ROLES.CAISSIER]: 'Caissier',
  [ROLES.CLIENT]: 'Client'
};

// Couleurs par rôle pour l'interface
export const ROLE_COLORS = {
  [ROLES.SUPER_ADMIN]: '#dc2626', // Rouge foncé
  [ROLES.ADMIN]: '#ef4444',       // Rouge
  [ROLES.RESP_LOGISTIQUE]: '#f97316', // Orange
  [ROLES.RESP_COMPTABLE]: '#8b5cf6',  // Violet
  [ROLES.LOGISTICIEN]: '#f59e0b', // Ambre
  [ROLES.MAGASINIER]: '#eab308',  // Jaune
  [ROLES.COMPTABLE]: '#06b6d4',   // Cyan
  [ROLES.COMMERCIAL]: '#3b82f6',  // Bleu
  [ROLES.CAISSIER]: '#10b981',    // Vert
  [ROLES.CLIENT]: '#64748b'       // Gris
};

// Hiérarchie des rôles (niveau numérique)
export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.RESP_LOGISTIQUE]: 3,
  [ROLES.RESP_COMPTABLE]: 3,
  [ROLES.LOGISTICIEN]: 4,
  [ROLES.MAGASINIER]: 4,
  [ROLES.COMPTABLE]: 4,
  [ROLES.COMMERCIAL]: 4,
  [ROLES.CAISSIER]: 4,
  [ROLES.CLIENT]: 5
};

// ============================================
// PERMISSIONS PAR MODULE
// ============================================

export const PERMISSIONS = {
  // === SYSTÈME ===
  MANAGE_ENTERPRISES: 'manage_enterprises',   // Super Admin uniquement
  VIEW_ALL_ENTERPRISES: 'view_all_enterprises',
  MANAGE_SYSTEM: 'manage_system',
  VIEW_SYSTEM_LOGS: 'view_system_logs',

  // === DASHBOARD ===
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_GLOBAL_STATS: 'view_global_stats',
  VIEW_TEAM_PERFORMANCE: 'view_team_performance',

  // === UTILISATEURS ===
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  MANAGE_ROLES: 'manage_roles',
  ASSIGN_ROLES: 'assign_roles',

  // === CLIENTS ===
  VIEW_CLIENTS: 'view_clients',
  CREATE_CLIENT: 'create_client',
  EDIT_CLIENT: 'edit_client',
  DELETE_CLIENT: 'delete_client',
  VIEW_CLIENT_BALANCE: 'view_client_balance',
  MANAGE_CLIENT_CREDIT: 'manage_client_credit',

  // === PRODUITS & STOCKS ===
  VIEW_PRODUCTS: 'view_products',
  CREATE_PRODUCT: 'create_product',
  EDIT_PRODUCT: 'edit_product',
  DELETE_PRODUCT: 'delete_product',
  MANAGE_STOCK: 'manage_stock',
  ADJUST_STOCK: 'adjust_stock',
  USE_SCANNER: 'use_scanner',
  VIEW_STOCK_VALUE: 'view_stock_value',

  // === COMMANDES ===
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDER: 'create_order',
  EDIT_ORDER: 'edit_order',
  VALIDATE_ORDER: 'validate_order',
  CANCEL_ORDER: 'cancel_order',
  APPROVE_DISCOUNT: 'approve_discount',

  // === FACTURES ===
  VIEW_INVOICES: 'view_invoices',
  CREATE_INVOICE: 'create_invoice',
  EDIT_INVOICE: 'edit_invoice',
  DELETE_INVOICE: 'delete_invoice',
  VALIDATE_INVOICE: 'validate_invoice',
  VOID_INVOICE: 'void_invoice',

  // === PAIEMENTS ===
  VIEW_PAYMENTS: 'view_payments',
  CREATE_PAYMENT: 'create_payment',
  VALIDATE_PAYMENT: 'validate_payment',
  REFUND_PAYMENT: 'refund_payment',
  VIEW_CASH_REGISTER: 'view_cash_register',
  MANAGE_CASH_REGISTER: 'manage_cash_register',

  // === ACHATS & FOURNISSEURS ===
  VIEW_PURCHASES: 'view_purchases',
  CREATE_PURCHASE: 'create_purchase',
  VALIDATE_PURCHASE: 'validate_purchase',
  VIEW_SUPPLIERS: 'view_suppliers',
  CREATE_SUPPLIER: 'create_supplier',
  EDIT_SUPPLIER: 'edit_supplier',
  DELETE_SUPPLIER: 'delete_supplier',
  MANAGE_SUPPLIER_PRICES: 'manage_supplier_prices',

  // === LOGISTIQUE - RÉCEPTION ===
  VIEW_RECEIPTS: 'view_receipts',
  CREATE_RECEIPT: 'create_receipt',
  VALIDATE_RECEIPT: 'validate_receipt',
  REJECT_RECEIPT: 'reject_receipt',

  // === LOGISTIQUE - EMPLACEMENTS ===
  VIEW_LOCATIONS: 'view_locations',
  CREATE_LOCATION: 'create_location',
  EDIT_LOCATION: 'edit_location',
  DELETE_LOCATION: 'delete_location',
  MANAGE_WAREHOUSE: 'manage_warehouse',

  // === LOGISTIQUE - INVENTAIRE ===
  VIEW_INVENTORY: 'view_inventory',
  CREATE_INVENTORY: 'create_inventory',
  EXECUTE_INVENTORY: 'execute_inventory',
  VALIDATE_INVENTORY: 'validate_inventory',
  APPROVE_ADJUSTMENTS: 'approve_adjustments',

  // === LOGISTIQUE - PICKING ===
  VIEW_PICKING: 'view_picking',
  CREATE_PICKING: 'create_picking',
  ASSIGN_PICKING: 'assign_picking',
  EXECUTE_PICKING: 'execute_picking',
  VALIDATE_PICKING: 'validate_picking',

  // === LOGISTIQUE - LIVRAISONS ===
  VIEW_DELIVERIES: 'view_deliveries',
  CREATE_DELIVERY: 'create_delivery',
  ASSIGN_DELIVERY: 'assign_delivery',
  COMPLETE_DELIVERY: 'complete_delivery',

  // === ANALYTICS ===
  VIEW_PRODUCT_ANALYTICS: 'view_product_analytics',
  VIEW_SALES_ANALYTICS: 'view_sales_analytics',
  VIEW_LOGISTICS_ANALYTICS: 'view_logistics_analytics',
  VIEW_FINANCIAL_ANALYTICS: 'view_financial_analytics',
  EXPORT_ANALYTICS: 'export_analytics',

  // === RAPPORTS ===
  VIEW_REPORTS: 'view_reports',
  CREATE_REPORT: 'create_report',
  EXPORT_REPORTS: 'export_reports',
  SCHEDULE_REPORTS: 'schedule_reports',

  // === PARAMÈTRES ===
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  MANAGE_INTEGRATIONS: 'manage_integrations',

  // === PORTAIL CLIENT ===
  CLIENT_VIEW_CATALOG: 'client_view_catalog',
  CLIENT_VIEW_ORDERS: 'client_view_orders',
  CLIENT_CREATE_ORDER: 'client_create_order',
  CLIENT_VIEW_INVOICES: 'client_view_invoices',
  CLIENT_VIEW_BALANCE: 'client_view_balance',
  CLIENT_ORDER_PORTAL: 'client_order_portal'
};

// ============================================
// PERMISSIONS PAR RÔLE
// ============================================

export const ROLE_PERMISSIONS = {
  // SUPER ADMIN - Tout accès + multi-entreprises
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  // ADMIN - Administration complète de l'entreprise
  [ROLES.ADMIN]: [
    // Dashboard & Analytics
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_GLOBAL_STATS,
    PERMISSIONS.VIEW_TEAM_PERFORMANCE,
    // Utilisateurs
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.ASSIGN_ROLES,
    // Clients
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.CREATE_CLIENT,
    PERMISSIONS.EDIT_CLIENT,
    PERMISSIONS.DELETE_CLIENT,
    PERMISSIONS.VIEW_CLIENT_BALANCE,
    PERMISSIONS.MANAGE_CLIENT_CREDIT,
    // Produits
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    PERMISSIONS.MANAGE_STOCK,
    PERMISSIONS.ADJUST_STOCK,
    PERMISSIONS.USE_SCANNER,
    PERMISSIONS.VIEW_STOCK_VALUE,
    // Commandes
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.EDIT_ORDER,
    PERMISSIONS.VALIDATE_ORDER,
    PERMISSIONS.CANCEL_ORDER,
    PERMISSIONS.APPROVE_DISCOUNT,
    // Factures
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.EDIT_INVOICE,
    PERMISSIONS.DELETE_INVOICE,
    PERMISSIONS.VALIDATE_INVOICE,
    PERMISSIONS.VOID_INVOICE,
    // Paiements
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.CREATE_PAYMENT,
    PERMISSIONS.VALIDATE_PAYMENT,
    PERMISSIONS.REFUND_PAYMENT,
    PERMISSIONS.VIEW_CASH_REGISTER,
    PERMISSIONS.MANAGE_CASH_REGISTER,
    // Achats & Fournisseurs
    PERMISSIONS.VIEW_PURCHASES,
    PERMISSIONS.CREATE_PURCHASE,
    PERMISSIONS.VALIDATE_PURCHASE,
    PERMISSIONS.VIEW_SUPPLIERS,
    PERMISSIONS.CREATE_SUPPLIER,
    PERMISSIONS.EDIT_SUPPLIER,
    PERMISSIONS.DELETE_SUPPLIER,
    PERMISSIONS.MANAGE_SUPPLIER_PRICES,
    // Logistique
    PERMISSIONS.VIEW_RECEIPTS,
    PERMISSIONS.CREATE_RECEIPT,
    PERMISSIONS.VALIDATE_RECEIPT,
    PERMISSIONS.REJECT_RECEIPT,
    PERMISSIONS.VIEW_LOCATIONS,
    PERMISSIONS.CREATE_LOCATION,
    PERMISSIONS.EDIT_LOCATION,
    PERMISSIONS.DELETE_LOCATION,
    PERMISSIONS.MANAGE_WAREHOUSE,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.EXECUTE_INVENTORY,
    PERMISSIONS.VALIDATE_INVENTORY,
    PERMISSIONS.APPROVE_ADJUSTMENTS,
    PERMISSIONS.VIEW_PICKING,
    PERMISSIONS.CREATE_PICKING,
    PERMISSIONS.ASSIGN_PICKING,
    PERMISSIONS.EXECUTE_PICKING,
    PERMISSIONS.VALIDATE_PICKING,
    PERMISSIONS.VIEW_DELIVERIES,
    PERMISSIONS.CREATE_DELIVERY,
    PERMISSIONS.ASSIGN_DELIVERY,
    PERMISSIONS.COMPLETE_DELIVERY,
    // Analytics
    PERMISSIONS.VIEW_PRODUCT_ANALYTICS,
    PERMISSIONS.VIEW_SALES_ANALYTICS,
    PERMISSIONS.VIEW_LOGISTICS_ANALYTICS,
    PERMISSIONS.VIEW_FINANCIAL_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
    // Rapports
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_REPORT,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.SCHEDULE_REPORTS,
    // Paramètres
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.EDIT_SETTINGS,
    PERMISSIONS.MANAGE_INTEGRATIONS
  ],

  // RESPONSABLE LOGISTIQUE - Supervise toute la logistique
  [ROLES.RESP_LOGISTIQUE]: [
    // Dashboard
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_TEAM_PERFORMANCE,
    // Produits & Stocks
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.MANAGE_STOCK,
    PERMISSIONS.ADJUST_STOCK,
    PERMISSIONS.USE_SCANNER,
    PERMISSIONS.VIEW_STOCK_VALUE,
    // Commandes (vue + validation)
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VALIDATE_ORDER,
    // Achats & Fournisseurs
    PERMISSIONS.VIEW_PURCHASES,
    PERMISSIONS.CREATE_PURCHASE,
    PERMISSIONS.VALIDATE_PURCHASE,
    PERMISSIONS.VIEW_SUPPLIERS,
    PERMISSIONS.CREATE_SUPPLIER,
    PERMISSIONS.EDIT_SUPPLIER,
    PERMISSIONS.MANAGE_SUPPLIER_PRICES,
    // Réception
    PERMISSIONS.VIEW_RECEIPTS,
    PERMISSIONS.CREATE_RECEIPT,
    PERMISSIONS.VALIDATE_RECEIPT,
    PERMISSIONS.REJECT_RECEIPT,
    // Emplacements
    PERMISSIONS.VIEW_LOCATIONS,
    PERMISSIONS.CREATE_LOCATION,
    PERMISSIONS.EDIT_LOCATION,
    PERMISSIONS.DELETE_LOCATION,
    PERMISSIONS.MANAGE_WAREHOUSE,
    // Inventaire
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.EXECUTE_INVENTORY,
    PERMISSIONS.VALIDATE_INVENTORY,
    PERMISSIONS.APPROVE_ADJUSTMENTS,
    // Picking
    PERMISSIONS.VIEW_PICKING,
    PERMISSIONS.CREATE_PICKING,
    PERMISSIONS.ASSIGN_PICKING,
    PERMISSIONS.EXECUTE_PICKING,
    PERMISSIONS.VALIDATE_PICKING,
    // Livraisons
    PERMISSIONS.VIEW_DELIVERIES,
    PERMISSIONS.CREATE_DELIVERY,
    PERMISSIONS.ASSIGN_DELIVERY,
    PERMISSIONS.COMPLETE_DELIVERY,
    // Analytics
    PERMISSIONS.VIEW_PRODUCT_ANALYTICS,
    PERMISSIONS.VIEW_LOGISTICS_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
    // Rapports
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS
  ],

  // RESPONSABLE COMPTABLE - Supervise la comptabilité
  [ROLES.RESP_COMPTABLE]: [
    // Dashboard
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_TEAM_PERFORMANCE,
    // Clients
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.VIEW_CLIENT_BALANCE,
    PERMISSIONS.MANAGE_CLIENT_CREDIT,
    // Produits (vue)
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_STOCK_VALUE,
    // Commandes (vue)
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.APPROVE_DISCOUNT,
    // Factures
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.EDIT_INVOICE,
    PERMISSIONS.DELETE_INVOICE,
    PERMISSIONS.VALIDATE_INVOICE,
    PERMISSIONS.VOID_INVOICE,
    // Paiements
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.CREATE_PAYMENT,
    PERMISSIONS.VALIDATE_PAYMENT,
    PERMISSIONS.REFUND_PAYMENT,
    PERMISSIONS.VIEW_CASH_REGISTER,
    PERMISSIONS.MANAGE_CASH_REGISTER,
    // Achats & Fournisseurs
    PERMISSIONS.VIEW_PURCHASES,
    PERMISSIONS.VALIDATE_PURCHASE,
    PERMISSIONS.VIEW_SUPPLIERS,
    PERMISSIONS.EDIT_SUPPLIER,
    // Analytics
    PERMISSIONS.VIEW_PRODUCT_ANALYTICS,
    PERMISSIONS.VIEW_SALES_ANALYTICS,
    PERMISSIONS.VIEW_FINANCIAL_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
    // Rapports
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_REPORT,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.SCHEDULE_REPORTS,
    // Paramètres (vue)
    PERMISSIONS.VIEW_SETTINGS
  ],

  // LOGISTICIEN - Exécution des tâches logistiques
  [ROLES.LOGISTICIEN]: [
    // Dashboard
    PERMISSIONS.VIEW_DASHBOARD,
    // Produits & Stocks
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.USE_SCANNER,
    // Commandes (vue)
    PERMISSIONS.VIEW_ORDERS,
    // Réception
    PERMISSIONS.VIEW_RECEIPTS,
    PERMISSIONS.CREATE_RECEIPT,
    // Emplacements
    PERMISSIONS.VIEW_LOCATIONS,
    // Inventaire
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.EXECUTE_INVENTORY,
    // Picking
    PERMISSIONS.VIEW_PICKING,
    PERMISSIONS.EXECUTE_PICKING,
    // Livraisons
    PERMISSIONS.VIEW_DELIVERIES,
    PERMISSIONS.COMPLETE_DELIVERY
  ],

  // MAGASINIER - Gestion des stocks et mouvements
  [ROLES.MAGASINIER]: [
    // Dashboard
    PERMISSIONS.VIEW_DASHBOARD,
    // Produits & Stocks
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.MANAGE_STOCK,
    PERMISSIONS.USE_SCANNER,
    // Commandes (vue + validation)
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VALIDATE_ORDER,
    // Achats (vue)
    PERMISSIONS.VIEW_PURCHASES,
    PERMISSIONS.VIEW_SUPPLIERS,
    // Réception
    PERMISSIONS.VIEW_RECEIPTS,
    PERMISSIONS.CREATE_RECEIPT,
    // Emplacements
    PERMISSIONS.VIEW_LOCATIONS,
    PERMISSIONS.EDIT_LOCATION,
    // Inventaire
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.EXECUTE_INVENTORY,
    // Picking
    PERMISSIONS.VIEW_PICKING,
    PERMISSIONS.EXECUTE_PICKING
  ],

  // COMPTABLE - Saisie comptable quotidienne
  [ROLES.COMPTABLE]: [
    // Dashboard
    PERMISSIONS.VIEW_DASHBOARD,
    // Clients
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.VIEW_CLIENT_BALANCE,
    // Produits (vue)
    PERMISSIONS.VIEW_PRODUCTS,
    // Commandes (vue)
    PERMISSIONS.VIEW_ORDERS,
    // Factures
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.EDIT_INVOICE,
    // Paiements
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.CREATE_PAYMENT,
    PERMISSIONS.VALIDATE_PAYMENT,
    // Achats & Fournisseurs
    PERMISSIONS.VIEW_PURCHASES,
    PERMISSIONS.VIEW_SUPPLIERS,
    // Rapports
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS
  ],

  // COMMERCIAL - Ventes et relation client
  [ROLES.COMMERCIAL]: [
    // Dashboard
    PERMISSIONS.VIEW_DASHBOARD,
    // Clients
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.CREATE_CLIENT,
    PERMISSIONS.EDIT_CLIENT,
    PERMISSIONS.VIEW_CLIENT_BALANCE,
    // Produits (vue)
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.USE_SCANNER,
    // Commandes
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.EDIT_ORDER,
    // Factures
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICE,
    // Paiements (vue)
    PERMISSIONS.VIEW_PAYMENTS,
    // Analytics ventes
    PERMISSIONS.VIEW_SALES_ANALYTICS,
    // Rapports
    PERMISSIONS.VIEW_REPORTS
  ],

  // CAISSIER - Encaissement et transactions
  [ROLES.CAISSIER]: [
    // Dashboard
    PERMISSIONS.VIEW_DASHBOARD,
    // Clients
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.VIEW_CLIENT_BALANCE,
    // Produits (vue)
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.USE_SCANNER,
    // Commandes
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDER,
    // Factures
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICE,
    // Paiements
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.CREATE_PAYMENT,
    PERMISSIONS.VIEW_CASH_REGISTER
  ],

  // CLIENT - Accès portail client uniquement
  [ROLES.CLIENT]: [
    PERMISSIONS.CLIENT_VIEW_CATALOG,
    PERMISSIONS.CLIENT_VIEW_ORDERS,
    PERMISSIONS.CLIENT_CREATE_ORDER,
    PERMISSIONS.CLIENT_VIEW_INVOICES,
    PERMISSIONS.CLIENT_VIEW_BALANCE,
    PERMISSIONS.CLIENT_ORDER_PORTAL
  ]
};

// ============================================
// NAVIGATION PAR RÔLE
// ============================================

export const ROLE_NAVIGATION = {
  [ROLES.SUPER_ADMIN]: [
    'dashboard', 'enterprises', 'users', 'clients', 'stocks', 'orders',
    'invoices', 'payments', 'purchases', 'suppliers', 'scanner', 'wms',
    'receipts', 'locations', 'inventory', 'picking', 'deliveries',
    'product-analytics', 'reports', 'settings', 'system-logs'
  ],
  [ROLES.ADMIN]: [
    'dashboard', 'users', 'clients', 'stocks', 'orders', 'invoices',
    'payments', 'purchases', 'suppliers', 'scanner', 'wms', 'receipts',
    'locations', 'inventory', 'picking', 'deliveries', 'product-analytics',
    'reports', 'settings'
  ],
  [ROLES.RESP_LOGISTIQUE]: [
    'dashboard', 'stocks', 'orders', 'purchases', 'suppliers', 'scanner',
    'wms', 'receipts', 'locations', 'inventory', 'picking', 'deliveries',
    'product-analytics', 'reports'
  ],
  [ROLES.RESP_COMPTABLE]: [
    'dashboard', 'clients', 'orders', 'invoices', 'payments', 'purchases',
    'suppliers', 'product-analytics', 'reports', 'settings'
  ],
  [ROLES.LOGISTICIEN]: [
    'dashboard', 'stocks', 'orders', 'scanner', 'receipts', 'locations',
    'inventory', 'picking', 'deliveries'
  ],
  [ROLES.MAGASINIER]: [
    'dashboard', 'stocks', 'orders', 'purchases', 'suppliers', 'scanner',
    'receipts', 'locations', 'inventory', 'picking'
  ],
  [ROLES.COMPTABLE]: [
    'dashboard', 'clients', 'orders', 'invoices', 'payments', 'purchases',
    'suppliers', 'reports'
  ],
  [ROLES.COMMERCIAL]: [
    'dashboard', 'clients', 'stocks', 'orders', 'invoices', 'scanner', 'reports'
  ],
  [ROLES.CAISSIER]: [
    'dashboard', 'clients', 'orders', 'invoices', 'payments', 'scanner'
  ],
  [ROLES.CLIENT]: [
    'order-portal', 'client-orders', 'client-invoices', 'client-profile'
  ]
};

// ============================================
// UTILISATEURS DE DÉMONSTRATION
// Note: Les mots de passe sont stockés côté serveur uniquement
// Ces données sont utilisées pour l'affichage UI uniquement
// ============================================

export const mockUsers = [
  {
    id: 'USR001',
    email: 'superadmin@marketpro.fr',
    firstName: 'Alexandre',
    lastName: 'Directeur',
    role: ROLES.SUPER_ADMIN,
    avatar: null,
    phone: '01 00 00 00 01',
    department: 'Direction Générale',
    createdAt: '2024-01-01',
    lastLogin: '2025-01-30T08:00:00',
    active: true
  },
  {
    id: 'USR002',
    email: 'admin@marketpro.fr',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: ROLES.ADMIN,
    avatar: null,
    phone: '01 23 45 67 89',
    department: 'Administration',
    createdAt: '2024-01-01',
    lastLogin: '2025-01-29T08:30:00',
    active: true
  },
  {
    id: 'USR003',
    email: 'resp.logistique@marketpro.fr',
    firstName: 'Marie',
    lastName: 'Logistica',
    role: ROLES.RESP_LOGISTIQUE,
    avatar: null,
    phone: '01 23 45 67 90',
    department: 'Logistique',
    createdAt: '2024-02-01',
    lastLogin: '2025-01-30T06:00:00',
    active: true
  },
  {
    id: 'USR004',
    email: 'resp.comptable@marketpro.fr',
    firstName: 'Philippe',
    lastName: 'Comptafort',
    role: ROLES.RESP_COMPTABLE,
    avatar: null,
    phone: '01 23 45 67 91',
    department: 'Comptabilité',
    createdAt: '2024-02-01',
    lastLogin: '2025-01-29T09:00:00',
    active: true
  },
  {
    id: 'USR005',
    email: 'logisticien@marketpro.fr',
    firstName: 'Lucas',
    lastName: 'Preparateur',
    role: ROLES.LOGISTICIEN,
    avatar: null,
    phone: '01 23 45 67 92',
    department: 'Logistique',
    createdAt: '2024-03-01',
    lastLogin: '2025-01-30T05:30:00',
    active: true
  },
  {
    id: 'USR006',
    email: 'magasinier@marketpro.fr',
    firstName: 'Thomas',
    lastName: 'Stockman',
    role: ROLES.MAGASINIER,
    avatar: null,
    phone: '01 23 45 67 93',
    department: 'Entrepôt',
    createdAt: '2024-03-15',
    lastLogin: '2025-01-30T06:30:00',
    active: true
  },
  {
    id: 'USR007',
    email: 'comptable@marketpro.fr',
    firstName: 'Claire',
    lastName: 'Dubois',
    role: ROLES.COMPTABLE,
    avatar: null,
    phone: '01 23 45 67 94',
    department: 'Comptabilité',
    createdAt: '2024-04-01',
    lastLogin: '2025-01-29T17:45:00',
    active: true
  },
  {
    id: 'USR008',
    email: 'commercial@marketpro.fr',
    firstName: 'Pierre',
    lastName: 'Bernard',
    role: ROLES.COMMERCIAL,
    avatar: null,
    phone: '01 23 45 67 95',
    department: 'Commercial',
    createdAt: '2024-04-15',
    lastLogin: '2025-01-29T14:20:00',
    active: true
  },
  {
    id: 'USR009',
    email: 'caissier@marketpro.fr',
    firstName: 'Sophie',
    lastName: 'Petit',
    role: ROLES.CAISSIER,
    avatar: null,
    phone: '01 23 45 67 96',
    department: 'Ventes',
    createdAt: '2024-05-01',
    lastLogin: '2025-01-30T07:00:00',
    active: true
  },
  {
    id: 'USR010',
    email: 'client@restaurant-lyon.fr',
    firstName: 'Marc',
    lastName: 'Restaurant',
    role: ROLES.CLIENT,
    avatar: null,
    phone: '04 72 00 00 01',
    company: 'Le Bistrot Lyonnais',
    clientId: 'CLI-001',
    createdAt: '2024-06-01',
    lastLogin: '2025-01-28T12:00:00',
    active: true
  }
];

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Vérifie si un utilisateur a une permission
 */
export const hasPermission = (userRole, permission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

/**
 * Vérifie si un utilisateur peut accéder à une page
 */
export const canAccessPage = (userRole, page) => {
  const allowedPages = ROLE_NAVIGATION[userRole] || [];
  return allowedPages.includes(page);
};

/**
 * Vérifie si un rôle est supérieur à un autre dans la hiérarchie
 */
export const isRoleSuperiorTo = (role1, role2) => {
  return (ROLE_HIERARCHY[role1] || 99) < (ROLE_HIERARCHY[role2] || 99);
};

/**
 * Récupère les rôles qu'un utilisateur peut gérer (inférieurs dans la hiérarchie)
 */
export const getManageableRoles = (userRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 99;
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level > userLevel)
    .map(([role]) => role);
};

/**
 * Récupère un utilisateur par email (données publiques uniquement)
 */
export const getUserByEmail = (email) => {
  return mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
};

/**
 * Note: L'authentification doit être faite côté serveur
 * Cette fonction est dépréciée - utiliser l'API d'authentification
 * @deprecated Utiliser AuthContext.login() qui appelle l'API backend
 */
export const authenticateUser = async (email, password) => {
  console.warn('[SECURITY] authenticateUser est déprécié. Utiliser AuthContext.login()');
  // L'authentification réelle doit passer par le backend
  // Cette fonction ne fait plus de vérification de mot de passe côté client
  const user = getUserByEmail(email);
  if (user && user.active) {
    // En mode démo uniquement - à supprimer en production
    if (process.env.NODE_ENV === 'development') {
      return user;
    }
  }
  return null;
};

/**
 * Récupère le dashboard approprié pour un rôle
 */
export const getDashboardForRole = (role) => {
  const dashboardMap = {
    [ROLES.SUPER_ADMIN]: 'super-admin-dashboard',
    [ROLES.ADMIN]: 'admin-dashboard',
    [ROLES.RESP_LOGISTIQUE]: 'logistics-dashboard',
    [ROLES.RESP_COMPTABLE]: 'accounting-dashboard',
    [ROLES.LOGISTICIEN]: 'operator-logistics-dashboard',
    [ROLES.MAGASINIER]: 'warehouse-dashboard',
    [ROLES.COMPTABLE]: 'accountant-dashboard',
    [ROLES.COMMERCIAL]: 'sales-dashboard',
    [ROLES.CAISSIER]: 'cashier-dashboard',
    [ROLES.CLIENT]: 'client-dashboard'
  };
  return dashboardMap[role] || 'dashboard';
};

/**
 * Récupère les KPIs pertinents pour un rôle
 */
export const getKPIsForRole = (role) => {
  const kpiMap = {
    [ROLES.SUPER_ADMIN]: ['revenue', 'enterprises', 'users', 'growth', 'alerts'],
    [ROLES.ADMIN]: ['revenue', 'orders', 'clients', 'stock_value', 'team_performance'],
    [ROLES.RESP_LOGISTIQUE]: ['picking_rate', 'reception_pending', 'inventory_accuracy', 'delivery_rate', 'team_efficiency'],
    [ROLES.RESP_COMPTABLE]: ['revenue', 'unpaid_invoices', 'cash_flow', 'margins', 'pending_payments'],
    [ROLES.LOGISTICIEN]: ['my_pickings', 'my_receptions', 'completed_today', 'pending_tasks'],
    [ROLES.MAGASINIER]: ['low_stock', 'movements_today', 'pending_receipts', 'locations_used'],
    [ROLES.COMPTABLE]: ['invoices_to_process', 'payments_pending', 'daily_entries', 'reconciliation'],
    [ROLES.COMMERCIAL]: ['my_sales', 'my_clients', 'my_quotes', 'monthly_target', 'conversion_rate'],
    [ROLES.CAISSIER]: ['daily_sales', 'transactions', 'cash_balance', 'refunds'],
    [ROLES.CLIENT]: ['my_orders', 'pending_delivery', 'my_balance', 'last_invoice']
  };
  return kpiMap[role] || [];
};
