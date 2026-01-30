// ============================================
// MARKET PRO - Dashboard Router par Rôle
// Redirige vers le dashboard approprié selon le rôle
// ============================================

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../data/roles';

// Import des dashboards par rôle
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminDashboard from './AdminDashboard';
import LogisticsDashboard from './LogisticsDashboard';
import AccountingDashboard from './AccountingDashboard';
import OperatorDashboard from './OperatorDashboard';
import SalesDashboard from './SalesDashboard';
import CashierDashboard from './CashierDashboard';

/**
 * Composant principal qui route vers le dashboard approprié
 * selon le rôle de l'utilisateur connecté
 */
const RoleDashboard = () => {
  const { user } = useAuth();
  const userRole = user?.role;

  // Mapping des rôles vers les composants dashboard
  const dashboardComponents = {
    [ROLES.SUPER_ADMIN]: SuperAdminDashboard,
    [ROLES.ADMIN]: AdminDashboard,
    [ROLES.RESP_LOGISTIQUE]: LogisticsDashboard,
    [ROLES.RESP_COMPTABLE]: AccountingDashboard,
    [ROLES.LOGISTICIEN]: OperatorDashboard,
    [ROLES.MAGASINIER]: OperatorDashboard, // Utilise le même dashboard opérateur
    [ROLES.COMPTABLE]: AccountingDashboard, // Version simplifiée du dashboard comptable
    [ROLES.COMMERCIAL]: SalesDashboard,
    [ROLES.CAISSIER]: CashierDashboard
  };

  // Récupérer le composant dashboard approprié
  const DashboardComponent = dashboardComponents[userRole];

  if (!DashboardComponent) {
    // Fallback vers AdminDashboard si le rôle n'est pas reconnu
    return <AdminDashboard />;
  }

  return <DashboardComponent />;
};

// Export du composant principal
export default RoleDashboard;

// Exports nommés pour utilisation directe si nécessaire
export {
  SuperAdminDashboard,
  AdminDashboard,
  LogisticsDashboard,
  AccountingDashboard,
  OperatorDashboard,
  SalesDashboard,
  CashierDashboard
};
