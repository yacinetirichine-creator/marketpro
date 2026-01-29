// ============================================
// MARKET PRO - Service Supabase (Frontend)
// ============================================

import { supabase, auth, db, storage, realtime } from '../config/supabase';

/**
 * Service d'authentification Supabase
 */
export const AuthService = {
  // Connexion
  async login(email, password) {
    const { data, error } = await auth.signIn(email, password);
    if (error) throw error;
    
    // Récupérer le profil
    const profile = await ProfileService.getCurrentProfile();
    
    return {
      user: data.user,
      session: data.session,
      profile
    };
  },

  // Inscription
  async register(userData) {
    const { email, password, firstName, lastName, phone } = userData;
    
    const { data, error } = await auth.signUp(email, password, {
      first_name: firstName,
      last_name: lastName,
      phone
    });
    
    if (error) throw error;
    return data;
  },

  // Déconnexion
  async logout() {
    const { error } = await auth.signOut();
    if (error) throw error;
    return true;
  },

  // Réinitialisation mot de passe
  async resetPassword(email) {
    const { error } = await auth.resetPassword(email);
    if (error) throw error;
    return true;
  },

  // Mise à jour mot de passe
  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return true;
  },

  // Utilisateur courant
  getCurrentUser() {
    return supabase.auth.getUser();
  },

  // Session courante
  getSession() {
    return supabase.auth.getSession();
  },

  // Écouter les changements d'auth
  onAuthStateChange(callback) {
    return auth.onAuthStateChange(callback);
  }
};

/**
 * Service de profil utilisateur
 */
