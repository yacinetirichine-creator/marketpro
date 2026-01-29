// ============================================
// MARKET PRO - HOOKS PERSONNALISÉS ERP
// ============================================

import { useState, useMemo, useCallback } from 'react';
import {
  clients,
  clientSalesHistory,
  clientFixedCosts,
  suppliers,
  products,
  orders,
  invoices,
  purchaseInvoices,
  purchaseOrders,
  payments,
  stockMovements,
  alerts,
  monthlyFinancials,
  financialPredictions,
  globalKPIs,
  notifications,
  categories,
  statuses,
  getClientById,
  getSupplierById,
  getProductById
} from '../data/mockData';

// === NAVIGATION ===
export const useNavigation = (initialPage = 'dashboard') => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [history, setHistory] = useState([initialPage]);

  const navigate = useCallback((page) => {
    setCurrentPage(page);
    setHistory(prev => [...prev, page]);
  }, []);

  const goBack = useCallback(() => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setCurrentPage(newHistory[newHistory.length - 1]);
    }
  }, [history]);

  return { currentPage, navigate, goBack, history };
};

// === DEBOUNCE ===
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useState(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// === FORMATTERS ===
export const useFormatters = () => {
  const formatCurrency = useCallback((value, decimals = 2) => {
    if (value === null || value === undefined) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }, []);

  const formatNumber = useCallback((value, decimals = 0) => {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }, []);

  const formatPercent = useCallback((value, decimals = 1) => {
    if (value === null || value === undefined) return '0%';
    return `${value.toFixed(decimals)}%`;
  }, []);

  const formatDate = useCallback((date, format = 'short') => {
    if (!date) return '';
    const d = new Date(date);
    if (format === 'short') {
      return d.toLocaleDateString('fr-FR');
    } else if (format === 'long') {
      return d.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (format === 'datetime') {
      return d.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return d.toLocaleDateString('fr-FR');
  }, []);

  const formatPhone = useCallback((phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  }, []);

  return { formatCurrency, formatNumber, formatPercent, formatDate, formatPhone };
};

// === CLIENTS ===
export const useClients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = !searchTerm || 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || client.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchTerm, typeFilter, statusFilter]);

  const getClientHistory = useCallback((clientId) => {
    return clientSalesHistory[clientId] || [];
  }, []);

  const getClientCosts = useCallback((clientId) => {
    return clientFixedCosts[clientId] || { logistique: 0, livraisons: 0, administratif: 0, coutCredit: 0, total: 0 };
  }, []);

  const getClientStats = useCallback((clientId) => {
    const history = getClientHistory(clientId);
    if (!history.length) return { totalRevenue: 0, totalMargin: 0, avgRevenue: 0, growth: 0 };

    const totalRevenue = history.reduce((sum, m) => sum + m.revenue, 0);
    const totalMargin = history.reduce((sum, m) => sum + m.margin, 0);
    const avgRevenue = totalRevenue / history.length;
    
    const last3 = history.slice(-3);
    const prev3 = history.slice(-6, -3);
    const last3Avg = last3.reduce((s, m) => s + m.revenue, 0) / 3;
    const prev3Avg = prev3.length ? prev3.reduce((s, m) => s + m.revenue, 0) / 3 : last3Avg;
    const growth = prev3Avg ? ((last3Avg - prev3Avg) / prev3Avg) * 100 : 0;

    return { totalRevenue, totalMargin, avgRevenue, growth };
  }, [getClientHistory]);

  const clientTypes = useMemo(() => categories.clients, []);

  return {
    clients: filteredClients,
    allClients: clients,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    selectedClient,
    setSelectedClient,
    getClientHistory,
    getClientCosts,
    getClientStats,
    clientTypes,
    getClientById
  };
};

