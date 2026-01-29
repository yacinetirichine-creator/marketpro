// ============================================
// MARKET PRO - CONTEXT D'AUTHENTIFICATION
// Gestion sécurisée de l'authentification
// ============================================

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ROLES, ROLE_PERMISSIONS, ROLE_NAVIGATION, 
  authenticateUser, hasPermission, canAccessPage 
} from '../data/roles';
import { securityService } from '../utils/security';

// Context
const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Constantes de sécurité
const AUTH_CONFIG = {
  TOKEN_KEY: 'market_pro_token',
  USER_KEY: 'market_pro_user',
  SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 heures
  REFRESH_THRESHOLD: 30 * 60 * 1000, // 30 minutes avant expiration
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
};

// Provider d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // === INITIALISATION ===
  useEffect(() => {
    initializeAuth();
  }, []);

  // === SURVEILLANCE D'ACTIVITÉ ===
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      setLastActivity(Date.now());
      extendSession();
    };

    // Événements d'activité utilisateur
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Vérification périodique de la session
    const sessionCheck = setInterval(checkSession, 60000); // Toutes les minutes

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(sessionCheck);
    };
  }, [isAuthenticated]);

  // === FONCTIONS D'AUTHENTIFICATION ===

  // Initialiser l'authentification depuis le stockage
  const initializeAuth = useCallback(() => {
    try {
      const storedToken = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      const storedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY);

      if (storedToken && storedUser) {
        const tokenData = securityService.verifyToken(storedToken);
        
        if (tokenData && tokenData.expiry > Date.now()) {
          const userData = JSON.parse(securityService.decrypt(storedUser));
          setUser(userData);
          setIsAuthenticated(true);
          setSessionExpiry(tokenData.expiry);
          
          // Log de l'activité
          logSecurityEvent('SESSION_RESTORED', { userId: userData.id });
        } else {
          // Token expiré, nettoyage
          clearAuthData();
          logSecurityEvent('SESSION_EXPIRED', { reason: 'token_expired' });
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuthData();
      logSecurityEvent('AUTH_ERROR', { error: error.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connexion
  const login = useCallback(async (email, password, rememberMe = false) => {
    // Vérification du verrouillage
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 60000);
      throw new Error(`Compte verrouillé. Réessayez dans ${remainingTime} minutes.`);
    }

    // Validation des entrées
    const sanitizedEmail = securityService.sanitizeInput(email);
    if (!securityService.validateEmail(sanitizedEmail)) {
      throw new Error('Format d\'email invalide');
    }

    try {
      // Authentification
      const authenticatedUser = authenticateUser(sanitizedEmail, password);
      
      if (!authenticatedUser) {
        // Échec de connexion
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        logSecurityEvent('LOGIN_FAILED', { email: sanitizedEmail, attempts: newAttempts });
        
        if (newAttempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
          const lockoutTime = Date.now() + AUTH_CONFIG.LOCKOUT_DURATION;
          setLockoutUntil(lockoutTime);
          logSecurityEvent('ACCOUNT_LOCKED', { email: sanitizedEmail, until: lockoutTime });
          throw new Error('Trop de tentatives échouées. Compte temporairement verrouillé.');
        }
        
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérification du compte actif
      if (!authenticatedUser.active) {
        logSecurityEvent('LOGIN_INACTIVE_ACCOUNT', { userId: authenticatedUser.id });
        throw new Error('Ce compte est désactivé. Contactez l\'administrateur.');
      }

      // Création de la session
      const sessionDuration = rememberMe ? AUTH_CONFIG.SESSION_DURATION * 7 : AUTH_CONFIG.SESSION_DURATION;
      const expiry = Date.now() + sessionDuration;
      
      const token = securityService.generateToken({
        userId: authenticatedUser.id,
        role: authenticatedUser.role,
        expiry
      });

      // Stockage sécurisé
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, securityService.encrypt(JSON.stringify(authenticatedUser)));
      
      // Mise à jour de l'état
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      setSessionExpiry(expiry);
      setLoginAttempts(0);
      setLockoutUntil(null);
      setLastActivity(Date.now());
      
      logSecurityEvent('LOGIN_SUCCESS', { 
        userId: authenticatedUser.id, 
        role: authenticatedUser.role,
        rememberMe 
      });
      
      return authenticatedUser;
    } catch (error) {
      throw error;
    }
  }, [loginAttempts, lockoutUntil]);

  // Déconnexion
  const logout = useCallback((reason = 'user_action') => {
    const userId = user?.id;
    
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    setSessionExpiry(null);
    
    logSecurityEvent('LOGOUT', { userId, reason });
  }, [user]);

  // Vérification de session
  const checkSession = useCallback(() => {
    if (!sessionExpiry) return;
    
    const now = Date.now();
    
    // Session expirée
    if (now >= sessionExpiry) {
      logout('session_expired');
      return false;
    }
    
    // Inactivité prolongée (30 minutes sans activité)
    if (now - lastActivity > 30 * 60 * 1000) {
      logout('inactivity');
      return false;
    }
    
    return true;
  }, [sessionExpiry, lastActivity, logout]);

  // Extension de session
  const extendSession = useCallback(() => {
    if (!sessionExpiry || !isAuthenticated) return;
    
    const now = Date.now();
    const timeToExpiry = sessionExpiry - now;
    
    // Étendre si proche de l'expiration
    if (timeToExpiry < AUTH_CONFIG.REFRESH_THRESHOLD) {
      const newExpiry = now + AUTH_CONFIG.SESSION_DURATION;
      setSessionExpiry(newExpiry);
      
      // Mise à jour du token
      const newToken = securityService.generateToken({
        userId: user.id,
        role: user.role,
        expiry: newExpiry
      });
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, newToken);
      
      logSecurityEvent('SESSION_EXTENDED', { userId: user.id });
    }
  }, [sessionExpiry, isAuthenticated, user]);

  // Nettoyage des données d'auth
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    sessionStorage.clear();
  }, []);

  // === FONCTIONS DE PERMISSIONS ===

  // Vérifier une permission
  const checkPermission = useCallback((permission) => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  }, [user]);

  // Vérifier l'accès à une page
  const checkPageAccess = useCallback((page) => {
    if (!user) return false;
    return canAccessPage(user.role, page);
  }, [user]);

  // Obtenir les pages accessibles
  const getAccessiblePages = useCallback(() => {
    if (!user) return [];
    return ROLE_NAVIGATION[user.role] || [];
  }, [user]);

  // Obtenir les permissions
  const getPermissions = useCallback(() => {
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role] || [];
  }, [user]);

  // === FONCTIONS DE MISE À JOUR PROFIL ===

  // Mettre à jour le profil
  const updateProfile = useCallback((updates) => {
    if (!user) return;
    
    // Sanitize les entrées
    const sanitizedUpdates = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (typeof value === 'string') {
        sanitizedUpdates[key] = securityService.sanitizeInput(value);
      } else {
        sanitizedUpdates[key] = value;
      }
    });
    
    const updatedUser = { ...user, ...sanitizedUpdates };
    setUser(updatedUser);
    
    // Mise à jour du stockage
    localStorage.setItem(AUTH_CONFIG.USER_KEY, securityService.encrypt(JSON.stringify(updatedUser)));
    
    logSecurityEvent('PROFILE_UPDATED', { userId: user.id, fields: Object.keys(sanitizedUpdates) });
  }, [user]);

  // Changer le mot de passe
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!user) throw new Error('Non authentifié');
    
    // Validation du nouveau mot de passe
    const passwordValidation = securityService.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }
    
    // Vérification du mot de passe actuel (simulation)
    const verifiedUser = authenticateUser(user.email, currentPassword);
    if (!verifiedUser) {
      logSecurityEvent('PASSWORD_CHANGE_FAILED', { userId: user.id, reason: 'wrong_current_password' });
      throw new Error('Mot de passe actuel incorrect');
    }
    
    // Ici, appel API pour changer le mot de passe
    // En mode mock, on simule le succès
    
    logSecurityEvent('PASSWORD_CHANGED', { userId: user.id });
    
    // Force la reconnexion
    logout('password_changed');
    
    return true;
  }, [user, logout]);

  // === LOGGING DE SÉCURITÉ ===
  const logSecurityEvent = useCallback((event, data = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data,
      userAgent: navigator.userAgent,
      ip: 'client-side' // En production, récupéré côté serveur
    };
    
    // En développement, afficher dans la console
    if (process.env.NODE_ENV === 'development') {
      console.log('[Security]', logEntry);
    }
    
    // En production, envoyer à un service de logging
    // securityService.logEvent(logEntry);
    
    // Stocker localement les derniers événements
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(logEntry);
    // Garder seulement les 100 derniers
    if (logs.length > 100) logs.shift();
    localStorage.setItem('security_logs', JSON.stringify(logs));
  }, []);

  // === VALEUR DU CONTEXT ===
  const contextValue = useMemo(() => ({
    // État
    user,
    isAuthenticated,
    isLoading,
    sessionExpiry,
    
    // Actions d'authentification
    login,
    logout,
    checkSession,
    
    // Permissions
    checkPermission,
    checkPageAccess,
    getAccessiblePages,
    getPermissions,
    hasRole: (role) => user?.role === role,
    isAdmin: user?.role === ROLES.ADMIN,
    
    // Profil
    updateProfile,
    changePassword,
    
    // Utilitaires
    logSecurityEvent,
  }), [
    user, isAuthenticated, isLoading, sessionExpiry,
    login, logout, checkSession,
    checkPermission, checkPageAccess, getAccessiblePages, getPermissions,
    updateProfile, changePassword, logSecurityEvent
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
