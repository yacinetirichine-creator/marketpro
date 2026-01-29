// ============================================
// MARKET PRO - Configuration Supabase
// ============================================

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ewfkiahbrktqiouhnbtk.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_5dyZq277JEEc-kMCFgoBQg_7Wi87A03';

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// ============================================
// HELPERS D'AUTHENTIFICATION
// ============================================

export const auth = {
  // Inscription
  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
    return data;
  },

  // Connexion
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // Déconnexion
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Session actuelle
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Utilisateur actuel
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Réinitialiser mot de passe
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
    return data;
  },

  // Mettre à jour mot de passe
  updatePassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  },

  // Écouter les changements d'auth
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ============================================
// HELPERS BASE DE DONNÉES
// ============================================

export const db = {
  // ===== PRODUITS =====
  products: {
    getAll: async (filters = {}) => {
      let query = supabase.from('products').select('*');
      
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.isActive !== undefined) query = query.eq('is_active', filters.isActive);
      if (filters.search) query = query.ilike('name', `%${filters.search}%`);
      if (filters.lowStock) query = query.lt('stock_quantity', supabase.raw('min_stock_quantity'));
      
      const { data, error } = await query.order('name');
      if (error) throw error;
      return data;
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    getByBarcode: async (barcode) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (product) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    updateStock: async (id, quantity, type = 'add') => {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', id)
        .single();
      
      const newQuantity = type === 'add' 
        ? product.stock_quantity + quantity 
        : product.stock_quantity - quantity;
      
      const { data, error } = await supabase
        .from('products')
        .update({ stock_quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // ===== CLIENTS =====
  clients: {
    getAll: async (filters = {}) => {
      let query = supabase.from('clients').select('*');
      
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.search) query = query.or(`company_name.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%`);
      
      const { data, error } = await query.order('company_name');
      if (error) throw error;
      return data;
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (client) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  // ===== FOURNISSEURS =====
  suppliers: {
    getAll: async (filters = {}) => {
      let query = supabase.from('suppliers').select('*');
      
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.search) query = query.ilike('company_name', `%${filters.search}%`);
      
      const { data, error } = await query.order('company_name');
      if (error) throw error;
      return data;
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (supplier) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  // ===== COMMANDES =====
  orders: {
    getAll: async (filters = {}) => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          client:clients(id, company_name, contact_name),
          items:order_items(*, product:products(id, name, sku))
        `);
      
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.clientId) query = query.eq('client_id', filters.clientId);
      if (filters.startDate) query = query.gte('created_at', filters.startDate);
      if (filters.endDate) query = query.lte('created_at', filters.endDate);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          client:clients(*),
          items:order_items(*, product:products(*))
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (order, items) => {
      // Créer la commande
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();
      if (orderError) throw orderError;

      // Ajouter les items
      const orderItems = items.map(item => ({
        ...item,
        order_id: orderData.id
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      if (itemsError) throw itemsError;

      return orderData;
    },

    updateStatus: async (id, status) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id) => {
      // Supprimer d'abord les items
      await supabase.from('order_items').delete().eq('order_id', id);
      // Puis la commande
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // ===== FACTURES =====
  invoices: {
    getAll: async (filters = {}) => {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          client:clients(id, company_name),
          order:orders(id, order_number)
        `);
      
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.clientId) query = query.eq('client_id', filters.clientId);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(*),
          items:invoice_items(*, product:products(*))
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (invoice, items) => {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single();
      if (invoiceError) throw invoiceError;

      const invoiceItems = items.map(item => ({
        ...item,
        invoice_id: invoiceData.id
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);
      if (itemsError) throw itemsError;

      return invoiceData;
    },

    updateStatus: async (id, status) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // ===== PAIEMENTS =====
  payments: {
    getAll: async (filters = {}) => {
      let query = supabase
        .from('payments')
        .select(`
          *,
          client:clients(id, company_name),
          invoice:invoices(id, invoice_number)
        `);
      
      if (filters.method) query = query.eq('method', filters.method);
      if (filters.status) query = query.eq('status', filters.status);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    create: async (payment) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    updateStatus: async (id, status) => {
      const { data, error } = await supabase
        .from('payments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // ===== MOUVEMENTS DE STOCK =====
  stockMovements: {
    getAll: async (filters = {}) => {
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          product:products(id, name, sku)
        `);
      
      if (filters.productId) query = query.eq('product_id', filters.productId);
      if (filters.type) query = query.eq('type', filters.type);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    create: async (movement) => {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert(movement)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // ===== UTILISATEURS / PROFILS =====
  users: {
    getProfile: async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },

    updateProfile: async (userId, updates) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    getAllUsers: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  }
};

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export const realtime = {
  // S'abonner aux changements d'une table
  subscribe: (table, callback, filter = null) => {
    let channel = supabase.channel(`${table}-changes`);
    
    const subscription = {
      event: '*',
      schema: 'public',
      table: table
    };
    
    if (filter) {
      subscription.filter = filter;
    }
    
    channel = channel.on('postgres_changes', subscription, callback);
    channel.subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  },

  // S'abonner aux nouveaux produits
  onProductChange: (callback) => {
    return realtime.subscribe('products', callback);
  },

  // S'abonner aux nouvelles commandes
  onOrderChange: (callback) => {
    return realtime.subscribe('orders', callback);
  },

  // S'abonner aux alertes de stock
  onStockAlert: (callback) => {
    return realtime.subscribe('products', (payload) => {
      if (payload.new && payload.new.stock_quantity < payload.new.min_stock_quantity) {
        callback(payload);
      }
    });
  }
};

// ============================================
// STORAGE
// ============================================

export const storage = {
  // Upload un fichier
  upload: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    if (error) throw error;
    return data;
  },

  // Obtenir l'URL publique
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // Supprimer un fichier
  delete: async (bucket, paths) => {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) throw error;
  },

  // Lister les fichiers
  list: async (bucket, folder = '') => {
    const { data, error } = await supabase.storage.from(bucket).list(folder);
    if (error) throw error;
    return data;
  }
};

// ============================================
// DASHBOARD STATS
// ============================================

export const dashboard = {
  getKPIs: async () => {
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    // Ventes du jour
    const { data: todaySales } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'COMPLETED')
      .gte('created_at', today);

    // Ventes du mois
    const { data: monthSales } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'COMPLETED')
      .gte('created_at', startOfMonth);

    // Commandes en attente
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['PENDING', 'CONFIRMED']);

    // Produits en alerte stock
    const { count: lowStockCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lt('stock_quantity', 10); // ou utiliser min_stock_quantity

    // Factures impayées
    const { data: unpaidInvoices } = await supabase
      .from('invoices')
      .select('total_amount')
      .in('status', ['PENDING', 'OVERDUE']);

    return {
      todaySales: todaySales?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
      monthSales: monthSales?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
      pendingOrders: pendingOrders || 0,
      lowStockProducts: lowStockCount || 0,
      unpaidInvoicesAmount: unpaidInvoices?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0
    };
  },

  getRecentOrders: async (limit = 10) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        client:clients(company_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  getTopProducts: async (limit = 5) => {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        product:products(name, sku)
      `)
      .order('quantity', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  }
};

export default supabase;
