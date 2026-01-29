// ============================================
// MARKET PRO - Hooks Supabase
// ============================================

import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { supabase } from '../config/supabase';
import {
  AuthService,
  ProfileService,
  ProductService,
  ClientService,
  SupplierService,
  OrderService,
  InvoiceService,
  PaymentService,
  StockMovementService,
  DashboardService
} from '../services/supabaseService';

// ============================================
// Context Auth Supabase
// ============================================

const SupabaseAuthContext = createContext(null);

export const SupabaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session initiale
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const userProfile = await ProfileService.getCurrentProfile();
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const userProfile = await ProfileService.getCurrentProfile();
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const result = await AuthService.login(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      setProfile(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      return await AuthService.register(userData);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    hasRole: (role) => profile?.role === role,
    hasPermission: (permission) => profile?.permissions?.includes(permission),
    isAdmin: profile?.role === 'ADMIN',
    isManager: ['ADMIN', 'MANAGER'].includes(profile?.role)
  }), [user, profile, session, loading, login, logout, register]);

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

// ============================================
// Hook générique pour les requêtes
// ============================================

export const useSupabaseQuery = (queryFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
};

// ============================================
// Hook pour les mutations
// ============================================

export const useSupabaseMutation = (mutationFn) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn(...args);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  return { mutate, loading, error };
};

// ============================================
// Hook Produits
// ============================================

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ProductService.getAll(filters);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Abonnement aux changements en temps réel
  useEffect(() => {
    const subscription = ProductService.subscribeToChanges((payload) => {
      if (payload.eventType === 'INSERT') {
        setProducts(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
      } else if (payload.eventType === 'DELETE') {
        setProducts(prev => prev.filter(p => p.id !== payload.old.id));
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  return { 
    products, 
    loading, 
    error, 
    refetch: fetchProducts,
    lowStockProducts: products.filter(p => p.stock_quantity < p.min_stock_quantity)
  };
};

export const useProduct = (id) => {
  return useSupabaseQuery(() => ProductService.getById(id), [id]);
};

export const useProductMutations = () => {
  const create = useSupabaseMutation(ProductService.create);
  const update = useSupabaseMutation((id, data) => ProductService.update(id, data));
  const remove = useSupabaseMutation(ProductService.delete);
  const updateStock = useSupabaseMutation(
    (id, quantity, type, reason) => ProductService.updateStock(id, quantity, type, reason)
  );

  return { create, update, remove, updateStock };
};

// ============================================
// Hook Clients
// ============================================

export const useClients = (filters = {}) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ClientService.getAll(filters);
      setClients(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return { clients, loading, error, refetch: fetchClients };
};

export const useClient = (id) => {
  return useSupabaseQuery(() => ClientService.getById(id), [id]);
};

export const useClientMutations = () => {
  const create = useSupabaseMutation(ClientService.create);
  const update = useSupabaseMutation((id, data) => ClientService.update(id, data));
  const remove = useSupabaseMutation(ClientService.delete);

  return { create, update, remove };
};

// ============================================
// Hook Fournisseurs
// ============================================

export const useSuppliers = (filters = {}) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await SupplierService.getAll(filters);
      setSuppliers(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return { suppliers, loading, error, refetch: fetchSuppliers };
};

export const useSupplierMutations = () => {
  const create = useSupabaseMutation(SupplierService.create);
  const update = useSupabaseMutation((id, data) => SupplierService.update(id, data));
  const remove = useSupabaseMutation(SupplierService.delete);

  return { create, update, remove };
};

// ============================================
// Hook Commandes
// ============================================

export const useOrders = (filters = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await OrderService.getAll(filters);
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Abonnement temps réel
  useEffect(() => {
    const subscription = OrderService.subscribeToChanges((payload) => {
      if (payload.eventType === 'INSERT') {
        setOrders(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
      } else if (payload.eventType === 'DELETE') {
        setOrders(prev => prev.filter(o => o.id !== payload.old.id));
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  return { orders, loading, error, refetch: fetchOrders };
};

export const useOrder = (id) => {
  return useSupabaseQuery(() => OrderService.getById(id), [id]);
};

export const useOrderMutations = () => {
  const create = useSupabaseMutation(OrderService.create);
  const update = useSupabaseMutation((id, data) => OrderService.update(id, data));
  const updateStatus = useSupabaseMutation((id, status) => OrderService.updateStatus(id, status));
  const remove = useSupabaseMutation(OrderService.delete);

  return { create, update, updateStatus, remove };
};

// ============================================
// Hook Factures
// ============================================

export const useInvoices = (filters = {}) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await InvoiceService.getAll(filters);
      setInvoices(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { 
    invoices, 
    loading, 
    error, 
    refetch: fetchInvoices,
    overdueInvoices: invoices.filter(i => i.status === 'OVERDUE'),
    unpaidTotal: invoices.reduce((sum, i) => sum + (i.balance || 0), 0)
  };
};

export const useInvoice = (id) => {
  return useSupabaseQuery(() => InvoiceService.getById(id), [id]);
};

export const useInvoiceMutations = () => {
  const createFromOrder = useSupabaseMutation(InvoiceService.createFromOrder);
  const update = useSupabaseMutation((id, data) => InvoiceService.update(id, data));
  const markAsPaid = useSupabaseMutation(InvoiceService.markAsPaid);

  return { createFromOrder, update, markAsPaid };
};

// ============================================
// Hook Paiements
// ============================================

export const usePayments = (filters = {}) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PaymentService.getAll(filters);
      setPayments(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, loading, error, refetch: fetchPayments };
};

export const usePaymentMutations = () => {
  const create = useSupabaseMutation(PaymentService.create);
  return { create };
};

// ============================================
// Hook Mouvements de Stock
// ============================================

export const useStockMovements = (filters = {}) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await StockMovementService.getAll(filters);
      setMovements(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return { movements, loading, error, refetch: fetchMovements };
};

// ============================================
// Hook Dashboard
// ============================================

export const useDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [kpisData, ordersData, productsData, trendData] = await Promise.all([
        DashboardService.getKPIs(),
        DashboardService.getRecentOrders(10),
        DashboardService.getTopProducts(10),
        DashboardService.getSalesTrend(30)
      ]);

      setKpis(kpisData);
      setRecentOrders(ordersData);
      setTopProducts(productsData);
      setSalesTrend(trendData);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchDashboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  return { 
    kpis, 
    recentOrders, 
    topProducts, 
    salesTrend,
    loading, 
    error, 
    refetch: fetchDashboard 
  };
};

// ============================================
// Hook Temps Réel
// ============================================

export const useRealtimeSubscription = (table, callback) => {
  useEffect(() => {
    const subscription = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [table, callback]);
};

// ============================================
// Hook Scanner (code-barres)
// ============================================

export const useBarcodeLookup = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lookup = useCallback(async (barcode) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ProductService.getByBarcode(barcode);
      setProduct(result);
      return result;
    } catch (err) {
      setError(err);
      setProduct(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setProduct(null);
    setError(null);
  }, []);

  return { product, loading, error, lookup, clear };
};

// Export par défaut
export default {
  useSupabaseAuth,
  useSupabaseQuery,
  useSupabaseMutation,
  useProducts,
  useProduct,
  useProductMutations,
  useClients,
  useClient,
  useClientMutations,
  useSuppliers,
  useSupplierMutations,
  useOrders,
  useOrder,
  useOrderMutations,
  useInvoices,
  useInvoice,
  useInvoiceMutations,
  usePayments,
  usePaymentMutations,
  useStockMovements,
  useDashboard,
  useRealtimeSubscription,
  useBarcodeLookup
};
