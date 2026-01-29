// ============================================
// MARKET PRO - COMPOSANTS DE SÉCURITÉ
// Protection des routes et contrôle d'accès
// ============================================

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PERMISSIONS, ROLES } from '../../data/roles';
import { Shield, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';

// ============================================
// ROUTE PROTÉGÉE - Nécessite authentification
// ============================================
export const ProtectedRoute = ({ 
  children, 
  fallback = null,
  redirectTo = 'login'
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner"></div>
        <p>Vérification de l'authentification...</p>
        <style>{`
          .auth-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: var(--color-bg-primary);
            gap: 1rem;
          }
          .auth-loading-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid var(--color-border);
            border-top-color: var(--color-accent-primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          .auth-loading p {
            color: var(--color-text-secondary);
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Non authentifié
  if (!isAuthenticated) {
    return fallback || (
      <AccessDenied 
        type="auth"
        title="Authentification requise"
        message="Vous devez être connecté pour accéder à cette page."
        action={redirectTo}
      />
    );
  }

  return children;
};

// ============================================
// GARDE DE PERMISSION - Nécessite permission spécifique
// ============================================
export const PermissionGuard = ({ 
  permission,
  permissions = [],
  requireAll = false,
  children,
  fallback = null,
  showDenied = true
}) => {
  const { checkPermission, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return fallback;
  }

  // Vérification des permissions
  const permissionsToCheck = permission 
    ? [permission] 
    : permissions;

  let hasAccess = false;

  if (requireAll) {
    // Toutes les permissions requises
    hasAccess = permissionsToCheck.every(p => checkPermission(p));
  } else {
    // Au moins une permission
    hasAccess = permissionsToCheck.some(p => checkPermission(p));
  }

  if (!hasAccess) {
    if (showDenied) {
      return fallback || (
        <AccessDenied 
          type="permission"
          title="Accès refusé"
          message="Vous n'avez pas les permissions nécessaires pour cette action."
        />
      );
    }
    return null;
  }

  return children;
};

// ============================================
// GARDE DE RÔLE - Nécessite rôle spécifique
// ============================================
export const RoleGuard = ({ 
  role,
  roles = [],
  children,
  fallback = null,
  showDenied = true
}) => {
  const { hasRole, isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return fallback;
  }

  const rolesToCheck = role ? [role] : roles;
  const hasRequiredRole = rolesToCheck.some(r => hasRole(r));

  if (!hasRequiredRole) {
    if (showDenied) {
      return fallback || (
        <AccessDenied 
          type="role"
          title="Accès restreint"
          message={`Cette section est réservée aux rôles: ${rolesToCheck.join(', ')}`}
        />
      );
    }
    return null;
  }

  return children;
};

// ============================================
// GARDE ADMIN - Raccourci pour admin only
// ============================================
export const AdminOnly = ({ children, fallback = null, showDenied = false }) => {
  return (
    <RoleGuard 
      role={ROLES.ADMIN} 
      fallback={fallback} 
      showDenied={showDenied}
    >
      {children}
    </RoleGuard>
  );
};

// ============================================
// COMPOSANT CONDITIONNEL BASÉ SUR PERMISSION
// ============================================
export const Can = ({ 
  permission, 
  permissions = [],
  requireAll = false,
  yes,
  no = null 
}) => {
  const { checkPermission, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return no;
  }

  const permissionsToCheck = permission 
    ? [permission] 
    : permissions;

  let hasAccess = false;

  if (requireAll) {
    hasAccess = permissionsToCheck.every(p => checkPermission(p));
  } else {
    hasAccess = permissionsToCheck.some(p => checkPermission(p));
  }

  return hasAccess ? yes : no;
};

// ============================================
// BOUTON PROTÉGÉ - Désactivé sans permission
// ============================================
export const ProtectedButton = ({
  permission,
  permissions = [],
  requireAll = false,
  children,
  onClick,
  disabled = false,
  disabledTitle = "Vous n'avez pas la permission pour cette action",
  className = '',
  ...props
}) => {
  const { checkPermission, isAuthenticated } = useAuth();

  const permissionsToCheck = permission 
    ? [permission] 
    : permissions;

  let hasAccess = isAuthenticated;

  if (hasAccess && permissionsToCheck.length > 0) {
    if (requireAll) {
      hasAccess = permissionsToCheck.every(p => checkPermission(p));
    } else {
      hasAccess = permissionsToCheck.some(p => checkPermission(p));
    }
  }

  const isDisabled = disabled || !hasAccess;

  return (
    <button
      {...props}
      className={`${className} ${isDisabled ? 'disabled' : ''}`}
      onClick={hasAccess ? onClick : undefined}
      disabled={isDisabled}
      title={!hasAccess ? disabledTitle : props.title}
      style={{
        ...props.style,
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer'
      }}
    >
      {children}
    </button>
  );
};

// ============================================
// PAGE D'ACCÈS REFUSÉ
// ============================================
export const AccessDenied = ({ 
  type = 'permission',
  title = 'Accès refusé',
  message = "Vous n'avez pas les permissions nécessaires.",
  action = null,
  onBack = null
}) => {
  const icons = {
    auth: Lock,
    permission: Shield,
    role: AlertTriangle
  };
  
  const Icon = icons[type] || Shield;

  return (
    <div className="access-denied">
      <style>{`
        .access-denied {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          padding: 2rem;
          text-align: center;
        }

        .access-denied-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .access-denied-icon svg {
          color: var(--color-accent-danger);
        }

        .access-denied h2 {
          font-size: 1.5rem;
          margin: 0 0 0.75rem 0;
          color: var(--color-text-primary);
        }

        .access-denied p {
          color: var(--color-text-secondary);
          max-width: 400px;
          margin: 0 0 2rem 0;
        }

        .access-denied-actions {
          display: flex;
          gap: 1rem;
        }

        .access-denied-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .access-denied-btn-primary {
          background: var(--gradient-primary);
          border: none;
          color: var(--color-bg-primary);
        }

        .access-denied-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(0, 212, 170, 0.3);
        }

        .access-denied-btn-secondary {
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
        }

        .access-denied-btn-secondary:hover {
          border-color: var(--color-accent-primary);
          background: rgba(0, 212, 170, 0.05);
        }
      `}</style>

      <div className="access-denied-icon">
        <Icon size={40} />
      </div>
      
      <h2>{title}</h2>
      <p>{message}</p>

      <div className="access-denied-actions">
        {onBack && (
          <button 
            className="access-denied-btn access-denied-btn-secondary"
            onClick={onBack}
          >
            <ArrowLeft size={18} />
            Retour
          </button>
        )}
        {action && (
          <button 
            className="access-denied-btn access-denied-btn-primary"
            onClick={() => window.location.href = `/${action}`}
          >
            {type === 'auth' ? 'Se connecter' : 'Accueil'}
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// HOC - withAuth (pour class components)
// ============================================
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const auth = useAuth();
    
    if (!auth.isAuthenticated) {
      return <AccessDenied type="auth" />;
    }
    
    return <WrappedComponent {...props} auth={auth} />;
  };
};

// ============================================
// HOC - withPermission
// ============================================
export const withPermission = (permission) => (WrappedComponent) => {
  return function PermissionComponent(props) {
    const { checkPermission, isAuthenticated } = useAuth();
    
    if (!isAuthenticated || !checkPermission(permission)) {
      return <AccessDenied type="permission" />;
    }
    
    return <WrappedComponent {...props} />;
  };
};

// ============================================
// HOOK - usePermissions
// ============================================
export const usePermissions = () => {
  const { checkPermission, getPermissions, user } = useAuth();

  return {
    can: checkPermission,
    canAll: (permissions) => permissions.every(checkPermission),
    canAny: (permissions) => permissions.some(checkPermission),
    permissions: getPermissions(),
    role: user?.role,
    
    // Raccourcis courants
    canViewDashboard: checkPermission(PERMISSIONS.VIEW_DASHBOARD),
    canViewClients: checkPermission(PERMISSIONS.VIEW_CLIENTS),
    canEditClients: checkPermission(PERMISSIONS.EDIT_CLIENT),
    canViewProducts: checkPermission(PERMISSIONS.VIEW_PRODUCTS),
    canEditProducts: checkPermission(PERMISSIONS.EDIT_PRODUCT),
    canViewOrders: checkPermission(PERMISSIONS.VIEW_ORDERS),
    canCreateOrders: checkPermission(PERMISSIONS.CREATE_ORDER),
    canViewInvoices: checkPermission(PERMISSIONS.VIEW_INVOICES),
    canViewPayments: checkPermission(PERMISSIONS.VIEW_PAYMENTS),
    canManageUsers: checkPermission(PERMISSIONS.MANAGE_USERS),
    canViewReports: checkPermission(PERMISSIONS.VIEW_REPORTS),
    canExportReports: checkPermission(PERMISSIONS.EXPORT_REPORTS),
  };
};

export default {
  ProtectedRoute,
  PermissionGuard,
  RoleGuard,
  AdminOnly,
  Can,
  ProtectedButton,
  AccessDenied,
  withAuth,
  withPermission,
  usePermissions
};
