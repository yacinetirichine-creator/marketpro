// Système de rôles et permissions pour Market Pro ERP
// Niveaux d'accès par équipe

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  COMMERCIAL: 'commercial',
  CAISSIER: 'caissier',
  MAGASINIER: 'magasinier',
  COMPTABLE: 'comptable',
  CLIENT: 'client'
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.COMMERCIAL]: 'Commercial',
  [ROLES.CAISSIER]: 'Caissier',
  [ROLES.MAGASINIER]: 'Magasinier',
  [ROLES.COMPTABLE]: 'Comptable',
  [ROLES.CLIENT]: 'Client'
};

export const ROLE_COLORS = {
  [ROLES.ADMIN]: '#ef4444',
  [ROLES.MANAGER]: '#8b5cf6',
  [ROLES.COMMERCIAL]: '#3b82f6',
  [ROLES.CAISSIER]: '#10b981',
  [ROLES.MAGASINIER]: '#f59e0b',
  [ROLES.COMPTABLE]: '#06b6d4',
  [ROLES.CLIENT]: '#64748b'
};

// Permissions par module
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ANALYTICS: 'view_analytics',
  
  // Clients
  VIEW_CLIENTS: 'view_clients',
  CREATE_CLIENT: 'create_client',
  EDIT_CLIENT: 'edit_client',
  DELETE_CLIENT: 'delete_client',
  VIEW_CLIENT_BALANCE: 'view_client_balance',
  
  // Produits & Stocks
  VIEW_PRODUCTS: 'view_products',
  CREATE_PRODUCT: 'create_product',
  EDIT_PRODUCT: 'edit_product',
  DELETE_PRODUCT: 'delete_product',
  MANAGE_STOCK: 'manage_stock',
  USE_SCANNER: 'use_scanner',
  
  // Commandes
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDER: 'create_order',
  EDIT_ORDER: 'edit_order',
  VALIDATE_ORDER: 'validate_order',
  CANCEL_ORDER: 'cancel_order',
  
  // Factures
  VIEW_INVOICES: 'view_invoices',
  CREATE_INVOICE: 'create_invoice',
  EDIT_INVOICE: 'edit_invoice',
  DELETE_INVOICE: 'delete_invoice',
  
  // Paiements
  VIEW_PAYMENTS: 'view_payments',
  CREATE_PAYMENT: 'create_payment',
  VALIDATE_PAYMENT: 'validate_payment',
  
  // Achats & Fournisseurs
  VIEW_PURCHASES: 'view_purchases',
  CREATE_PURCHASE: 'create_purchase',
  VIEW_SUPPLIERS: 'view_suppliers',
  MANAGE_SUPPLIERS: 'manage_suppliers',
  
  // Rapports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Paramètres
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  
  // Portail client
  CLIENT_VIEW_ORDERS: 'client_view_orders',
  CLIENT_CREATE_ORDER: 'client_create_order',
  CLIENT_VIEW_INVOICES: 'client_view_invoices',
  CLIENT_VIEW_BALANCE: 'client_view_balance',

  // Logistique - Réception
  VIEW_RECEIPTS: 'view_receipts',
  CREATE_RECEIPT: 'create_receipt',
  VALIDATE_RECEIPT: 'validate_receipt',

  // Logistique - Emplacements
  VIEW_LOCATIONS: 'view_locations',
  MANAGE_LOCATIONS: 'manage_locations',

  // Logistique - Inventaire
  VIEW_INVENTORY: 'view_inventory',
  CREATE_INVENTORY: 'create_inventory',
  VALIDATE_INVENTORY: 'validate_inventory',

  // Logistique - Picking
  VIEW_PICKING: 'view_picking',
  CREATE_PICKING: 'create_picking',
  EXECUTE_PICKING: 'execute_picking',

  // Analytics produits
  VIEW_PRODUCT_ANALYTICS: 'view_product_analytics',

  // Portail commande client
  CLIENT_ORDER_PORTAL: 'client_order_portal'
};

