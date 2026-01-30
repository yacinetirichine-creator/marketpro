// ============================================
// MARKET PRO - APPLICATION PRINCIPALE
// Version Production avec sécurité complète
// ============================================

import React, { useState, useCallback, useMemo, lazy, Suspense, createContext, useContext } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, PermissionGuard } from './components/security/Guards';
import { PERMISSIONS, ROLE_NAVIGATION } from './data/roles';
import { OfflineIndicator, UpdateNotification, InstallPrompt } from './components/PWAComponents';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './styles/globals.css';

// Lazy loading pour performances optimales
const Dashboard = lazy(() => import('./components/Dashboard'));
const StocksPage = lazy(() => import('./components/StocksPage'));
const OrdersPage = lazy(() => import('./components/OrdersPage'));
const InvoicesPage = lazy(() => import('./components/InvoicesPage'));
const ClientsPage = lazy(() => import('./components/ClientsPage'));
const FinancialAnalytics = lazy(() => import('./components/FinancialAnalytics'));
const SuppliersPage = lazy(() => import('./components/SuppliersPage'));
const PurchasesPage = lazy(() => import('./components/PurchasesPage'));
const PaymentsPage = lazy(() => import('./components/PaymentsPage'));
const ReportsPage = lazy(() => import('./components/ReportsPage'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ScannerPage = lazy(() => import('./components/ScannerPage'));
const ClientPortal = lazy(() => import('./components/ClientPortal'));
const UsersManagementPage = lazy(() => import('./components/UsersManagementPage'));
const WMSPage = lazy(() => import('./components/WMSPage'));

// Context pour state global de l'application
const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// Loader performant
const PageLoader = () => (
  <div className="page-loader">
    <div className="loader-spinner"></div>
    <p>Chargement...</p>
  </div>
);

// Configuration des pages avec permissions requises
const PAGES_CONFIG = {
  landing: { component: LandingPage, title: '', subtitle: '', showLayout: false, public: true },
  login: { component: LoginPage, title: '', subtitle: '', showLayout: false, public: true },
  dashboard: { component: Dashboard, title: 'Tableau de bord', subtitle: 'Vue d\'ensemble de votre activité', permission: PERMISSIONS.VIEW_DASHBOARD },
  stocks: { component: StocksPage, title: 'Gestion des stocks', subtitle: 'Inventaire et mouvements', permission: PERMISSIONS.VIEW_PRODUCTS },
  orders: { component: OrdersPage, title: 'Commandes', subtitle: 'Gestion des commandes clients', permission: PERMISSIONS.VIEW_ORDERS },
  invoices: { component: InvoicesPage, title: 'Facturation', subtitle: 'Factures et règlements', permission: PERMISSIONS.VIEW_INVOICES },
  clients: { component: ClientsPage, title: 'Clients', subtitle: 'Gestion de la clientèle', permission: PERMISSIONS.VIEW_CLIENTS },
  analytics: { component: FinancialAnalytics, title: 'Analyse financière', subtitle: 'Performance et prédictions', permission: PERMISSIONS.VIEW_ANALYTICS },
  suppliers: { component: SuppliersPage, title: 'Fournisseurs', subtitle: 'Gestion des fournisseurs', permission: PERMISSIONS.VIEW_SUPPLIERS },
  purchases: { component: PurchasesPage, title: 'Achats', subtitle: 'Commandes fournisseurs', permission: PERMISSIONS.VIEW_PURCHASES },
  payments: { component: PaymentsPage, title: 'Règlements', subtitle: 'Suivi des paiements', permission: PERMISSIONS.VIEW_PAYMENTS },
  reports: { component: ReportsPage, title: 'Rapports', subtitle: 'Statistiques et exports', permission: PERMISSIONS.VIEW_REPORTS },
  settings: { component: SettingsPage, title: 'Paramètres', subtitle: 'Configuration du système', permission: PERMISSIONS.VIEW_SETTINGS },
  scanner: { component: ScannerPage, title: 'Scanner / Douchette', subtitle: 'Scan codes-barres et OCR', permission: PERMISSIONS.USE_SCANNER },
  users: { component: UsersManagementPage, title: 'Utilisateurs', subtitle: 'Gestion des équipes et rôles', permission: PERMISSIONS.MANAGE_USERS },
  wms: { component: WMSPage, title: 'WMS - Logistique', subtitle: 'Gestion entrepôt et préparation', permission: PERMISSIONS.MANAGE_STOCK },
  'client-portal': { component: ClientPortal, title: '', subtitle: '', showLayout: false, permission: PERMISSIONS.CLIENT_VIEW_ORDERS },
};

// Composant principal avec authentification
function AppContent() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Stock bas: Filet de bœuf', time: '5 min', read: false },
    { id: 2, type: 'info', message: 'Nouvelle commande #CMD-2024-156', time: '12 min', read: false },
    { id: 3, type: 'danger', message: 'Facture impayée: FAC-2024-089', time: '1h', read: false },
    { id: 4, type: 'success', message: 'Livraison confirmée #LIV-847', time: '2h', read: true },
  ]);

  // Auth context
  const { 
    isAuthenticated, 
    user, 
    logout, 
    checkPageAccess,
    getAccessiblePages,
    logSecurityEvent,
    isLoading: authLoading
  } = useAuth();

  // Navigation sécurisée
  const navigate = useCallback((page) => {
    const pageConfig = PAGES_CONFIG[page];
    
    // Pages publiques (landing et login)
    if (pageConfig?.public) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
      return;
    }

    // Vérification de l'authentification
    if (!isAuthenticated) {
      logSecurityEvent?.('UNAUTHORIZED_ACCESS_ATTEMPT', { page });
      setCurrentPage('login');
      return;
    }

    // Vérification des permissions
    if (pageConfig?.permission && !checkPageAccess?.(page)) {
      logSecurityEvent?.('PERMISSION_DENIED', { page, user: user?.id });
      const accessiblePages = getAccessiblePages?.() || ['dashboard'];
      if (accessiblePages.length > 0) {
        setCurrentPage(accessiblePages[0]);
      }
      return;
    }

    setCurrentPage(page);
    window.scrollTo(0, 0);
    logSecurityEvent?.('PAGE_NAVIGATION', { page, user: user?.id });
  }, [isAuthenticated, user, checkPageAccess, getAccessiblePages, logSecurityEvent]);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // Close mobile menu
  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Marquer notification comme lue
  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Marquer toutes comme lues
  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Compteur notifications non lues
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  // Déconnexion sécurisée
  const handleLogout = useCallback(() => {
    logout?.('user_action');
    setCurrentPage('landing');
  }, [logout]);

  // Callback après connexion réussie
  const handleLoginSuccess = useCallback((authenticatedUser) => {
    const accessiblePages = ROLE_NAVIGATION[authenticatedUser.role] || ['dashboard'];
    const targetPage = accessiblePages[0] || 'dashboard';
    setCurrentPage(targetPage);
  }, []);

  // Context value memoizé
  const contextValue = useMemo(() => ({
    currentPage,
    navigate,
    globalSearch,
    setGlobalSearch,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    sidebarCollapsed,
    toggleSidebar,
    mobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    handleLogout,
    user,
    isAuthenticated,
  }), [
    currentPage, navigate, globalSearch, notifications, 
    unreadCount, markNotificationRead, markAllNotificationsRead,
    sidebarCollapsed, toggleSidebar, mobileMenuOpen, toggleMobileMenu, closeMobileMenu,
    handleLogout, user, isAuthenticated
  ]);

  // Configuration page actuelle
  const pageConfig = PAGES_CONFIG[currentPage] || PAGES_CONFIG.dashboard;
  const PageComponent = pageConfig.component;

  // Chargement de l'authentification
  if (authLoading) {
    return <PageLoader />;
  }

  // Page de landing (publique)
  if (currentPage === 'landing') {
    return (
      <AppContext.Provider value={contextValue}>
        <Suspense fallback={<PageLoader />}>
          <LandingPage onEnter={() => navigate(isAuthenticated ? 'dashboard' : 'login')} />
        </Suspense>
      </AppContext.Provider>
    );
  }

  // Page de login (publique)
  if (currentPage === 'login') {
    if (isAuthenticated) {
      navigate('dashboard');
      return <PageLoader />;
    }
    return (
      <AppContext.Provider value={contextValue}>
        <Suspense fallback={<PageLoader />}>
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        </Suspense>
      </AppContext.Provider>
    );
  }

  // Portail client (layout spécifique)
  if (currentPage === 'client-portal') {
    return (
      <AppContext.Provider value={contextValue}>
        <ProtectedRoute fallback={<Suspense fallback={<PageLoader />}><LoginPage onLoginSuccess={handleLoginSuccess} /></Suspense>}>
          <Suspense fallback={<PageLoader />}>
            <ClientPortal />
          </Suspense>
        </ProtectedRoute>
      </AppContext.Provider>
    );
  }

  // Pages protégées avec layout principal
  return (
    <AppContext.Provider value={contextValue}>
      <ProtectedRoute fallback={<Suspense fallback={<PageLoader />}><LoginPage onLoginSuccess={handleLoginSuccess} /></Suspense>}>
        <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {/* Mobile overlay */}
          <div 
            className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
            onClick={closeMobileMenu}
          />
          
          <Sidebar 
            currentPage={currentPage} 
            onNavigate={(page) => { navigate(page); closeMobileMenu(); }}
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            mobileOpen={mobileMenuOpen}
            onMobileClose={closeMobileMenu}
            user={user}
            onLogout={handleLogout}
          />
          
          <main className="main-content">
            <Header 
              title={pageConfig.title}
              subtitle={pageConfig.subtitle}
              searchValue={globalSearch}
              onSearchChange={setGlobalSearch}
              notifications={notifications}
              unreadCount={unreadCount}
              onNotificationRead={markNotificationRead}
              onMarkAllRead={markAllNotificationsRead}
              user={user}
              onLogout={handleLogout}
              onMobileMenuToggle={toggleMobileMenu}
              mobileMenuOpen={mobileMenuOpen}
            />
            
            <div className="page-content">
              {pageConfig.permission ? (
                <PermissionGuard permission={pageConfig.permission}>
                  <Suspense fallback={<PageLoader />}>
                    <PageComponent />
                  </Suspense>
                </PermissionGuard>
              ) : (
                <Suspense fallback={<PageLoader />}>
                  <PageComponent />
                </Suspense>
              )}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </AppContext.Provider>
  );
}

// App wrapper avec AuthProvider et PWA
function App() {
  return (
    <AuthProvider>
      <AppContent />
      {/* PWA Components */}
      <OfflineIndicator />
      <UpdateNotification />
      <InstallPrompt />
    </AuthProvider>
  );
}

export default App;
