# 🚀 Configuration Supabase pour Market Pro

## 1. Connexion au Dashboard Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet `ewfkiahbrktqiouhnbtk`

## 2. Récupérer les clés API

1. Dans le menu de gauche, cliquez sur **Settings** (⚙️)
2. Cliquez sur **API** dans la section Configuration
3. Copiez les valeurs suivantes :

   - **Project URL** : `https://ewfkiahbrktqiouhnbtk.supabase.co`
   - **anon public** : Une longue clé JWT (commence par `eyJ...`)
   - **service_role** : Pour les opérations admin (NE PAS exposer côté client)

4. Mettez à jour le fichier `.env` avec la vraie clé `anon` :

```env
REACT_APP_SUPABASE_URL=https://ewfkiahbrktqiouhnbtk.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...votre_vraie_cle_anon...
```

## 3. Créer les tables (Schema)

### Option A : Via l'éditeur SQL

1. Dans le menu de gauche, cliquez sur **SQL Editor** (📝)
2. Cliquez sur **New query**
3. Copiez le contenu du fichier `supabase/schema.sql`
4. Cliquez sur **Run** (▶️)

### Option B : Table par table via l'interface

Créez les tables dans l'ordre suivant via **Table Editor** :

1. `profiles`
2. `suppliers`
3. `products`
4. `clients`
5. `orders`
6. `order_items`
7. `invoices`
8. `invoice_items`
9. `payments`
10. `stock_movements`
11. `audit_logs`

## 4. Configurer l'authentification

### 4.1 Providers
1. **Authentication** → **Providers**
2. Activez **Email** (déjà actif par défaut)

### 4.2 Email Templates (optionnel)
1. **Authentication** → **Email Templates**
2. Personnalisez les emails en français

### 4.3 URL Configuration
1. **Authentication** → **URL Configuration**
2. Site URL : `http://localhost:3000` (dev) ou votre URL de production
3. Redirect URLs : Ajoutez `http://localhost:3000/auth/callback`

## 5. Configurer le Storage (optionnel)

Pour stocker les images produits et PDFs de factures :

1. **Storage** → **New bucket**
2. Créez les buckets :
   - `products` (public) - pour les images produits
   - `invoices` (private) - pour les PDFs de factures
   - `documents` (private) - pour les documents divers

## 6. Row Level Security (RLS)

Les politiques RLS sont incluses dans `schema.sql`. Vérifiez qu'elles sont actives :

1. **Table Editor** → Sélectionnez une table
2. Cliquez sur **RLS** en haut à droite
3. Vérifiez que RLS est **enabled**

## 7. Créer un utilisateur admin

### Via l'éditeur SQL :

```sql
-- 1. Créer l'utilisateur via l'API Auth (ou l'interface)
-- 2. Ensuite, mettre à jour son profil :
UPDATE profiles
SET 
  role = 'ADMIN',
  first_name = 'Admin',
  last_name = 'MarketPro',
  permissions = ARRAY['all']
WHERE email = 'admin@marketpro.fr';
```

### Ou via l'interface :
1. **Authentication** → **Users** → **Add user**
2. Créez l'utilisateur : `admin@marketpro.fr`
3. **Table Editor** → `profiles` → Modifiez le rôle en `ADMIN`

## 8. Tester la connexion

Dans votre terminal, lancez l'application :

```bash
cd /Users/yacinetirichine/Downloads/market-pro
npm start
```

Vérifiez la console du navigateur pour voir si la connexion Supabase fonctionne.

## 9. Problèmes courants

### "Invalid API key"
- Vérifiez que vous utilisez la clé `anon` (pas `service_role`)
- La clé doit être au format JWT (commence par `eyJ`)

### "Permission denied"
- Vérifiez les politiques RLS
- Assurez-vous que l'utilisateur est authentifié

### "Table does not exist"
- Exécutez le script `schema.sql` dans l'éditeur SQL

### CORS errors
- Vérifiez que votre URL est dans la liste des URLs autorisées

## 10. Variables d'environnement finales

```env
# .env
REACT_APP_SUPABASE_URL=https://ewfkiahbrktqiouhnbtk.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...votre_cle_anon_complete...

# Optionnel - Backend Express
REACT_APP_API_URL=http://localhost:3001/api

# App
REACT_APP_NAME=Market Pro
REACT_APP_VERSION=1.0.0
```

## 📁 Structure des fichiers Supabase

```
market-pro/
├── .env                           # Variables d'environnement
├── src/
│   ├── config/
│   │   └── supabase.js           # Configuration client Supabase
│   ├── services/
│   │   └── supabaseService.js    # Services CRUD
│   └── hooks/
│       └── useSupabase.js        # Hooks React
└── supabase/
    └── schema.sql                # Script de création des tables
```

## 🔗 Liens utiles

- [Dashboard Supabase](https://supabase.com/dashboard)
- [Documentation Supabase](https://supabase.com/docs)
- [API Reference](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