// === FOURNISSEURS ===
export const useSuppliers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = !searchTerm || 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || supplier.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, typeFilter]);

  const getSupplierProducts = useCallback((supplierId) => {
    return products.filter(p => p.fournisseur === supplierId);
  }, []);

  const getSupplierPurchases = useCallback((supplierId) => {
    return purchaseOrders.filter(po => po.supplierId === supplierId);
  }, []);

  const getSupplierInvoices = useCallback((supplierId) => {
    return purchaseInvoices.filter(pi => pi.supplierId === supplierId);
  }, []);

  const supplierTypes = useMemo(() => categories.suppliers, []);

  return {
    suppliers: filteredSuppliers,
    allSuppliers: suppliers,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    selectedSupplier,
    setSelectedSupplier,
    getSupplierProducts,
    getSupplierPurchases,
    getSupplierInvoices,
    supplierTypes,
    getSupplierById
  };
};

// === PRODUITS ===
export const useProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.ean.includes(searchTerm) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesZone = zoneFilter === 'all' || product.zone === zoneFilter;
      
      let matchesStock = true;
      if (stockFilter === 'low') {
        matchesStock = product.stock <= product.stockMin;
      } else if (stockFilter === 'ok') {
        matchesStock = product.stock > product.stockMin && product.stock <= product.stockMax;
      } else if (stockFilter === 'high') {
        matchesStock = product.stock > product.stockMax * 0.8;
      }
      
      return matchesSearch && matchesCategory && matchesZone && matchesStock;
    });
  }, [searchTerm, categoryFilter, zoneFilter, stockFilter]);

  const getProductMovements = useCallback((productId) => {
    return stockMovements.filter(m => m.productId === productId);
  }, []);

  const productCategories = useMemo(() => categories.products, []);

  const stockStats = useMemo(() => {
    const total = products.length;
    const low = products.filter(p => p.stock <= p.stockMin).length;
    const ok = products.filter(p => p.stock > p.stockMin).length;
    const dlcClose = products.filter(p => {
      const dlc = new Date(p.dlc);
      const now = new Date();
      const diff = (dlc - now) / (1000 * 60 * 60 * 24);
      return diff <= 7 && diff > 0;
    }).length;
    return { total, low, ok, dlcClose };
  }, []);

  return {
    products: filteredProducts,
    allProducts: products,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    zoneFilter,
    setZoneFilter,
    stockFilter,
    setStockFilter,
    selectedProduct,
    setSelectedProduct,
    getProductMovements,
    productCategories,
    stockStats,
    getProductById
  };
};

// === COMMANDES ===
export const useOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClientById(order.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter === 'today') {
        matchesDate = order.date === new Date().toISOString().split('T')[0];
      } else if (dateFilter === 'week') {
        const orderDate = new Date(order.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = orderDate >= weekAgo;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchTerm, statusFilter, dateFilter]);

  const orderStats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const preparation = orders.filter(o => o.status === 'preparation').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const totalAmount = orders.reduce((sum, o) => sum + o.totalTTC, 0);
    return { total, pending, preparation, shipped, delivered, totalAmount };
  }, []);

  const orderStatuses = useMemo(() => statuses.orders, []);

  return {
    orders: filteredOrders,
    allOrders: orders,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    selectedOrder,
    setSelectedOrder,
    orderStats,
    orderStatuses
  };
};

