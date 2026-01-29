# 🏪 Market Pro - ERP Agroalimentaire

<div align="center">

![Market Pro Logo](public/logo.png)

**Solution ERP complète pour les grossistes agroalimentaires**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Security](https://img.shields.io/badge/Security-A+-brightgreen.svg)](docs/SECURITY.md)

</div>

---

## 📋 Sommaire

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Architecture](#-architecture)
- [Sécurité](#-sécurité)
- [API](#-api)
- [Contribution](#-contribution)
- [Licence](#-licence)

---

## 🎯 Présentation

**Market Pro** est une solution ERP moderne conçue spécifiquement pour les grossistes du secteur agroalimentaire. Elle offre une gestion complète de l'activité commerciale, de la supply chain et des finances.

### Points forts

- 🎨 **Interface moderne** - Design dark mode élégant et intuitif
- 🔒 **Sécurité renforcée** - Authentification robuste, RBAC, chiffrement
- 📊 **Analytics avancés** - Tableaux de bord temps réel
- 📦 **WMS intégré** - Gestion d'entrepôt complète
- 💰 **Comptabilité** - Facturation, paiements, rapports financiers
- 👥 **Multi-utilisateurs** - 7 rôles avec permissions granulaires

---

## ✨ Fonctionnalités

### 📊 Dashboard
- Vue d'ensemble en temps réel
- KPIs dynamiques
- Graphiques interactifs
- Alertes et notifications

### 📦 Gestion des Stocks
- Inventaire en temps réel
- Alertes de stock bas
- Rotation FIFO/LIFO/FEFO
- Historique des mouvements

### 🛒 Commandes
- Création rapide de commandes
- Suivi du statut
- Validation workflow
- Historique complet

### 🧾 Facturation
- Génération automatique
- Multi-formats (PDF, Excel)
- Relances automatiques
- Gestion des avoirs

### 💳 Paiements
- Multi-modes de paiement
- Rapprochement bancaire
- Échéancier
- Suivi des impayés

### 👥 Clients
- Fiche client complète
- Historique des transactions
- Portail client dédié
- Statistiques par client

### 🏭 Fournisseurs
- Gestion des fournisseurs
- Commandes d'achat
- Évaluation fournisseurs
- Catalogue produits

### 📍 WMS (Entrepôt)
- Cartographie entrepôt
- Picking optimisé
- Inventaire tournant
- Traçabilité lot

### 📈 Rapports
- Rapports personnalisables
- Export multi-formats
- Planification automatique
- Tableaux croisés

### ⚙️ Paramètres
- Configuration système
- Personnalisation
- Intégrations
- Sauvegardes

---

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- npm 9+ ou yarn 1.22+
- Git

### Étapes

```bash
# Cloner le repository
git clone https://github.com/votre-org/market-pro.git
cd market-pro

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Démarrer en développement
npm start
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Comptes de démo

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@marketpro.fr | Admin123! |
| Manager | manager@marketpro.fr | Manager123! |
| Commercial | commercial@marketpro.fr | Commercial123! |

---

## ⚙️ Configuration

### Variables d'environnement

Voir [.env.example](.env.example) pour la liste complète.

```env
# API
REACT_APP_API_URL=http://localhost:3001

# Sécurité
REACT_APP_ENCRYPTION_KEY=your-secret-key
REACT_APP_SESSION_DURATION=28800000

# Features
REACT_APP_ENABLE_2FA=true
```

### Scripts disponibles

```bash
npm start          # Démarrer en mode développement
npm run build      # Build de production
npm test           # Lancer les tests
npm run lint       # Vérifier le code
npm run format     # Formater le code
```

---

## 🏗️ Architecture

```
market-pro/
├── public/                 # Fichiers statiques
├── src/
│   ├── components/        # Composants React
│   │   ├── security/      # Composants de sécurité
│   │   ├── forms/         # Formulaires sécurisés
│   │   └── ui.jsx         # Composants UI réutilisables
│   ├── context/           # Contextes React (Auth, etc.)
│   ├── config/            # Configuration
│   ├── data/              # Données et constantes
│   ├── hooks/             # Hooks personnalisés
│   ├── pages/             # Pages/Vues
│   ├── styles/            # Styles CSS
│   └── utils/             # Utilitaires (sécurité, audit, etc.)
├── docs/                   # Documentation
└── tests/                  # Tests
```

### Stack technique

- **Frontend** : React 18, CSS Custom Properties
- **État** : Context API, Hooks personnalisés
- **Charts** : Recharts
- **Icons** : Lucide React
- **Dates** : date-fns

---

## 🔒 Sécurité

Market Pro implémente une architecture de sécurité robuste :

- ✅ **Authentification** - Sessions JWT-like avec expiration
- ✅ **Autorisation** - RBAC avec 7 rôles et permissions granulaires
- ✅ **Protection XSS** - Sanitisation automatique des entrées
- ✅ **Protection CSRF** - Tokens CSRF sur les formulaires
- ✅ **Rate Limiting** - Protection anti-brute force
- ✅ **Chiffrement** - Données sensibles chiffrées
- ✅ **Audit Trail** - Traçabilité complète des actions

📖 [Documentation sécurité complète](docs/SECURITY.md)

---

## 📡 API

### Endpoints principaux

```
GET    /api/auth/login     # Connexion
POST   /api/auth/logout    # Déconnexion
GET    /api/stocks         # Liste des stocks
POST   /api/orders         # Créer une commande
GET    /api/invoices       # Liste des factures
...
```

📖 Documentation API complète disponible sur `/api/docs`

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commiter les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Pusher la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

### Guidelines

- Suivre les conventions de code existantes
- Ajouter des tests pour les nouvelles fonctionnalités
- Documenter les changements d'API
- Mettre à jour la documentation si nécessaire

---

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Support

- **Email** : support@marketpro.fr
- **Documentation** : https://docs.marketpro.fr
- **Issues** : https://github.com/votre-org/market-pro/issues

---

<div align="center">

**Fait avec ❤️ par l'équipe Market Pro**

© 2025 Market Pro - Tous droits réservés

</div>
