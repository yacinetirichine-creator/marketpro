import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, FileText, Users, 
  TrendingUp, Truck, CreditCard, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Menu,
  PlusCircle, Search, Receipt, Wallet, ClipboardList, Building2,
  PackagePlus, FileSearch, UserPlus, UserCircle2, Star, Archive,
  Calculator, Printer, AlertCircle, Scan, Shield, Warehouse
} from 'lucide-react';

const Sidebar = ({ currentPage, onNavigate, collapsed, onToggle, user, onLogout }) => {
  const [expandedMenus, setExpandedMenus] = useState(['ventes', 'clients', 'achats']);

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(m => m !== menuId)
        : [...prev, menuId]
    );
  };

  const menuItems = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      label: 'Tableau de bord',
      page: 'dashboard'
    },
    {
      id: 'ventes',
      icon: ShoppingCart,
      label: 'Ventes',
      children: [
        { id: 'new-sale', icon: PlusCircle, label: 'Nouvelle Vente', page: 'orders', action: 'new' },
        { id: 'search-sale', icon: Search, label: 'Recherche Vente', page: 'orders' },
        { id: 'unpaid-invoices', icon: AlertCircle, label: 'Factures non soldées', page: 'invoices', filter: 'unpaid' },
        { id: 'sales-report', icon: BarChart3, label: 'Rapport des ventes', page: 'reports', filter: 'sales' },
        { id: 'sales-details', icon: FileSearch, label: 'Détails des Ventes', page: 'orders', view: 'details' },
      ]
    },
    {
      id: 'clients',
      icon: Users,
      label: 'Clients',
      children: [
        { id: 'search-client', icon: UserCircle2, label: 'Recherche Client', page: 'clients' },
        { id: 'new-client', icon: UserPlus, label: 'Nouveau Client', page: 'clients', action: 'new' },
        { id: 'client-accounts', icon: Wallet, label: 'Comptes clients', page: 'clients', view: 'accounts' },
        { id: 'payment-status', icon: CreditCard, label: 'États de Paiements', page: 'payments', filter: 'clients' },
        { id: 'client-balances', icon: Calculator, label: 'Soldes clients', page: 'clients', view: 'balances' },
      ]
    },
    {
      id: 'stocks',
      icon: Package,
      label: 'Produits & Stocks',
      children: [
        { id: 'new-product', icon: PackagePlus, label: 'Nouveau Produit', page: 'stocks', action: 'new' },
        { id: 'search-product', icon: Search, label: 'Recherche Produit', page: 'stocks' },
        { id: 'inventory', icon: ClipboardList, label: 'Inventaire', page: 'stocks', view: 'inventory' },
        { id: 'stock-movements', icon: Archive, label: 'Mouvements', page: 'stocks', view: 'movements' },
      ]
    },
    {
      id: 'achats',
      icon: Truck,
      label: 'Achats',
      children: [
        { id: 'new-purchase', icon: PlusCircle, label: 'Nouvel Achat', page: 'purchases', action: 'new' },
        { id: 'search-purchase', icon: Search, label: 'Recherche Achat', page: 'purchases' },
        { id: 'unpaid-purchases', icon: AlertCircle, label: 'Factures non soldées', page: 'purchases', filter: 'unpaid' },
        { id: 'purchase-list', icon: Printer, label: 'Liste factures achat', page: 'purchases', view: 'list' },
      ]
    },
    {
      id: 'fournisseurs',
      icon: Building2,
      label: 'Fournisseurs',
      children: [
        { id: 'new-supplier', icon: PlusCircle, label: 'Nouveau Fournisseur', page: 'suppliers', action: 'new' },
        { id: 'search-supplier', icon: Search, label: 'Recherche Fournisseur', page: 'suppliers' },
        { id: 'supplier-balances', icon: Calculator, label: 'Soldes fournisseurs', page: 'suppliers', view: 'balances' },
      ]
    },
    {
      id: 'invoices',
      icon: FileText,
      label: 'Facturation',
      page: 'invoices'
    },
    {
      id: 'payments',
      icon: CreditCard,
      label: 'Règlements',
      page: 'payments'
    },
    {
      id: 'analytics',
      icon: TrendingUp,
      label: 'Analyse financière',
      page: 'analytics'
    },
    {
      id: 'scanner',
      icon: Scan,
      label: 'Scanner / Douchette',
      page: 'scanner'
    },
    {
      id: 'wms',
      icon: Warehouse,
      label: 'WMS - Logistique',
      page: 'wms'
    },
    {
      id: 'reports',
      icon: BarChart3,
      label: 'Rapports',
      page: 'reports'
    },
    {
      id: 'users',
      icon: Shield,
      label: 'Utilisateurs',
      page: 'users'
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Paramètres',
      page: 'settings'
    }
  ];

  const isActive = (item) => {
    if (item.page === currentPage) return true;
    if (item.children) {
      return item.children.some(child => child.page === currentPage);
    }
    return false;
  };

  const handleItemClick = (item) => {
    if (item.children) {
      toggleMenu(item.id);
    } else if (item.page) {
      onNavigate(item.page);
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <div className="logo" onClick={() => onNavigate('landing')}>
          <div className="logo-icon">
            <Package size={collapsed ? 24 : 28} />
          </div>
          {!collapsed && (
            <div className="logo-text">
              <span className="logo-name">Market Pro</span>
              <span className="logo-version">v2.0</span>
            </div>
          )}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Favoris */}
      {!collapsed && (
        <div className="sidebar-favorites">
          <div className="favorites-header">
            <Star size={14} />
            <span>Favoris</span>
          </div>
          <div className="favorites-list">
            <button onClick={() => onNavigate('orders')} className="favorite-item">
              <PlusCircle size={14} />
              <span>Nouvelle Vente</span>
            </button>
            <button onClick={() => onNavigate('clients')} className="favorite-item">
              <UserCircle2 size={14} />
              <span>Recherche Client</span>
            </button>
            <button onClick={() => onNavigate('stocks')} className="favorite-item">
              <Search size={14} />
              <span>Recherche Produit</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <div key={item.id} className="nav-group">
            <button
              className={`nav-item ${isActive(item) ? 'active' : ''} ${item.children ? 'has-children' : ''}`}
              onClick={() => handleItemClick(item)}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className="nav-icon" />
              {!collapsed && (
                <>
                  <span className="nav-label">{item.label}</span>
                  {item.children && (
                    <span className="nav-arrow">
                      {expandedMenus.includes(item.id) ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </span>
                  )}
                </>
              )}
            </button>
            
            {/* Sous-menu */}
            {!collapsed && item.children && expandedMenus.includes(item.id) && (
              <div className="nav-submenu">
                {item.children.map(child => (
                  <button
                    key={child.id}
                    className={`nav-subitem ${child.page === currentPage ? 'active' : ''}`}
                    onClick={() => onNavigate(child.page)}
                  >
                    <child.icon size={16} className="nav-icon" />
                    <span>{child.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <span>{user ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}` : 'U'}</span>
          </div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-name">{user ? `${user.firstName} ${user.lastName?.charAt(0)}.` : 'Utilisateur'}</span>
              <span className="user-role">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Invité'}</span>
            </div>
          )}
        </div>
        {!collapsed && (
          <button className="logout-btn" onClick={onLogout || (() => onNavigate('landing'))} title="Déconnexion">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