// === FACTURES VENTES ===
export const useInvoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = !searchTerm || 
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClientById(invoice.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      let matchesPeriod = true;
      if (periodFilter === 'month') {
        const invoiceDate = new Date(invoice.date);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesPeriod = invoiceDate >= monthAgo;
      } else if (periodFilter === 'quarter') {
        const invoiceDate = new Date(invoice.date);
        const quarterAgo = new Date();
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        matchesPeriod = invoiceDate >= quarterAgo;
      }
      
      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [searchTerm, statusFilter, periodFilter]);

  const invoiceStats = useMemo(() => {
    const total = invoices.length;
    const pending = invoices.filter(i => i.status === 'pending').length;
    const paid = invoices.filter(i => i.status === 'paid').length;
    const partial = invoices.filter(i => i.status === 'partial').length;
    const overdue = invoices.filter(i => i.status === 'overdue').length;
    const totalAmount = invoices.reduce((sum, i) => sum + i.totalTTC, 0);
    const totalPending = invoices.reduce((sum, i) => sum + i.resteAPayer, 0);
    return { total, pending, paid, partial, overdue, totalAmount, totalPending };
  }, []);

  const invoiceStatuses = useMemo(() => statuses.invoices, []);

  return {
    invoices: filteredInvoices,
    allInvoices: invoices,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    periodFilter,
    setPeriodFilter,
    selectedInvoice,
    setSelectedInvoice,
    invoiceStats,
    invoiceStatuses
  };
};

// === FACTURES ACHATS ===
export const usePurchaseInvoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const filteredInvoices = useMemo(() => {
    return purchaseInvoices.filter(invoice => {
      const matchesSearch = !searchTerm || 
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSupplierById(invoice.supplierId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = purchaseInvoices.length;
    const pending = purchaseInvoices.filter(i => i.status === 'pending').length;
    const paid = purchaseInvoices.filter(i => i.status === 'paid').length;
    const totalAmount = purchaseInvoices.reduce((sum, i) => sum + i.totalTTC, 0);
    const totalPending = purchaseInvoices.reduce((sum, i) => sum + i.resteAPayer, 0);
    return { total, pending, paid, totalAmount, totalPending };
  }, []);

  return {
    invoices: filteredInvoices,
    allInvoices: purchaseInvoices,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedInvoice,
    setSelectedInvoice,
    stats
  };
};

// === COMMANDES ACHATS ===
export const usePurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSupplierById(order.supplierId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = purchaseOrders.length;
    const pending = purchaseOrders.filter(o => o.status === 'pending').length;
    const confirmed = purchaseOrders.filter(o => o.status === 'confirmed').length;
    const received = purchaseOrders.filter(o => o.status === 'received').length;
    const totalAmount = purchaseOrders.reduce((sum, o) => sum + o.totalTTC, 0);
    return { total, pending, confirmed, received, totalAmount };
  }, []);

  const purchaseStatuses = useMemo(() => statuses.purchases, []);

  return {
    orders: filteredOrders,
    allOrders: purchaseOrders,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedOrder,
    setSelectedOrder,
    stats,
    purchaseStatuses
  };
};

// === PAIEMENTS ===
export const usePayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = !searchTerm || 
        payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || payment.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      
      let matchesPeriod = true;
      if (periodFilter === 'week') {
        const paymentDate = new Date(payment.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesPeriod = paymentDate >= weekAgo;
      } else if (periodFilter === 'month') {
        const paymentDate = new Date(payment.date);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesPeriod = paymentDate >= monthAgo;
      }
      
      return matchesSearch && matchesType && matchesStatus && matchesPeriod;
    });
  }, [searchTerm, typeFilter, statusFilter, periodFilter]);

  const stats = useMemo(() => {
    const incoming = payments.filter(p => p.type === 'incoming');
    const outgoing = payments.filter(p => p.type === 'outgoing');
    const totalIncoming = incoming.reduce((sum, p) => sum + p.montant, 0);
    const totalOutgoing = outgoing.reduce((sum, p) => sum + p.montant, 0);
    const pendingCount = payments.filter(p => p.status === 'pending').length;
    return { 
      incomingCount: incoming.length, 
      outgoingCount: outgoing.length, 
      totalIncoming, 
      totalOutgoing,
      pendingCount,
      balance: totalIncoming - totalOutgoing
    };
  }, []);

  return {
    payments: filteredPayments,
    allPayments: payments,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    periodFilter,
    setPeriodFilter,
    stats
  };
};

