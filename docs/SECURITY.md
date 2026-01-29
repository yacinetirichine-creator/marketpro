# 🔐 Documentation de Sécurité - Market Pro

## Vue d'ensemble

Market Pro implémente une architecture de sécurité robuste et multi-couches pour protéger les données sensibles et garantir l'intégrité de l'application.

## 📋 Table des matières

1. [Architecture de sécurité](#architecture-de-sécurité)
2. [Authentification](#authentification)
3. [Autorisation (RBAC)](#autorisation-rbac)
4. [Protection des données](#protection-des-données)
5. [Audit et traçabilité](#audit-et-traçabilité)
6. [Bonnes pratiques](#bonnes-pratiques)
7. [Configuration production](#configuration-production)

---

## Architecture de sécurité

### Structure des fichiers de sécurité

```
src/
├── context/
│   └── AuthContext.jsx      # Contexte d'authentification global
├── components/
│   ├── security/
│   │   └── Guards.jsx       # Composants de protection des routes
│   └── forms/
│       └── SecureForms.jsx  # Formulaires sécurisés
├── utils/
│   ├── security.js          # Utilitaires de sécurité
│   └── audit.js             # Système d'audit
├── pages/
│   └── LoginPage.jsx        # Page de connexion sécurisée
├── config/
│   └── app.config.js        # Configuration centralisée
└── data/
    └── roles.js             # Définition des rôles et permissions
```

---

## Authentification

### Fonctionnalités

- **Login sécurisé** avec protection contre les attaques par force brute
- **Rate limiting** : 5 tentatives max, blocage de 15 minutes
- **Sessions** : 8h de validité, extension automatique sur activité
- **Tokens JWT-like** avec signature et expiration

### Utilisation

```jsx
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout,
    hasPermission 
  } = useAuth();

  // Vérifier l'authentification
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Vérifier une permission
  if (hasPermission('VIEW_DASHBOARD')) {
    // Accès autorisé
  }

  return <div>Contenu protégé</div>;
};
```

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@marketpro.fr | Admin123! |
| Manager | manager@marketpro.fr | Manager123! |
| Commercial | commercial@marketpro.fr | Commercial123! |
| Caissier | caissier@marketpro.fr | Caissier123! |
| Magasinier | magasinier@marketpro.fr | Magasinier123! |
| Comptable | comptable@marketpro.fr | Comptable123! |
| Client | client@marketpro.fr | Client123! |

---

## Autorisation (RBAC)

### Rôles disponibles

| Rôle | Description | Niveau d'accès |
|------|-------------|----------------|
| `ADMIN` | Administrateur système | Accès total |
| `MANAGER` | Responsable | Accès étendu |
| `COMMERCIAL` | Commercial | Ventes & Clients |
| `CAISSIER` | Caissier | Paiements & Ventes |
| `MAGASINIER` | Magasinier | Stock & WMS |
| `COMPTABLE` | Comptable | Finances |
| `CLIENT` | Client | Portail client |

### Permissions

Le système utilise un modèle de permissions granulaires :

```javascript
const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  
  // Stocks
  VIEW_STOCKS: 'view_stocks',
  MANAGE_STOCKS: 'manage_stocks',
  
  // Commandes
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDERS: 'create_orders',
  VALIDATE_ORDERS: 'validate_orders',
  
  // Factures
  VIEW_INVOICES: 'view_invoices',
  CREATE_INVOICES: 'create_invoices',
  
  // Paiements
  VIEW_PAYMENTS: 'view_payments',
  PROCESS_PAYMENTS: 'process_payments',
  
  // Clients
  VIEW_CLIENTS: 'view_clients',
  MANAGE_CLIENTS: 'manage_clients',
  
  // Fournisseurs
  VIEW_SUPPLIERS: 'view_suppliers',
  MANAGE_SUPPLIERS: 'manage_suppliers',
  
  // WMS
  VIEW_WMS: 'view_wms',
  MANAGE_WMS: 'manage_wms',
  
  // Achats
  VIEW_PURCHASES: 'view_purchases',
  CREATE_PURCHASES: 'create_purchases',
  
  // Rapports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  
  // Paramètres
  VIEW_SETTINGS: 'view_settings',
  MANAGE_SETTINGS: 'manage_settings',
  
  // Utilisateurs
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users'
};
```

### Protection des routes

```jsx
import { ProtectedRoute, PermissionGuard, RoleGuard } from '../components/security/Guards';

// Route protégée (authentification requise)
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Protection par permission
<PermissionGuard permission="MANAGE_STOCKS">
  <StocksPage />
</PermissionGuard>

// Protection par rôle
<RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
  <SettingsPage />
</RoleGuard>

// Protection conditionnelle
<Can permission="DELETE_ORDERS">
  <button>Supprimer</button>
</Can>
```

---

## Protection des données

### Validation des entrées

```javascript
import { validators, sanitize, useFormValidation } from '../utils/security';

// Validation email
validators.email('test@example.com'); // true/false

// Validation mot de passe sécurisé
validators.securePassword('MyPassword123!'); // true/false

// Validation SIRET
validators.siret('12345678901234'); // true/false

// Validation IBAN
validators.iban('FR7612345678901234567890189'); // true/false

// Sanitisation (protection XSS)
const safeInput = sanitize.text('<script>alert("xss")</script>');
// Résultat: "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"

// Hook de validation de formulaire
const { values, errors, handleChange, validate } = useFormValidation(
  { email: '', password: '' },
  {
    email: (v) => validators.email(v) || 'Email invalide',
    password: (v) => validators.securePassword(v) || 'Mot de passe trop faible'
  }
);
```

### Chiffrement

```javascript
import { encrypt, decrypt, hashPassword } from '../utils/security';

// Chiffrement de données sensibles
const encrypted = encrypt('données sensibles', 'clé-secrète');

// Déchiffrement
const decrypted = decrypt(encrypted, 'clé-secrète');

// Hachage de mot de passe (SHA-256)
const hashedPassword = await hashPassword('monMotDePasse');
```

### Protection CSRF

```javascript
import { generateCSRFToken } from '../utils/security';
import { SecureForm } from '../components/forms/SecureForms';

// Génération de token CSRF
const csrfToken = generateCSRFToken();

// Formulaire avec protection CSRF automatique
<SecureForm onSubmit={handleSubmit}>
  {/* Les champs du formulaire */}
</SecureForm>
```

### Masquage des données

```javascript
import { maskData } from '../utils/security';

maskData.email('john.doe@example.com');  // j***@e***
maskData.phone('0612345678');            // 06****78
maskData.iban('FR7612345678901234567890189'); // FR76****0189
maskData.creditCard('4111111111111111'); // ****1111
```

---

## Audit et traçabilité

### Types d'événements

| Catégorie | Événements |
|-----------|------------|
| **Auth** | LOGIN, LOGOUT, LOGIN_FAILED, SESSION_EXPIRED |
| **Data** | CREATE, UPDATE, DELETE, EXPORT |
| **Security** | PERMISSION_DENIED, RATE_LIMIT, SUSPICIOUS_ACTIVITY |
| **System** | ERROR, CONFIG_CHANGE, BACKUP |

### Utilisation

```javascript
import { auditLog, AUDIT_EVENTS, SEVERITY } from '../utils/audit';

// Logger un événement
auditLog.log({
  eventType: AUDIT_EVENTS.DATA_CREATE,
  severity: SEVERITY.INFO,
  userId: currentUser.id,
  resource: 'orders',
  resourceId: 'ORD-2024-001',
  details: { amount: 1500, items: 5 },
  ipAddress: '192.168.1.1'
});

// Récupérer les logs
const logs = auditLog.getLogs({
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
  eventType: AUDIT_EVENTS.AUTH_LOGIN,
  userId: 'user-123'
});

// Exporter les logs
const csvData = auditLog.export(logs, 'csv');

// Statistiques
const stats = auditLog.getStatistics();
```

---

## Bonnes pratiques

### ✅ À faire

1. **Toujours valider les entrées utilisateur** côté client ET serveur
2. **Utiliser les formulaires sécurisés** (`SecureForms.jsx`)
3. **Vérifier les permissions** avant chaque action sensible
4. **Logger les actions importantes** dans l'audit trail
5. **Utiliser HTTPS** en production
6. **Implémenter le rate limiting** sur les endpoints sensibles
7. **Chiffrer les données sensibles** au repos et en transit
8. **Utiliser des tokens avec expiration** courte
9. **Implémenter la déconnexion automatique** après inactivité

### ❌ À éviter

1. Stocker des mots de passe en clair
2. Exposer des données sensibles dans les URLs
3. Faire confiance aux données côté client
4. Ignorer les erreurs de validation
5. Désactiver la protection CSRF
6. Utiliser des tokens sans expiration
7. Logger des données sensibles (mots de passe, tokens)

---

## Configuration production

### Variables d'environnement

Créez un fichier `.env.production` :

```env
# API
REACT_APP_API_URL=https://api.marketpro.fr

# Sécurité
REACT_APP_SESSION_DURATION=28800000
REACT_APP_ENCRYPTION_KEY=votre-cle-secrete-32-caracteres

# Features
REACT_APP_ENABLE_2FA=true
REACT_APP_AUDIT_RETENTION_DAYS=90

# Analytics (optionnel)
REACT_APP_ANALYTICS_ID=UA-XXXXXXXX-X
```

### Checklist de déploiement

- [ ] Activer HTTPS sur tous les endpoints
- [ ] Configurer les headers de sécurité (CSP, X-Frame-Options, etc.)
- [ ] Mettre à jour les clés de chiffrement
- [ ] Configurer le rate limiting côté serveur
- [ ] Activer l'authentification à deux facteurs
- [ ] Configurer les backups automatiques
- [ ] Mettre en place le monitoring des logs d'audit
- [ ] Tester les scénarios de sécurité (injection, XSS, CSRF)
- [ ] Configurer les alertes de sécurité
- [ ] Documenter la procédure d'incident

### Headers HTTP recommandés

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Support

Pour toute question de sécurité :
- Email : security@marketpro.fr
- Documentation : https://docs.marketpro.fr/security

---

*Dernière mise à jour : Janvier 2025*
*Version : 1.0.0*