// Permissions par rôle
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS), // Tout accès
  
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.CREATE_CLIENT,
    PERMISSIONS.EDIT_CLIENT,
    PERMISSIONS.VIEW_CLIENT_BALANCE,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.MANAGE_STOCK,
    PERMISSIONS.USE_SCANNER,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.EDIT_ORDER,
    PERMISSIONS.VALIDATE_ORDER,
    PERMISSIONS.CANCEL_ORDER,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.EDIT_INVOICE,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.CREATE_PAYMENT,
    PERMISSIONS.VALIDATE_PAYMENT,
    PERMISSIONS.VIEW_PURCHASES,
    PERMISSIONS.CREATE_PURCHASE,
    PERMISSIONS.VIEW_SUPPLIERS,
    PERMISSIONS.MANAGE_SUPPLIERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_SETTINGS,
    // Logistique
    PERMISSIONS.VIEW_RECEIPTS,
    PERMISSIONS.CREATE_RECEIPT,
    PERMISSIONS.VALIDATE_RECEIPT,
    PERMISSIONS.VIEW_LOCATIONS,
    PERMISSIONS.MANAGE_LOCATIONS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.VALIDATE_INVENTORY,
    PERMISSIONS.VIEW_PICKING,
    PERMISSIONS.CREATE_PICKING,
    PERMISSIONS.EXECUTE_PICKING,
    PERMISSIONS.VIEW_PRODUCT_ANALYTICS
  ],
  
  [ROLES.COMMERCIAL]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.CREATE_CLIENT,
    PERMISSIONS.EDIT_CLIENT,
    PERMISSIONS.VIEW_CLIENT_BALANCE,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.USE_SCANNER,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.EDIT_ORDER,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [ROLES.CAISSIER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.VIEW_CLIENT_BALANCE,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.USE_SCANNER,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.CREATE_PAYMENT,
    PERMISSIONS.VALIDATE_PAYMENT
  ],
  
  [ROLES.MAGASINIER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.MANAGE_STOCK,
    PERMISSIONS.USE_SCANNER,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VALIDATE_ORDER,
    PERMISSIONS.VIEW_PURCHASES,
    PERMISSIONS.CREATE_PURCHASE,
    PERMISSIONS.VIEW_SUPPLIERS,
    // Logistique
    PERMISSIONS.VIEW_RECEIPTS,
    PERMISSIONS.CREATE_RECEIPT,
    PERMISSIONS.VALIDATE_RECEIPT,
    PERMISSIONS.VIEW_LOCATIONS,
    PERMISSIONS.MANAGE_LOCATIONS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.VALIDATE_INVENTORY,
    PERMISSIONS.VIEW_PICKING,
    PERMISSIONS.CREATE_PICKING,
    PERMISSIONS.EXECUTE_PICKING
  ],
  
  [ROLES.COMPTABLE]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.VIEW_CLIENT_BALANCE,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.EDIT_INVOICE,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.CREATE_PAYMENT,
    PERMISSIONS.VALIDATE_PAYMENT,
    PERMISSIONS.VIEW_PURCHASES,
    PERMISSIONS.VIEW_SUPPLIERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS
  ],
  
  [ROLES.CLIENT]: [
    PERMISSIONS.CLIENT_VIEW_ORDERS,
    PERMISSIONS.CLIENT_CREATE_ORDER,
    PERMISSIONS.CLIENT_VIEW_INVOICES,
    PERMISSIONS.CLIENT_VIEW_BALANCE,
    PERMISSIONS.CLIENT_ORDER_PORTAL
  ]
};