// === ANALYSE FINANCIÈRE ===
export const useFinancials = () => {
  const data = useMemo(() => monthlyFinancials, []);
  const predictions = useMemo(() => financialPredictions, []);
  const kpis = useMemo(() => globalKPIs, []);

  const yearlyStats = useMemo(() => {
    const totalRevenue = data.reduce((sum, m) => sum + m.revenue, 0);
    const totalMargin = data.reduce((sum, m) => sum + m.margin, 0);
    const totalOrders = data.reduce((sum, m) => sum + m.orders, 0);
    const avgMarginPercent = (totalMargin / totalRevenue) * 100;
    
    const lastMonth = data[data.length - 1];
    const prevMonth = data[data.length - 2];
    const revenueGrowth = prevMonth ? ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100 : 0;
    
    return { totalRevenue, totalMargin, totalOrders, avgMarginPercent, revenueGrowth };
  }, [data]);

  return { data, predictions, kpis, yearlyStats };
};

// === ANALYSE CLIENT ===
export const useClientFinancialAnalysis = (clientId) => {
  const history = useMemo(() => clientSalesHistory[clientId] || [], [clientId]);
  const costs = useMemo(() => clientFixedCosts[clientId] || { total: 0 }, [clientId]);

  const analysis = useMemo(() => {
    if (!history.length) return null;

    const totalRevenue = history.reduce((sum, m) => sum + m.revenue, 0);
    const totalMargin = history.reduce((sum, m) => sum + m.margin, 0);
    const totalCosts = costs.total * history.length;
    const netMargin = totalMargin - totalCosts;

    const last3 = history.slice(-3);
    const prev3 = history.slice(-6, -3);
    const last3Avg = last3.reduce((s, m) => s + m.revenue, 0) / 3;
    const prev3Avg = prev3.length ? prev3.reduce((s, m) => s + m.revenue, 0) / 3 : last3Avg;
    const growth = prev3Avg ? ((last3Avg - prev3Avg) / prev3Avg) * 100 : 0;

    // Prédictions simplifiées
    const predictions = [];
    let baseValue = last3Avg;
    const trend = growth / 100;
    for (let i = 0; i < 6; i++) {
      baseValue *= (1 + trend * 0.5);
      predictions.push({
        month: `M+${i + 1}`,
        revenue: Math.round(baseValue),
        confidence: Math.max(0.5, 0.95 - i * 0.08)
      });
    }

    return {
      totalRevenue,
      totalMargin,
      totalCosts,
      netMargin,
      growth,
      avgRevenue: totalRevenue / history.length,
      avgMargin: totalMargin / history.length,
      predictions
    };
  }, [history, costs]);

  return { history, costs, analysis };
};