export const ProfileService = {
  async getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(profileData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllProfiles(filters = {}) {
    let query = supabase.from('profiles').select('*');
    
    if (filters.role) query = query.eq('role', filters.role);
    if (filters.isActive !== undefined) query = query.eq('is_active', filters.isActive);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

/**
 * Service Produits
 */
export const ProductService = {
  async getAll(filters = {}) {
    let query = supabase
      .from('products')
      .select('*, supplier:suppliers(id, company_name)');

    if (filters.category) query = query.eq('category', filters.category);
    if (filters.isActive !== undefined) query = query.eq('is_active', filters.isActive);
    if (filters.lowStock) query = query.lt('stock_quantity', supabase.raw('min_stock_quantity'));
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('name');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*, supplier:suppliers(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByBarcode(barcode) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async updateStock(id, quantity, type, reason) {
    // Récupérer le stock actuel
    const product = await this.getById(id);
    const stockBefore = product.stock_quantity;
    
    let newStock;
    if (type.startsWith('IN_')) {
      newStock = stockBefore + quantity;
    } else {
      newStock = stockBefore - quantity;
    }

    // Mettre à jour le produit
    await this.update(id, { stock_quantity: newStock });

    // Créer le mouvement de stock
    await StockMovementService.create({
      product_id: id,
      type,
      quantity,
      stock_before: stockBefore,
      stock_after: newStock,
      reason
    });

    return { stockBefore, stockAfter: newStock };
  },

  // Écouter les changements en temps réel
  subscribeToChanges(callback) {
    return realtime.onProductChange(callback);
  },

  // Écouter les alertes de stock bas
  subscribeToLowStock(callback) {
    return realtime.onStockAlert(callback);
  }
};

/**
 * Service Clients
 */
export const ClientService = {
  async getAll(filters = {}) {
    let query = supabase.from('clients').select('*');

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.search) {
      query = query.or(`company_name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,contact_email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('company_name');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(clientData) {
    // Générer le code client si non fourni
    if (!clientData.code) {
      const { data } = await supabase.rpc('generate_client_code');
      clientData.code = data;
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, clientData) {
    const { data, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async getStats(clientId) {
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount, status')
      .eq('client_id', clientId);

    if (error) throw error;

    return {
      totalOrders: data.length,
      totalRevenue: data.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      completedOrders: data.filter(o => o.status === 'COMPLETED').length
    };
  }
};

/**
 * Service Fournisseurs
 */
export const SupplierService = {
  async getAll(filters = {}) {
    let query = supabase.from('suppliers').select('*');

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.search) {
      query = query.or(`company_name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('company_name');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(supplierData) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplierData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, supplierData) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplierData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

/**
 * Service Commandes
 */
export const OrderService = {
  async getAll(filters = {}) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        client:clients(id, company_name, code),
        items:order_items(*, product:products(id, name, sku))
      `);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.clientId) query = query.eq('client_id', filters.clientId);
    if (filters.paymentStatus) query = query.eq('payment_status', filters.paymentStatus);
    if (filters.fromDate) query = query.gte('created_at', filters.fromDate);
    if (filters.toDate) query = query.lte('created_at', filters.toDate);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        client:clients(*),
        items:order_items(*, product:products(*)),
        user:profiles(id, first_name, last_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(orderData) {
    const { items, ...order } = orderData;

    // Générer le numéro de commande
    const { data: orderNumber } = await supabase.rpc('generate_order_number');
    order.order_number = orderNumber;

    // Calculer les totaux
    order.subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    order.tax_amount = order.subtotal * 0.2; // 20% TVA par défaut
    order.total_amount = order.subtotal + order.tax_amount - (order.discount_amount || 0);

    // Créer la commande
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (orderError) throw orderError;

    // Créer les lignes de commande
    const orderItems = items.map(item => ({
      ...item,
      order_id: newOrder.id
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return await this.getById(newOrder.id);
  },

  async update(id, orderData) {
    const { data, error } = await supabase
      .from('orders')
      .update(orderData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(id, status) {
    return await this.update(id, { status });
  },

  async delete(id) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Écouter les nouvelles commandes
  subscribeToChanges(callback) {
    return realtime.onOrderChange(callback);
  }
};

/**
 * Service Factures
 */
export const InvoiceService = {
  async getAll(filters = {}) {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        client:clients(id, company_name, code),
        order:orders(id, order_number)
      `);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.clientId) query = query.eq('client_id', filters.clientId);
    if (filters.fromDate) query = query.gte('issue_date', filters.fromDate);
    if (filters.toDate) query = query.lte('issue_date', filters.toDate);
    if (filters.overdue) query = query.eq('status', 'OVERDUE');

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        order:orders(*),
        items:invoice_items(*, product:products(id, name, sku))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createFromOrder(orderId) {
    const order = await OrderService.getById(orderId);
    
    // Générer le numéro de facture
    const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');

    const invoice = {
      invoice_number: invoiceNumber,
      client_id: order.client_id,
      order_id: orderId,
      status: 'DRAFT',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: order.subtotal,
      discount_amount: order.discount_amount,
      tax_amount: order.tax_amount,
      total_amount: order.total_amount
    };

    const { data: newInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([invoice])
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Créer les lignes de facture
    const invoiceItems = order.items.map(item => ({
      invoice_id: newInvoice.id,
      product_id: item.product_id,
      description: item.product.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_rate: item.tax_rate
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);

    if (itemsError) throw itemsError;

    return await this.getById(newInvoice.id);
  },

  async update(id, invoiceData) {
    const { data, error } = await supabase
      .from('invoices')
      .update(invoiceData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsPaid(id) {
    const invoice = await this.getById(id);
    return await this.update(id, {
      status: 'PAID',
      paid_amount: invoice.total_amount,
      paid_date: new Date().toISOString().split('T')[0]
    });
  }
};

/**
 * Service Paiements
 */
export const PaymentService = {
  async getAll(filters = {}) {
    let query = supabase
      .from('payments')
      .select(`
        *,
        client:clients(id, company_name),
        invoice:invoices(id, invoice_number)
      `);

    if (filters.clientId) query = query.eq('client_id', filters.clientId);
    if (filters.invoiceId) query = query.eq('invoice_id', filters.invoiceId);
    if (filters.method) query = query.eq('method', filters.method);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('payment_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(paymentData) {
    // Générer la référence
    const timestamp = Date.now().toString(36).toUpperCase();
    paymentData.reference = `PAY-${timestamp}`;

    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) throw error;

    // Si lié à une facture, mettre à jour le montant payé
    if (paymentData.invoice_id) {
      const invoice = await InvoiceService.getById(paymentData.invoice_id);
      const newPaidAmount = (invoice.paid_amount || 0) + paymentData.amount;
      const newStatus = newPaidAmount >= invoice.total_amount ? 'PAID' : 'PARTIAL';
      
      await InvoiceService.update(paymentData.invoice_id, {
        paid_amount: newPaidAmount,
        status: newStatus,
        paid_date: newStatus === 'PAID' ? new Date().toISOString().split('T')[0] : null
      });
    }

    return data;
  }
};

/**
 * Service Mouvements de Stock
 */
export const StockMovementService = {
  async getAll(filters = {}) {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        product:products(id, name, sku),
        user:profiles(id, first_name, last_name)
      `);

    if (filters.productId) query = query.eq('product_id', filters.productId);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.fromDate) query = query.gte('created_at', filters.fromDate);
    if (filters.toDate) query = query.lte('created_at', filters.toDate);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(movementData) {
    const { data: { user } } = await supabase.auth.getUser();
    movementData.user_id = user?.id;

    const { data, error } = await supabase
      .from('stock_movements')
      .insert([movementData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

/**
 * Service Dashboard
 */
export const DashboardService = {
  async getKPIs() {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().setDate(1)).toISOString().split('T')[0];

    // Commandes du jour
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', today);

    // Commandes du mois
    const { data: monthOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', monthStart);

    // Factures impayées
    const { data: unpaidInvoices } = await supabase
      .from('invoices')
      .select('balance')
      .in('status', ['SENT', 'OVERDUE', 'PARTIAL']);

    // Produits en alerte stock
    const { data: lowStockProducts } = await supabase
      .from('products')
      .select('id')
      .lt('stock_quantity', supabase.raw('min_stock_quantity'));

    // Clients actifs
    const { data: activeClients } = await supabase
      .from('clients')
      .select('id')
      .eq('status', 'ACTIVE');

    return {
      todayRevenue: todayOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
      todayOrders: todayOrders?.length || 0,
      monthRevenue: monthOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
      monthOrders: monthOrders?.length || 0,
      unpaidAmount: unpaidInvoices?.reduce((sum, i) => sum + (i.balance || 0), 0) || 0,
      unpaidInvoices: unpaidInvoices?.length || 0,
      lowStockProducts: lowStockProducts?.length || 0,
      activeClients: activeClients?.length || 0
    };
  },

  async getRecentOrders(limit = 10) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, total_amount, status, created_at,
        client:clients(id, company_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getTopProducts(limit = 10) {
    const { data, error } = await supabase
      .from('order_items')
      .select('product_id, quantity, product:products(name, sku)')
      .order('quantity', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Grouper par produit
    const grouped = data.reduce((acc, item) => {
      const key = item.product_id;
      if (!acc[key]) {
        acc[key] = {
          product: item.product,
          totalQuantity: 0
        };
      }
      acc[key].totalQuantity += item.quantity;
      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  },

  async getSalesTrend(days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .gte('created_at', startDate)
      .order('created_at');

    if (error) throw error;

    // Grouper par jour
    const grouped = data.reduce((acc, order) => {
      const date = order.created_at.split('T')[0];
      if (!acc[date]) acc[date] = 0;
      acc[date] += order.total_amount || 0;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, revenue]) => ({
      date,
      revenue
    }));
  }
};

/**
 * Service Audit
 */
export const AuditService = {
  async log(action, resource, resourceId, details, severity = 'INFO') {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('audit_logs').insert([{
      user_id: user?.id,
      action,
      resource,
      resource_id: resourceId,
      details,
      severity
    }]);

    if (error) console.error('Audit log error:', error);
  },

  async getAll(filters = {}) {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user:profiles(id, first_name, last_name, email)
      `);

    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.action) query = query.eq('action', filters.action);
    if (filters.resource) query = query.eq('resource', filters.resource);
    if (filters.severity) query = query.eq('severity', filters.severity);
    if (filters.fromDate) query = query.gte('created_at', filters.fromDate);
    if (filters.toDate) query = query.lte('created_at', filters.toDate);

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(filters.limit || 100);

    if (error) throw error;
    return data;
  }
};

/**
 * Service Storage (pour les fichiers)
 */
export const FileService = {
  async uploadProductImage(file, productId) {
    const filePath = `products/${productId}/${file.name}`;
    const { data, error } = await storage.upload('products', filePath, file);
    
    if (error) throw error;
    
    const url = storage.getPublicUrl('products', filePath);
    
    // Mettre à jour le produit avec l'URL de l'image
    await ProductService.update(productId, { image_url: url });
    
    return url;
  },

  async uploadInvoicePDF(file, invoiceId) {
    const filePath = `invoices/${invoiceId}.pdf`;
    const { data, error } = await storage.upload('invoices', filePath, file);
    
    if (error) throw error;
    
    const url = storage.getPublicUrl('invoices', filePath);
    
    // Mettre à jour la facture avec l'URL du PDF
    await InvoiceService.update(invoiceId, { pdf_url: url });
    
    return url;
  },

  async deleteFile(bucket, path) {
    const { error } = await storage.delete(bucket, path);
    if (error) throw error;
    return true;
  }
};

// Export par défaut tous les services
export default {
  auth: AuthService,
  profile: ProfileService,
  products: ProductService,
  clients: ClientService,
  suppliers: SupplierService,
  orders: OrderService,
  invoices: InvoiceService,
  payments: PaymentService,
  stockMovements: StockMovementService,
  dashboard: DashboardService,
  audit: AuditService,
  files: FileService
};