// Navigation par rôle
export const ROLE_NAVIGATION = {
  [ROLES.ADMIN]: ['dashboard', 'clients', 'stocks', 'orders', 'invoices', 'payments', 'purchases', 'suppliers', 'scanner', 'wms', 'receipts', 'locations', 'inventory', 'picking', 'product-analytics', 'reports', 'users', 'settings'],
  [ROLES.MANAGER]: ['dashboard', 'clients', 'stocks', 'orders', 'invoices', 'payments', 'purchases', 'suppliers', 'scanner', 'wms', 'receipts', 'locations', 'inventory', 'picking', 'product-analytics', 'reports', 'settings'],
  [ROLES.COMMERCIAL]: ['dashboard', 'clients', 'stocks', 'orders', 'invoices', 'scanner', 'reports'],
  [ROLES.CAISSIER]: ['dashboard', 'clients', 'orders', 'invoices', 'payments', 'scanner'],
  [ROLES.MAGASINIER]: ['dashboard', 'stocks', 'orders', 'purchases', 'suppliers', 'scanner', 'wms', 'receipts', 'locations', 'inventory', 'picking'],
  [ROLES.COMPTABLE]: ['dashboard', 'clients', 'invoices', 'payments', 'purchases', 'suppliers', 'reports', 'product-analytics'],
  [ROLES.CLIENT]: ['client-dashboard', 'client-orders', 'client-invoices', 'client-profile', 'order-portal']
};

// Utilisateurs mockés
export const mockUsers = [
  {
    id: 'USR001',
    email: 'admin@marketpro.fr',
    password: 'admin123',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: ROLES.ADMIN,
    avatar: null,
    phone: '01 23 45 67 89',
    createdAt: '2024-01-01',
    lastLogin: '2025-01-29T08:30:00',
    active: true
  },
  {
    id: 'USR002',
    email: 'manager@marketpro.fr',
    password: 'manager123',
    firstName: 'Marie',
    lastName: 'Martin',
    role: ROLES.MANAGER,
    avatar: null,
    phone: '01 23 45 67 90',
    createdAt: '2024-02-15',
    lastLogin: '2025-01-29T09:15:00',
    active: true
  },
  {
    id: 'USR003',
    email: 'commercial@marketpro.fr',
    password: 'commercial123',
    firstName: 'Pierre',
    lastName: 'Bernard',
    role: ROLES.COMMERCIAL,
    avatar: null,
    phone: '01 23 45 67 91',
    createdAt: '2024-03-10',
    lastLogin: '2025-01-28T14:20:00',
    active: true
  },
  {
    id: 'USR004',
    email: 'caissier@marketpro.fr',
    password: 'caissier123',
    firstName: 'Sophie',
    lastName: 'Petit',
    role: ROLES.CAISSIER,
    avatar: null,
    phone: '01 23 45 67 92',
    createdAt: '2024-04-05',
    lastLogin: '2025-01-29T07:00:00',
    active: true
  },
  {
    id: 'USR005',
    email: 'magasinier@marketpro.fr',
    password: 'magasinier123',
    firstName: 'Lucas',
    lastName: 'Moreau',
    role: ROLES.MAGASINIER,
    avatar: null,
    phone: '01 23 45 67 93',
    createdAt: '2024-05-20',
    lastLogin: '2025-01-29T06:30:00',
    active: true
  },
  {
    id: 'USR006',
    email: 'comptable@marketpro.fr',
    password: 'comptable123',
    firstName: 'Claire',
    lastName: 'Dubois',
    role: ROLES.COMPTABLE,
    avatar: null,
    phone: '01 23 45 67 94',
    createdAt: '2024-06-15',
    lastLogin: '2025-01-28T17:45:00',
    active: true
  }
];

// Helper functions
export const hasPermission = (userRole, permission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

export const canAccessPage = (userRole, page) => {
  const allowedPages = ROLE_NAVIGATION[userRole] || [];
  return allowedPages.includes(page);
};

export const getUserByEmail = (email) => {
  return mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const authenticateUser = (email, password) => {
  const user = getUserByEmail(email);
  if (user && user.password === password && user.active) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};