// === NOTIFICATIONS ===
export const useNotifications = () => {
  const [notifs, setNotifs] = useState(notifications);

  const unreadCount = useMemo(() => notifs.filter(n => !n.read).length, [notifs]);

  const markAsRead = useCallback((id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return { notifications: notifs, unreadCount, markAsRead, markAllAsRead };
};

// === ALERTES ===
export const useAlerts = () => {
  const [alertList, setAlertList] = useState(alerts);

  const activeAlerts = useMemo(() => alertList.filter(a => a.actionRequired && !a.read), [alertList]);
  
  const alertsByType = useMemo(() => ({
    stock: alertList.filter(a => a.type === 'stock_low' || a.type === 'dlc_proche'),
    payment: alertList.filter(a => a.type === 'payment_overdue'),
    client: alertList.filter(a => a.type === 'encours_eleve')
  }), [alertList]);

  const dismissAlert = useCallback((id) => {
    setAlertList(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  return { alerts: alertList, activeAlerts, alertsByType, dismissAlert };
};

// === SOLDES CLIENTS ===
export const useClientBalances = () => {
  const balances = useMemo(() => {
    return clients.map(client => {
      const clientInvoices = invoices.filter(i => i.clientId === client.id);
      const totalFacture = clientInvoices.reduce((sum, i) => sum + i.totalTTC, 0);
      const totalPaye = clientInvoices.reduce((sum, i) => sum + (i.totalTTC - i.resteAPayer), 0);
      const solde = totalFacture - totalPaye;
      const overdueAmount = clientInvoices
        .filter(i => i.status === 'overdue')
        .reduce((sum, i) => sum + i.resteAPayer, 0);

      return {
        ...client,
        totalFacture,
        totalPaye,
        solde,
        overdueAmount,
        lastPayment: payments
          .filter(p => p.clientId === client.id && p.type === 'incoming')
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date
      };
    });
  }, []);

  const totalBalance = useMemo(() => balances.reduce((sum, b) => sum + b.solde, 0), [balances]);
  const totalOverdue = useMemo(() => balances.reduce((sum, b) => sum + b.overdueAmount, 0), [balances]);

  return { balances, totalBalance, totalOverdue };
};

// === SOLDES FOURNISSEURS ===
export const useSupplierBalances = () => {
  const balances = useMemo(() => {
    return suppliers.map(supplier => {
      const supplierInvoices = purchaseInvoices.filter(i => i.supplierId === supplier.id);
      const totalFacture = supplierInvoices.reduce((sum, i) => sum + i.totalTTC, 0);
      const totalPaye = supplierInvoices.reduce((sum, i) => sum + (i.totalTTC - i.resteAPayer), 0);
      const solde = totalFacture - totalPaye;

      return {
        ...supplier,
        totalFacture,
        totalPaye,
        solde,
        lastPayment: payments
          .filter(p => p.supplierId === supplier.id && p.type === 'outgoing')
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date
      };
    });
  }, []);

  const totalBalance = useMemo(() => balances.reduce((sum, b) => sum + b.solde, 0), [balances]);

  return { balances, totalBalance };
};

// === RAPPORTS ===
export const useReports = () => {
  const salesByClient = useMemo(() => {
    return clients.map(client => {
      const history = clientSalesHistory[client.id] || [];
      const totalRevenue = history.reduce((sum, m) => sum + m.revenue, 0);
      const totalMargin = history.reduce((sum, m) => sum + m.margin, 0);
      const totalOrders = history.reduce((sum, m) => sum + m.orders, 0);
      return { ...client, totalRevenue, totalMargin, totalOrders };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, []);

  const salesByProduct = useMemo(() => {
    // Simulation basée sur les commandes
    const productSales = {};
    orders.forEach(order => {
      order.articles.forEach(article => {
        if (!productSales[article.productId]) {
          const product = getProductById(article.productId);
          productSales[article.productId] = {
            ...product,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0
          };
        }
        productSales[article.productId].totalQuantity += article.quantite;
        productSales[article.productId].totalRevenue += article.total;
        productSales[article.productId].orderCount += 1;
      });
    });
    return Object.values(productSales).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, []);

  const salesByCategory = useMemo(() => {
    const catSales = {};
    products.forEach(product => {
      if (!catSales[product.category]) {
        const cat = categories.products.find(c => c.id === product.category);
        catSales[product.category] = {
          id: product.category,
          name: cat?.name || product.category,
          color: cat?.color || '#6b7280',
          productCount: 0,
          stockValue: 0
        };
      }
      catSales[product.category].productCount += 1;
      catSales[product.category].stockValue += product.stock * product.prixVente;
    });
    return Object.values(catSales);
  }, []);

  return { salesByClient, salesByProduct, salesByCategory };
};

// Export all
export default {
  useNavigation,
  useDebounce,
  useFormatters,
  useClients,
  useSuppliers,
  useProducts,
  useOrders,
  useInvoices,
  usePurchaseInvoices,
  usePurchaseOrders,
  usePayments,
  useFinancials,
  useClientFinancialAnalysis,
  useNotifications,
  useAlerts,
  useClientBalances,
  useSupplierBalances,
  useReports
};

// PWA Hooks
export { useServiceWorker, useOfflineStorage, usePushNotifications } from './useServiceWorker';
